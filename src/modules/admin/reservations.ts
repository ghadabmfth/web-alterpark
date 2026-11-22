import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import type { ReservationStatus } from "@/generated/prisma/enums";
import { db } from "@/server/db/client";
import { writeAudit } from "@/server/audit";
import { enqueue } from "@/modules/notifications/outbox";
import { formatCents } from "@/components/ui/lib/format";
import { formatDateTime } from "@/modules/reservations/domain/stay";
import { canTransition } from "@/modules/reservations/domain/status";
import { executeRefunds, expireSessions, recordRefunds } from "@/modules/payments/service";
import { paymentsConfigured } from "@/modules/payments/stripe";
import { AdminRefusal, ensure, type Actor } from "./guard";
import { dayRange } from "./list";

/*
 * Back-office reservations: search, detail, arrival / departure, staff cancellation with refund,
 * cancellation requests and partial refunds. Every command checks its permission, guards the
 * status in its UPDATE (concurrent staff actions cannot both apply) and writes an audit entry.
 */

export interface ReservationFilters {
  q: string;
  parking: string;
  status: string;
  from: string;
  to: string;
  skip: number;
  take: number;
}

const STATUSES = ["PENDING_PAYMENT", "CONFIRMED", "CHECKED_IN", "COMPLETED", "CANCELLED", "EXPIRED"] as const;

export function reservationWhere(f: Omit<ReservationFilters, "skip" | "take">): Prisma.ReservationWhereInput {
  const where: Prisma.ReservationWhereInput = {};
  if (f.parking) where.parking = { slug: f.parking };
  if ((STATUSES as readonly string[]).includes(f.status)) where.status = f.status as ReservationStatus;
  const range = dayRange(f.from, f.to);
  if (range.gte || range.lt) where.startsAt = range;
  const q = f.q.trim();
  if (q) {
    where.OR = [
      { reference: { contains: q.toUpperCase() } },
      { customerEmail: { contains: q.toLowerCase() } },
      { customerLastName: { contains: q, mode: "insensitive" } },
      { vehiclePlate: { contains: q.toUpperCase().replace(/\s+/g, " ") } },
    ];
  }
  return where;
}

export async function listReservations(actor: Actor, f: ReservationFilters) {
  ensure(actor, "RESERVATION_READ");
  const where = reservationWhere(f);
  const [rows, count] = await Promise.all([
    db().reservation.findMany({ where, orderBy: { startsAt: "desc" }, skip: f.skip, take: f.take, include: { parking: { select: { name: true, timeZone: true } }, offer: { select: { name: true } } } }),
    db().reservation.count({ where }),
  ]);
  return { rows, count };
}

export async function getReservation(actor: Actor, reference: string) {
  ensure(actor, "RESERVATION_READ");
  const r = await db().reservation.findUnique({
    where: { reference },
    include: {
      parking: true,
      offer: true,
      user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
      payments: { orderBy: { createdAt: "asc" }, include: { refunds: { orderBy: { createdAt: "asc" } } } },
      cancellationRequests: { orderBy: { createdAt: "desc" }, include: { requestedBy: { select: { firstName: true, lastName: true } }, decidedBy: { select: { firstName: true, lastName: true } } } },
    },
  });
  if (!r) return null;
  const entityIds = [r.id, ...r.payments.map((p) => p.id), ...r.payments.flatMap((p) => p.refunds.map((x) => x.id))];
  const timeline = await db().auditLog.findMany({
    where: { entityId: { in: entityIds } },
    orderBy: { createdAt: "asc" },
    include: { actor: { select: { firstName: true, lastName: true } } },
    take: 200,
  });
  return { ...r, timeline };
}

async function transition(actor: Actor, id: string, to: "CHECKED_IN" | "COMPLETED") {
  ensure(actor, "RESERVATION_MANAGE");
  const from = to === "CHECKED_IN" ? "CONFIRMED" : "CHECKED_IN";
  await db().$transaction(async (tx) => {
    const { count } = await tx.reservation.updateMany({
      where: { id, status: from },
      data: to === "CHECKED_IN" ? { status: to, checkedInAt: new Date() } : { status: to, completedAt: new Date() },
    });
    if (!count) throw new AdminRefusal(to === "CHECKED_IN" ? "Seule une réservation confirmée peut être marquée « véhicule déposé »." : "Seul un véhicule déposé peut être rendu.");
    await writeAudit({ actorType: "USER", actorId: actor.id, action: to === "CHECKED_IN" ? "reservation.check-in" : "reservation.complete", entityType: "Reservation", entityId: id }, tx);
  });
}

export const checkIn = (actor: Actor, id: string) => transition(actor, id, "CHECKED_IN");
export const complete = (actor: Actor, id: string) => transition(actor, id, "COMPLETED");

/**
 * Staff cancellation of a pending or confirmed booking, with an optional refund (needs
 * PAYMENT_REFUND). Refunds are recorded in the same transaction, then sent to the provider.
 */
export async function staffCancel(actor: Actor, input: { id: string; reason: string; refundCents: number; requestId?: string; note?: string }) {
  ensure(actor, "RESERVATION_CANCEL");
  if (input.refundCents > 0) ensure(actor, "PAYMENT_REFUND");
  const result = await db().$transaction(async (tx) => {
    const r = await tx.reservation.findUnique({ where: { id: input.id }, include: { parking: true, payments: true } });
    if (!r) throw new AdminRefusal("Réservation introuvable.");
    if (!canTransition(r.status, "CANCELLED")) throw new AdminRefusal("Cette réservation ne peut plus être annulée (véhicule déposé, terminée ou déjà annulée).");
    const { count } = await tx.reservation.updateMany({ where: { id: r.id, status: r.status }, data: { status: "CANCELLED", cancelledAt: new Date(), cancellationReason: input.reason, holdExpiresAt: null } });
    if (!count) throw new AdminRefusal("La réservation a changé entre-temps. Rechargez la page.");
    let refundIds: string[] = [];
    if (input.refundCents > 0) {
      const ids = await recordRefunds(tx, { reservationId: r.id, amountCents: input.refundCents, reason: input.reason, requestedById: actor.id });
      if (!ids) throw new AdminRefusal("Le remboursement dépasse le montant encore remboursable.", "refund");
      refundIds = ids;
    }
    if (input.requestId) {
      const decided = await tx.cancellationRequest.updateMany({ where: { id: input.requestId, reservationId: r.id, status: "PENDING" }, data: { status: "APPROVED", decidedById: actor.id, decidedAt: new Date(), decisionNote: input.note || null } });
      if (!decided.count) throw new AdminRefusal("Cette demande a déjà été traitée.");
    }
    await writeAudit({ actorType: "USER", actorId: actor.id, action: "reservation.cancel.staff", entityType: "Reservation", entityId: r.id, metadata: { from: r.status, reason: input.reason, refundCents: input.refundCents, requestId: input.requestId ?? null } }, tx);
    await enqueue(
      {
        template: "reservation.cancelled",
        recipient: r.customerEmail,
        userId: r.userId,
        dedupeKey: `reservation.cancelled:${r.id}`,
        payload: { firstName: r.customerFirstName, reference: r.reference, parking: r.parking.name, startsAt: formatDateTime(r.startsAt.getTime(), r.parking.timeZone), ...(input.refundCents > 0 ? { refund: formatCents(input.refundCents) } : {}) },
      },
      tx,
    );
    const sessions = r.payments.filter((p) => p.status === "PENDING" && p.providerSessionId).map((p) => p.providerSessionId!);
    return { refundIds, sessions };
  });
  if (paymentsConfigured()) {
    await executeRefunds(result.refundIds);
    await expireSessions(result.sessions);
  }
}

export async function rejectCancellationRequest(actor: Actor, input: { requestId: string; note: string }) {
  ensure(actor, "RESERVATION_CANCEL");
  await db().$transaction(async (tx) => {
    const req = await tx.cancellationRequest.findUnique({ where: { id: input.requestId }, include: { reservation: true } });
    if (!req) throw new AdminRefusal("Demande introuvable.");
    const { count } = await tx.cancellationRequest.updateMany({ where: { id: req.id, status: "PENDING" }, data: { status: "REJECTED", decidedById: actor.id, decidedAt: new Date(), decisionNote: input.note } });
    if (!count) throw new AdminRefusal("Cette demande a déjà été traitée.");
    await writeAudit({ actorType: "USER", actorId: actor.id, action: "reservation.cancellation-request.reject", entityType: "Reservation", entityId: req.reservationId, metadata: { requestId: req.id } }, tx);
    await enqueue({ template: "reservation.cancellation-rejected", recipient: req.reservation.customerEmail, userId: req.reservation.userId, dedupeKey: `reservation.cancellation-rejected:${req.id}`, payload: { firstName: req.reservation.customerFirstName, reference: req.reservation.reference, note: input.note } }, tx);
  });
}

/** Partial or full refund without cancelling (goodwill gesture, shortened stay…). */
export async function refundReservation(actor: Actor, input: { id: string; amountCents: number; reason: string }) {
  ensure(actor, "PAYMENT_REFUND");
  const ids = await db().$transaction(async (tx) => {
    const ids = await recordRefunds(tx, { reservationId: input.id, amountCents: input.amountCents, reason: input.reason, requestedById: actor.id });
    if (!ids) throw new AdminRefusal("Le montant dépasse ce qui reste remboursable sur cette réservation.", "amount");
    await writeAudit({ actorType: "USER", actorId: actor.id, action: "reservation.refund", entityType: "Reservation", entityId: input.id, metadata: { amountCents: input.amountCents, reason: input.reason } }, tx);
    return ids;
  });
  if (paymentsConfigured()) await executeRefunds(ids);
}

/** Pending cancellation requests, oldest first (dashboard and reservations page). */
export async function pendingCancellationRequests(actor: Actor, take = 20) {
  ensure(actor, "RESERVATION_READ");
  return db().cancellationRequest.findMany({ where: { status: "PENDING" }, orderBy: { createdAt: "asc" }, take, include: { reservation: { select: { reference: true, startsAt: true, customerFirstName: true, customerLastName: true, parking: { select: { name: true, timeZone: true } } } } } });
}

export async function listPayments(actor: Actor, f: { status: string; from: string; to: string; q: string; skip: number; take: number }) {
  ensure(actor, "PAYMENT_READ");
  const where: Prisma.PaymentWhereInput = {};
  if (["PENDING", "PROCESSING", "SUCCEEDED", "FAILED", "CANCELED", "REQUIRES_ACTION"].includes(f.status)) where.status = f.status as Prisma.PaymentWhereInput["status"];
  const range = dayRange(f.from, f.to);
  if (range.gte || range.lt) where.createdAt = range;
  if (f.q) where.reservation = { reference: { contains: f.q.toUpperCase() } };
  const [rows, count, refunds] = await Promise.all([
    db().payment.findMany({ where, orderBy: { createdAt: "desc" }, skip: f.skip, take: f.take, include: { reservation: { select: { reference: true, customerFirstName: true, customerLastName: true } } } }),
    db().payment.count({ where }),
    db().refund.findMany({ orderBy: { createdAt: "desc" }, take: 20, include: { payment: { select: { reservation: { select: { reference: true } } } }, requestedBy: { select: { firstName: true, lastName: true } } } }),
  ]);
  return { rows, count, refunds };
}
