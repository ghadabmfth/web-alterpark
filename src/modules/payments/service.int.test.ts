import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/server/db/client";
import { FakePaymentProvider } from "@/test/fake-payment-provider";
import { customer, details, fixture, key, stay } from "@/test/booking-fixtures";
import { cancelByCustomer, expireHolds } from "@/modules/reservations/service";
import { setPaymentProviderForTests } from "./stripe";
import { executeRefunds, handlePaymentEvent, resumeCheckout, retryPendingRefunds, startCheckout } from "./service";

let fake: FakePaymentProvider;
beforeEach(() => {
  fake = new FakePaymentProvider();
  setPaymentProviderForTests(fake);
});
afterEach(() => setPaymentProviderForTests(null));

async function booked(capacity = 1, inDays = 10) {
  const { slug } = await fixture({ capacity });
  const user = await customer();
  const r = await startCheckout({ userId: user.id, request: stay(slug, inDays, 2), details, idempotencyKey: key() }, fake);
  if (!r.ok) throw new Error(r.reason);
  const reservation = await db().reservation.findUniqueOrThrow({ where: { reference: r.reference }, include: { payments: true } });
  const sessionId = reservation.payments[0]!.providerSessionId!;
  return { slug, user, reservation, sessionId, url: r.url };
}

const statusOf = async (id: string) => (await db().reservation.findUniqueOrThrow({ where: { id } })).status;

describe("checkout start", () => {
  it("holds the space and opens a session for the server-computed amount", async () => {
    const { reservation, sessionId, url } = await booked();
    expect(reservation.status).toBe("PENDING_PAYMENT");
    expect(url).toContain(sessionId);
    const s = fake.sessions.get(sessionId)!;
    expect(s).toMatchObject({ amountCents: 2500, currency: "EUR", reservationId: reservation.id, idempotencyKey: `checkout:${reservation.id}` });
    expect(s.successUrl).toBe(`https://alterpark.test/compte/reservations/${reservation.reference}?paiement=retour`);
    // The session closes a little after the hold, never before.
    expect(s.expiresAt.getTime()).toBeGreaterThan(reservation.holdExpiresAt!.getTime());
    expect(reservation.payments).toHaveLength(1);
  });

  it("a double click reuses the reservation and the session", async () => {
    const { slug } = await fixture({ capacity: 3 });
    const user = await customer();
    const k = key();
    const input = { userId: user.id, request: stay(slug, 10, 2), details, idempotencyKey: k };
    const [a, b] = await Promise.all([startCheckout(input, fake), startCheckout(input, fake)]);
    expect(a.ok && b.ok && a.url === b.url).toBe(true);
    expect(await db().reservation.count({ where: { idempotencyKey: k } })).toBe(1);
    expect(fake.sessions.size).toBe(1);
  });

  it("is refused when the space is gone, and reports provider outages without charging", async () => {
    const { slug } = await booked(1);
    const other = await customer();
    expect(await startCheckout({ userId: other.id, request: stay(slug, 10, 2), details, idempotencyKey: key() }, fake)).toEqual({ ok: false, reason: "FULL" });
    fake.failCheckout = true;
    const { slug: s2 } = await fixture();
    expect(await startCheckout({ userId: other.id, request: stay(s2, 10, 2), details, idempotencyKey: key() }, fake)).toEqual({ ok: false, reason: "PROVIDER_ERROR" });
  });

  it("resumes the same session while the hold is valid, only for the owner", async () => {
    const { user, reservation, url } = await booked();
    expect(await resumeCheckout(user.id, reservation.reference, fake)).toMatchObject({ ok: true, url });
    const stranger = await customer();
    expect(await resumeCheckout(stranger.id, reservation.reference, fake)).toEqual({ ok: false, reason: "NOT_PAYABLE" });
  });
});

describe("webhooks", () => {
  it("no confirmation without the webhook; the webhook confirms once and sends one e-mail", async () => {
    const { reservation, sessionId } = await booked();
    expect(await statusOf(reservation.id)).toBe("PENDING_PAYMENT");
    const event = fake.completed(sessionId);
    expect(await handlePaymentEvent(event, fake)).toBe("processed");
    expect(await handlePaymentEvent(event, fake)).toBe("duplicate"); // same event delivered twice
    expect(await handlePaymentEvent(fake.completed(sessionId), fake)).toBe("processed"); // same fact, other event id
    expect(await statusOf(reservation.id)).toBe("CONFIRMED");
    const payment = await db().payment.findFirstOrThrow({ where: { reservationId: reservation.id } });
    expect(payment).toMatchObject({ status: "SUCCEEDED", providerPaymentId: `pi_${sessionId}` });
    expect(await db().notification.count({ where: { dedupeKey: `reservation.confirmed:${reservation.id}` } })).toBe(1);
    expect(await db().auditLog.count({ where: { entityId: payment.id, action: "payment.succeeded" } })).toBe(1);
  });

  it("out of order: an expiry after the payment changes nothing; a payment after expiry confirms if space remains", async () => {
    const a = await booked();
    await handlePaymentEvent(fake.completed(a.sessionId), fake);
    await handlePaymentEvent(fake.closed(a.sessionId, "checkout.expired"), fake);
    expect(await statusOf(a.reservation.id)).toBe("CONFIRMED");

    const b = await booked();
    await handlePaymentEvent(fake.closed(b.sessionId, "checkout.expired"), fake);
    expect(await statusOf(b.reservation.id)).toBe("EXPIRED");
    await handlePaymentEvent(fake.completed(b.sessionId), fake);
    expect(await statusOf(b.reservation.id)).toBe("CONFIRMED");
    expect(fake.refunds).toHaveLength(0);
  });

  it("late payment with no space left is refunded in full", async () => {
    const a = await booked(1);
    await handlePaymentEvent(fake.closed(a.sessionId, "checkout.expired"), fake); // space released
    const other = await customer();
    const b = await startCheckout({ userId: other.id, request: stay(a.slug, 10, 2), details, idempotencyKey: key() }, fake);
    expect(b.ok).toBe(true); // someone else took the space
    await handlePaymentEvent(fake.completed(a.sessionId), fake);
    expect(await statusOf(a.reservation.id)).toBe("EXPIRED");
    expect(fake.refunds).toMatchObject([{ amountCents: 2500, reservationId: a.reservation.id }]);
    expect((await db().reservation.findUniqueOrThrow({ where: { id: a.reservation.id } })).refundedCents).toBe(2500);
  });

  it("a wrong amount is never confirmed and is refunded", async () => {
    const a = await booked();
    await handlePaymentEvent(fake.completed(a.sessionId, { amountCents: 100 }), fake);
    expect(await statusOf(a.reservation.id)).toBe("PENDING_PAYMENT");
    expect(fake.refunds).toHaveLength(1);
    expect(await db().auditLog.count({ where: { action: "payment.amount-mismatch", entityId: a.reservation.payments[0]!.id } })).toBe(1);
  });

  it("delayed methods wait; a failed payment releases the space at once", async () => {
    const a = await booked(1);
    await handlePaymentEvent(fake.completed(a.sessionId, { paid: false }), fake);
    expect(await statusOf(a.reservation.id)).toBe("PENDING_PAYMENT");
    expect((await db().payment.findFirstOrThrow({ where: { reservationId: a.reservation.id } })).status).toBe("PROCESSING");
    await handlePaymentEvent(fake.closed(a.sessionId, "checkout.failed"), fake);
    expect(await statusOf(a.reservation.id)).toBe("CANCELLED");
    const other = await customer();
    expect((await startCheckout({ userId: other.id, request: stay(a.slug, 10, 2), details, idempotencyKey: key() }, fake)).ok).toBe(true);
  });

  it("events for unknown sessions are ignored and recorded once", async () => {
    const event = { kind: "checkout.expired" as const, type: "checkout.session.expired", eventId: `evt_${key()}`, sessionId: "cs_unknown", reservationId: null };
    expect(await handlePaymentEvent(event, fake)).toBe("ignored");
    expect(await handlePaymentEvent(event, fake)).toBe("duplicate");
  });

  it("a processing error marks the event FAILED and the retry processes it", async () => {
    const a = await booked();
    const event = fake.completed(a.sessionId);
    // Simulate a transient database error on the first attempt.
    const spy = vi.spyOn(db(), "$transaction").mockRejectedValueOnce(new Error("transient"));
    try {
      await expect(handlePaymentEvent(event, fake)).rejects.toThrow("transient");
    } finally {
      spy.mockRestore();
    }
    expect((await db().paymentWebhookEvent.findFirstOrThrow({ where: { eventId: event.eventId } })).status).toBe("FAILED");
    expect(await handlePaymentEvent(event, fake)).toBe("processed");
    expect(await statusOf(a.reservation.id)).toBe("CONFIRMED");
  });
});

describe("cancellation and refunds", () => {
  it("free cancellation refunds in full, exactly once", async () => {
    const a = await booked(1, 10);
    await handlePaymentEvent(fake.completed(a.sessionId), fake);
    const res = await cancelByCustomer({ userId: a.user.id, reference: a.reservation.reference });
    if (!res.ok) throw new Error(res.reason);
    await executeRefunds(res.refundIds, fake);
    await executeRefunds(res.refundIds, fake); // retried: no second refund
    expect(fake.refunds).toHaveLength(1);
    const r = await db().reservation.findUniqueOrThrow({ where: { id: a.reservation.id } });
    expect(r).toMatchObject({ status: "CANCELLED", refundedCents: 2500 });
    // The provider's refund.updated event for it is then a no-op.
    const refund = await db().refund.findFirstOrThrow({ where: { paymentId: a.reservation.payments[0]!.id } });
    await handlePaymentEvent({ kind: "refund.updated", type: "refund.updated", eventId: `evt_${key()}`, providerRefundId: refund.providerRefundId!, refundId: refund.id, status: "SUCCEEDED", failureReason: null }, fake);
    expect((await db().reservation.findUniqueOrThrow({ where: { id: a.reservation.id } })).refundedCents).toBe(2500);
  });

  it("a refund the provider could not take is retried by the cron", async () => {
    const a = await booked(1, 10);
    await handlePaymentEvent(fake.completed(a.sessionId), fake);
    fake.failRefund = true;
    const res = await cancelByCustomer({ userId: a.user.id, reference: a.reservation.reference });
    if (!res.ok) throw new Error(res.reason);
    await executeRefunds(res.refundIds, fake);
    expect(fake.refunds).toHaveLength(0);
    await db().refund.updateMany({ where: { id: { in: res.refundIds } }, data: { createdAt: new Date(Date.now() - 120_000) } });
    fake.failRefund = false;
    expect(await retryPendingRefunds(fake)).toBeGreaterThanOrEqual(1);
    expect(fake.refunds.filter((r) => res.refundIds.includes(r.refundId))).toHaveLength(1);
    expect((await db().reservation.findUniqueOrThrow({ where: { id: a.reservation.id } })).refundedCents).toBe(2500);
  });

  it("a pending refund (bank delay) completes on the provider event", async () => {
    const a = await booked(1, 10);
    await handlePaymentEvent(fake.completed(a.sessionId), fake);
    fake.refundStatus = "PENDING";
    const res = await cancelByCustomer({ userId: a.user.id, reference: a.reservation.reference });
    if (!res.ok) throw new Error(res.reason);
    await executeRefunds(res.refundIds, fake);
    expect((await db().reservation.findUniqueOrThrow({ where: { id: a.reservation.id } })).refundedCents).toBe(0);
    const refund = await db().refund.findUniqueOrThrow({ where: { id: res.refundIds[0] } });
    await handlePaymentEvent({ kind: "refund.updated", type: "refund.updated", eventId: `evt_${key()}`, providerRefundId: refund.providerRefundId!, refundId: refund.id, status: "SUCCEEDED", failureReason: null }, fake);
    expect((await db().reservation.findUniqueOrThrow({ where: { id: a.reservation.id } })).refundedCents).toBe(2500);
  });

  it("abandoning a pending payment closes its session", async () => {
    const a = await booked();
    const res = await cancelByCustomer({ userId: a.user.id, reference: a.reservation.reference });
    expect(res).toMatchObject({ ok: true, sessionsToExpire: [a.sessionId] });
    await expireHolds();
  });
});
