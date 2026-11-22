import "server-only";
import { db } from "@/server/db/client";
import { writeAudit } from "@/server/audit";
import { absoluteUrl } from "@/config/site";
import { formatDateTime } from "@/modules/reservations/domain/stay";
import { confirmReservation, createHold, type HoldDetails, type QuoteFailure, type StayRequest } from "@/modules/reservations/service";
import type { PaymentEvent, PaymentProvider } from "./provider";
import { paymentProvider } from "./stripe";

/*
 * Payment workflows (ARCHITECTURE.md §5.4, ADR-009).
 * - startCheckout: hold a space (Phase 5 createHold, row lock) and open a hosted checkout session
 *   for the amount computed by the server.
 * - handlePaymentEvent: the ONLY path to a confirmed reservation. Events are recorded once
 *   (provider + event id) and every step is idempotent, so duplicates and out-of-order deliveries
 *   are harmless.
 * - executeRefunds / retryPendingRefunds: refunds recorded first, executed with an idempotency key.
 */

/** Stripe needs a session to live ≥ 30 min; it is closed a little after the hold expires. */
const SESSION_GRACE_MS = 2 * 60_000;

const accountUrl = (reference: string, state: "retour" | "annule") => absoluteUrl(`/compte/reservations/${reference}?paiement=${state}`);

export type CheckoutResult =
  | { ok: true; url: string; reference: string }
  | QuoteFailure
  | { ok: false; reason: "IDEMPOTENCY_CONFLICT" | "INVALID_KEY" | "NOT_PAYABLE" | "PROVIDER_ERROR" };

async function openSession(reservationId: string, provider: PaymentProvider): Promise<CheckoutResult> {
  const r = await db().reservation.findUniqueOrThrow({ where: { id: reservationId }, include: { parking: true, offer: true } });
  if (r.status !== "PENDING_PAYMENT" || !r.holdExpiresAt || r.holdExpiresAt <= new Date()) return { ok: false, reason: "NOT_PAYABLE" };
  const tz = r.parking.timeZone;
  let session: { sessionId: string; url: string };
  try {
    session = await provider.createCheckout({
      reservationId: r.id,
      reference: r.reference,
      amountCents: r.totalCents,
      currency: r.currency,
      label: `${r.parking.name} — ${r.offer.name}`,
      description: `Réservation ${r.reference} : du ${formatDateTime(r.startsAt.getTime(), tz)} au ${formatDateTime(r.endsAt.getTime(), tz)} (${r.billedDays} j), véhicule ${r.vehiclePlate}`,
      customerEmail: r.customerEmail,
      successUrl: accountUrl(r.reference, "retour"),
      cancelUrl: accountUrl(r.reference, "annule"),
      // Derived from the stored hold: a retry sends identical parameters (provider idempotency).
      expiresAt: new Date(r.holdExpiresAt.getTime() + SESSION_GRACE_MS),
      idempotencyKey: `checkout:${r.id}`,
    });
  } catch (e) {
    console.error("payment: createCheckout failed", e);
    await writeAudit({ actorType: "SYSTEM", action: "payment.checkout-error", entityType: "Reservation", entityId: r.id });
    return { ok: false, reason: "PROVIDER_ERROR" };
  }
  // INSERT … ON CONFLICT DO NOTHING: two concurrent retries get the same session from the provider.
  await db().payment.createMany({
    data: [{ reservationId: r.id, provider: provider.name, providerSessionId: session.sessionId, amountCents: r.totalCents, currency: r.currency, status: "PENDING" }],
    skipDuplicates: true,
  });
  return { ok: true, url: session.url, reference: r.reference };
}

export async function startCheckout(input: { userId: string; request: StayRequest; details: HoldDetails; idempotencyKey: string }, provider: PaymentProvider = paymentProvider()): Promise<CheckoutResult> {
  const hold = await createHold(input);
  if (!hold.ok) return hold;
  if (hold.replayed) {
    // A double click or a retry: same reservation; reopen its session if it can still be paid.
    const r = await db().reservation.findUniqueOrThrow({ where: { id: hold.reservationId }, select: { status: true } });
    if (r.status !== "PENDING_PAYMENT") return { ok: false, reason: "NOT_PAYABLE" };
  } else {
    await writeAudit({ actorType: "USER", actorId: input.userId, action: "payment.checkout-start", entityType: "Reservation", entityId: hold.reservationId, metadata: { totalCents: hold.totalCents } });
  }
  return openSession(hold.reservationId, provider);
}

/** « Reprendre le paiement » from the customer area, while the hold is still valid. */
export async function resumeCheckout(userId: string, reference: string, provider: PaymentProvider = paymentProvider()): Promise<CheckoutResult> {
  const r = await db().reservation.findFirst({ where: { userId, reference }, select: { id: true } });
  if (!r) return { ok: false, reason: "NOT_PAYABLE" };
  return openSession(r.id, provider);
}

/* ---------------------------------------------------------------- webhooks */

export type EventOutcome = "processed" | "duplicate" | "ignored";

/**
 * Records then processes a verified provider event. A row already PROCESSED or IGNORED → duplicate.
 * On error the row is marked FAILED and the error rethrown: the provider retries later.
 */
export async function handlePaymentEvent(event: PaymentEvent, provider: PaymentProvider = paymentProvider()): Promise<EventOutcome> {
  // Concurrent deliveries of one event: ON CONFLICT DO NOTHING, then read the single row.
  await db().paymentWebhookEvent.createMany({ data: [{ provider: provider.name, eventId: event.eventId, type: event.type }], skipDuplicates: true });
  const row = await db().paymentWebhookEvent.findUniqueOrThrow({ where: { provider_eventId: { provider: provider.name, eventId: event.eventId } } });
  if (row.status === "PROCESSED" || row.status === "IGNORED") return "duplicate";
  try {
    const outcome = await dispatch(event, provider);
    await db().paymentWebhookEvent.update({ where: { id: row.id }, data: { status: outcome === "ignored" ? "IGNORED" : "PROCESSED", processedAt: new Date(), error: null } });
    return outcome;
  } catch (e) {
    await db().paymentWebhookEvent.update({ where: { id: row.id }, data: { status: "FAILED", error: String(e instanceof Error ? e.message : e).slice(0, 1000) } });
    throw e;
  }
}

async function dispatch(event: PaymentEvent, provider: PaymentProvider): Promise<"processed" | "ignored"> {
  switch (event.kind) {
    case "checkout.completed":
      return onCompleted(event, provider);
    case "checkout.failed":
    case "checkout.expired":
      return onClosed(event);
    case "refund.updated":
      return onRefund(event);
    default:
      return "ignored";
  }
}

async function paymentForSession(sessionId: string) {
  return db().payment.findUnique({ where: { providerSessionId: sessionId }, include: { reservation: true } });
}

async function onCompleted(e: Extract<PaymentEvent, { kind: "checkout.completed" }>, provider: PaymentProvider): Promise<"processed" | "ignored"> {
  const payment = await paymentForSession(e.sessionId);
  if (!payment) return "ignored"; // not one of ours (another integration on the same account)
  if (!e.paid) {
    // Delayed payment method: wait for async_payment_succeeded / failed.
    await db().payment.updateMany({ where: { id: payment.id, status: "PENDING" }, data: { status: "PROCESSING", providerPaymentId: e.providerPaymentId } });
    return "processed";
  }

  const firstTime = await db().$transaction(async (tx) => {
    const { count } = await tx.payment.updateMany({
      where: { id: payment.id, status: { not: "SUCCEEDED" } },
      data: { status: "SUCCEEDED", providerPaymentId: e.providerPaymentId, succeededAt: new Date() },
    });
    if (count) await writeAudit({ actorType: "WEBHOOK", action: "payment.succeeded", entityType: "Payment", entityId: payment.id, metadata: { reservationId: payment.reservationId, amountCents: e.amountCents } }, tx);
    return count === 1;
  });
  if (!firstTime) return "processed";

  // The amount charged must be the one computed by the server.
  if (e.amountCents !== payment.amountCents || (e.currency ?? "").toUpperCase() !== payment.currency) {
    await writeAudit({ actorType: "WEBHOOK", action: "payment.amount-mismatch", entityType: "Payment", entityId: payment.id, metadata: { expected: payment.amountCents, received: e.amountCents, currency: e.currency } });
    await refundFull(payment.id, "Montant incohérent", provider);
    return "processed";
  }

  const confirmed = await confirmReservation(payment.reservationId, { actorType: "WEBHOOK" });
  if (!confirmed.ok) {
    // Late payment with no space left, or booking cancelled meanwhile: the customer is refunded.
    await refundFull(payment.id, confirmed.reason === "NO_CAPACITY" ? "Paiement tardif : plus de place disponible" : "Réservation non confirmable", provider);
  }
  return "processed";
}

async function onClosed(e: Extract<PaymentEvent, { kind: "checkout.failed" | "checkout.expired" }>): Promise<"processed" | "ignored"> {
  const payment = await paymentForSession(e.sessionId);
  if (!payment) return "ignored";
  await db().$transaction(async (tx) => {
    // Never downgrade a payment that already succeeded (events can arrive out of order).
    const { count } = await tx.payment.updateMany({
      where: { id: payment.id, status: { in: ["PENDING", "PROCESSING", "REQUIRES_ACTION"] } },
      data: { status: e.kind === "checkout.failed" ? "FAILED" : "CANCELED" },
    });
    if (!count) return;
    // The space is released at once instead of waiting for the hold to run out.
    const released = await tx.reservation.updateMany({
      where: { id: payment.reservationId, status: "PENDING_PAYMENT" },
      data: e.kind === "checkout.failed" ? { status: "CANCELLED", cancelledAt: new Date(), cancellationReason: "Paiement refusé", holdExpiresAt: null } : { status: "EXPIRED", holdExpiresAt: null },
    });
    await writeAudit({ actorType: "WEBHOOK", action: e.kind === "checkout.failed" ? "payment.failed" : "payment.expired", entityType: "Payment", entityId: payment.id, metadata: { reservationReleased: released.count === 1 } }, tx);
  });
  return "processed";
}

async function onRefund(e: Extract<PaymentEvent, { kind: "refund.updated" }>): Promise<"processed" | "ignored"> {
  const refund = await db().refund.findFirst({ where: e.refundId ? { OR: [{ id: e.refundId }, { providerRefundId: e.providerRefundId }] } : { providerRefundId: e.providerRefundId } });
  if (!refund) return "ignored"; // refunded from the Stripe dashboard: reconciled in Phase 7
  await applyRefundStatus(refund.id, e.providerRefundId, e.status);
  return "processed";
}

/* ---------------------------------------------------------------- refunds */

/** Moves a refund to its new status; amounts are added to payment and reservation exactly once. */
async function applyRefundStatus(refundId: string, providerRefundId: string, status: "PENDING" | "SUCCEEDED" | "FAILED" | "CANCELED") {
  await db().$transaction(async (tx) => {
    const r = await tx.refund.findUniqueOrThrow({ where: { id: refundId }, include: { payment: true } });
    if (r.status === "SUCCEEDED") {
      if (!r.providerRefundId) await tx.refund.update({ where: { id: r.id }, data: { providerRefundId } });
      return;
    }
    await tx.refund.update({ where: { id: r.id }, data: { status, providerRefundId } });
    if (status === "SUCCEEDED") {
      await tx.payment.update({ where: { id: r.paymentId }, data: { refundedCents: { increment: r.amountCents } } });
      await tx.reservation.update({ where: { id: r.payment.reservationId }, data: { refundedCents: { increment: r.amountCents } } });
      await writeAudit({ actorType: "SYSTEM", action: "refund.succeeded", entityType: "Refund", entityId: r.id, metadata: { amountCents: r.amountCents, reservationId: r.payment.reservationId } }, tx);
    } else if (status === "FAILED" || status === "CANCELED") {
      await writeAudit({ actorType: "SYSTEM", action: "refund.failed", entityType: "Refund", entityId: r.id, metadata: { status } }, tx);
    }
  });
}

async function refundFull(paymentId: string, reason: string, provider: PaymentProvider) {
  const p = await db().payment.findUniqueOrThrow({ where: { id: paymentId } });
  const open = await db().refund.findFirst({ where: { paymentId, status: { in: ["PENDING", "SUCCEEDED"] } } });
  if (open || p.amountCents <= p.refundedCents) return;
  const refund = await db().refund.create({ data: { paymentId, amountCents: p.amountCents - p.refundedCents, currency: p.currency, reason } });
  await executeRefunds([refund.id], provider);
}

/** Sends recorded refunds to the provider. Failures stay PENDING and are retried by the cron. */
export async function executeRefunds(refundIds: string[], provider: PaymentProvider = paymentProvider()): Promise<void> {
  for (const id of refundIds) {
    const r = await db().refund.findUniqueOrThrow({ where: { id }, include: { payment: true } });
    if (r.status !== "PENDING" || r.providerRefundId) continue;
    if (!r.payment.providerPaymentId) {
      console.error("refund: payment without provider id", r.paymentId);
      continue;
    }
    try {
      const res = await provider.refund({ providerPaymentId: r.payment.providerPaymentId, amountCents: r.amountCents, refundId: r.id, reservationId: r.payment.reservationId, idempotencyKey: `refund:${r.id}` });
      await applyRefundStatus(r.id, res.providerRefundId, res.status);
    } catch (e) {
      console.error("refund: provider call failed, will retry", r.id, e);
    }
  }
}

/** Cron: refunds recorded but not yet accepted by the provider. */
export async function retryPendingRefunds(provider?: PaymentProvider): Promise<number> {
  const due = await db().refund.findMany({ where: { status: "PENDING", providerRefundId: null, createdAt: { lt: new Date(Date.now() - 60_000) } }, select: { id: true }, take: 50 });
  if (due.length) await executeRefunds(due.map((r) => r.id), provider ?? paymentProvider());
  return due.length;
}

export async function expireSessions(sessionIds: string[], provider: PaymentProvider = paymentProvider()): Promise<void> {
  for (const id of sessionIds) await provider.expireCheckout(id).catch((e) => console.error("payment: expire session failed", id, e));
}
