import "server-only";
import { Prisma } from "@/generated/prisma/client";
import type { ReservationStatus } from "@/generated/prisma/enums";
import { db } from "@/server/db/client";
import { writeAudit } from "@/server/audit";
import { enqueue } from "@/modules/notifications/outbox";
import { formatCents } from "@/components/ui/lib/format";
import { priceStay, type PriceResult, type RateRow } from "@/modules/pricing/domain/price";
import { peakOccupancy } from "@/modules/availability/domain/occupancy";
import { formatDateTime, utcToZoned, validateStay, type StayErrors, type ValidStay, type WallClock } from "./domain/stay";
import { newReference } from "./domain/reference";
import { canTransition } from "./domain/status";
import { cancellationOption } from "./domain/cancellation";

/*
 * Reservation services (ARCHITECTURE.md §5, ADR-010). Everything the customer sends is re-checked
 * here: the site and offer must be bookable, the stay is validated with the site's rules in its
 * time zone, the price comes from the database and capacity is checked under a row lock on the
 * offer, so two concurrent bookings of the last space cannot both succeed.
 */

type Tx = Prisma.TransactionClient;

export interface StayRequest {
  parkingSlug: string;
  offerCode: string;
  departure: WallClock;
  ret: WallClock;
}

export interface Quote {
  parking: { id: string; slug: string; name: string; airportCode: string; timeZone: string; holdTtlMinutes: number };
  offer: { id: string; code: string; name: string; capacity: number };
  stay: ValidStay;
  price: PriceResult;
  remaining: number;
}

export type QuoteFailure =
  | { ok: false; reason: "NOT_BOOKABLE" }
  | { ok: false; reason: "INVALID_STAY"; errors: StayErrors }
  | { ok: false; reason: "NO_PRICE" }
  | { ok: false; reason: "FULL" };

const toDateString = (d: Date) => d.toISOString().slice(0, 10);

async function loadContext(tx: Tx, parkingSlug: string, offerCode: string) {
  return tx.parking.findFirst({
    where: { slug: parkingSlug, status: "ACTIVE", archivedAt: null },
    include: {
      offers: {
        where: { code: offerCode, isActive: true, archivedAt: null, capacity: { gt: 0 } },
        include: { prices: { where: { isActive: true } } },
      },
    },
  });
}

/** Intervals of the reservations of an offer that take a space and overlap [from, to). */
async function occupied(tx: Tx, offerId: string, from: Date, to: Date, now: Date, excludeId?: string) {
  const rows = await tx.reservation.findMany({
    where: {
      offerId,
      startsAt: { lt: to },
      endsAt: { gt: from },
      ...(excludeId ? { id: { not: excludeId } } : {}),
      OR: [{ status: { in: ["CONFIRMED", "CHECKED_IN"] } }, { status: "PENDING_PAYMENT", holdExpiresAt: { gt: now } }],
    },
    select: { startsAt: true, endsAt: true },
  });
  return rows.map((r) => ({ start: r.startsAt.getTime(), end: r.endsAt.getTime() }));
}

/** Serialises every capacity decision on one offer (ADR-010). */
async function lockOffer(tx: Tx, offerId: string) {
  await tx.$queryRaw`SELECT "id" FROM "ParkingOffer" WHERE "id" = ${offerId}::uuid FOR UPDATE`;
}

async function computeQuote(tx: Tx, req: StayRequest, now: Date, lock: boolean): Promise<{ ok: true; quote: Quote } | QuoteFailure> {
  const parking = await loadContext(tx, req.parkingSlug, req.offerCode);
  const offer = parking?.offers[0];
  if (!parking || !offer) return { ok: false, reason: "NOT_BOOKABLE" };

  const { errors, stay } = validateStay(req.departure, req.ret, {
    now: now.getTime(),
    timeZone: parking.timeZone,
    minLeadMinutes: parking.minLeadMinutes,
    maxStayDays: parking.maxStayDays,
    horizonDays: parking.bookingHorizonDays,
  });
  if (!stay) return { ok: false, reason: "INVALID_STAY", errors };

  const rates: RateRow[] = offer.prices.map((p) => ({
    id: p.id,
    validFrom: toDateString(p.validFrom),
    validTo: p.validTo ? toDateString(p.validTo) : null,
    minDays: p.minDays,
    maxDays: p.maxDays,
    mode: p.mode,
    amountCents: p.amountCents,
    extraDayCents: p.extraDayCents,
    priority: p.priority,
    currency: p.currency,
  }));
  // Rates are chosen by the arrival date in the site's local calendar.
  const price = priceStay(rates, utcToZoned(stay.startUtc, parking.timeZone).date, stay.days);
  if (!price) return { ok: false, reason: "NO_PRICE" };

  if (lock) await lockOffer(tx, offer.id);
  const intervals = await occupied(tx, offer.id, new Date(stay.startUtc), new Date(stay.endUtc), now);
  const remaining = offer.capacity - peakOccupancy(intervals, stay.startUtc, stay.endUtc);
  if (remaining < 1) return { ok: false, reason: "FULL" };

  return {
    ok: true,
    quote: {
      parking: { id: parking.id, slug: parking.slug, name: parking.name, airportCode: parking.airportCode, timeZone: parking.timeZone, holdTtlMinutes: parking.holdTtlMinutes },
      offer: { id: offer.id, code: offer.code, name: offer.name, capacity: offer.capacity },
      stay,
      price,
      remaining,
    },
  };
}

/** Price and availability for a stay, without holding anything (funnel step 1). */
export async function quoteStay(req: StayRequest, now = new Date()) {
  return computeQuote(db() as unknown as Tx, req, now, false);
}

/* ---------------------------------------------------------------- hold */

export interface HoldDetails {
  plate: string;
  passengers: number;
  outboundFlight: string;
  returnFlight: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  customerNote?: string;
}

export const IDEMPOTENCY_KEY_RE = /^[A-Za-z0-9_-]{16,64}$/;

export type HoldResult =
  | { ok: true; reservationId: string; reference: string; totalCents: number; currency: string; holdExpiresAt: Date; replayed: boolean }
  | QuoteFailure
  | { ok: false; reason: "IDEMPOTENCY_CONFLICT" | "INVALID_KEY" };

const uniqueTarget = (e: unknown): string =>
  e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002" ? JSON.stringify(e.meta ?? {}) + e.message : "";

async function replay(userId: string, idempotencyKey: string): Promise<HoldResult | null> {
  const r = await db().reservation.findUnique({ where: { idempotencyKey } });
  if (!r) return null;
  if (r.userId !== userId) return { ok: false, reason: "IDEMPOTENCY_CONFLICT" };
  return { ok: true, reservationId: r.id, reference: r.reference, totalCents: r.totalCents, currency: r.currency, holdExpiresAt: r.holdExpiresAt ?? r.createdAt, replayed: true };
}

/**
 * Creates a PENDING_PAYMENT reservation holding one space until `holdExpiresAt` (Phase 6 opens the
 * Stripe Checkout session right after). Idempotent per `idempotencyKey`: a double click or a
 * network retry returns the same reservation.
 */
export async function createHold(input: { userId: string; request: StayRequest; details: HoldDetails; idempotencyKey: string; now?: Date }): Promise<HoldResult> {
  const now = input.now ?? new Date();
  if (!IDEMPOTENCY_KEY_RE.test(input.idempotencyKey)) return { ok: false, reason: "INVALID_KEY" };
  const previous = await replay(input.userId, input.idempotencyKey);
  if (previous) return previous;

  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      return await db().$transaction(async (tx) => {
        const q = await computeQuote(tx, input.request, now, true);
        if (!q.ok) return q;
        const { quote } = q;
        const d = input.details;
        // ON CONFLICT DO NOTHING: two bookings of the same car on different offers may run at once.
        await tx.vehicle.createMany({ data: [{ userId: input.userId, plate: d.plate }], skipDuplicates: true });
        const vehicle = await tx.vehicle.update({ where: { userId_plate: { userId: input.userId, plate: d.plate } }, data: { deletedAt: null } });
        const holdExpiresAt = new Date(now.getTime() + quote.parking.holdTtlMinutes * 60_000);
        const r = await tx.reservation.create({
          data: {
            reference: newReference(quote.parking.airportCode),
            userId: input.userId,
            parkingId: quote.parking.id,
            offerId: quote.offer.id,
            priceId: quote.price.rateId,
            vehicleId: vehicle.id,
            status: "PENDING_PAYMENT",
            startsAt: new Date(quote.stay.startUtc),
            endsAt: new Date(quote.stay.endUtc),
            billedDays: quote.stay.days,
            passengers: d.passengers,
            outboundFlight: d.outboundFlight || null,
            returnFlight: d.returnFlight || null,
            customerNote: d.customerNote || null,
            customerFirstName: d.firstName,
            customerLastName: d.lastName,
            customerEmail: d.email,
            customerPhone: d.phone,
            vehiclePlate: d.plate,
            priceSnapshot: { ...quote.price.breakdown, currency: quote.price.currency, parking: quote.parking.name, offer: quote.offer.name } as unknown as Prisma.InputJsonValue,
            totalCents: quote.price.totalCents,
            currency: quote.price.currency,
            holdExpiresAt,
            idempotencyKey: input.idempotencyKey,
          },
        });
        await writeAudit({ actorType: "USER", actorId: input.userId, action: "reservation.hold", entityType: "Reservation", entityId: r.id, metadata: { reference: r.reference, totalCents: r.totalCents, holdExpiresAt: holdExpiresAt.toISOString() } }, tx);
        return { ok: true as const, reservationId: r.id, reference: r.reference, totalCents: r.totalCents, currency: r.currency, holdExpiresAt, replayed: false };
      });
    } catch (e) {
      const target = uniqueTarget(e);
      if (target.includes("idempotencyKey")) return (await replay(input.userId, input.idempotencyKey))!;
      if (target.includes("reference")) continue; // 1 in a billion: draw another reference
      throw e;
    }
  }
  throw new Error("Could not allocate a unique reservation reference");
}

/* ---------------------------------------------------------------- expiry, confirmation */

/** Cron: marks holds whose time is up as EXPIRED (availability already ignores them). */
export async function expireHolds(now = new Date()): Promise<number> {
  const due = await db().reservation.findMany({ where: { status: "PENDING_PAYMENT", holdExpiresAt: { lte: now } }, select: { id: true }, take: 500 });
  if (!due.length) return 0;
  const ids = due.map((r) => r.id);
  return db().$transaction(async (tx) => {
    const { count } = await tx.reservation.updateMany({ where: { id: { in: ids }, status: "PENDING_PAYMENT", holdExpiresAt: { lte: now } }, data: { status: "EXPIRED" } });
    await tx.auditLog.createMany({ data: ids.map((id) => ({ actorType: "SYSTEM" as const, action: "reservation.expire", entityType: "Reservation", entityId: id })) });
    return count;
  });
}

export type ConfirmResult =
  | { ok: true; alreadyConfirmed: boolean; reference: string }
  | { ok: false; reason: "NOT_FOUND" | "INVALID_STATUS" | "NO_CAPACITY"; status?: ReservationStatus };

/**
 * PENDING_PAYMENT → CONFIRMED once the payment is verified (Phase 6: webhook only). A payment that
 * arrives after the hold expired confirms only if a space is still free; otherwise the caller
 * refunds (Phase 6). Idempotent.
 */
export async function confirmReservation(reservationId: string, opts: { now?: Date; actorType?: "SYSTEM" | "WEBHOOK" } = {}): Promise<ConfirmResult> {
  const now = opts.now ?? new Date();
  const head = await db().reservation.findUnique({ where: { id: reservationId }, select: { offerId: true } });
  if (!head) return { ok: false, reason: "NOT_FOUND" };
  return db().$transaction(async (tx) => {
    await lockOffer(tx, head.offerId);
    const r = await tx.reservation.findUniqueOrThrow({ where: { id: reservationId }, include: { parking: true, offer: true } });
    if (r.status === "CONFIRMED") return { ok: true as const, alreadyConfirmed: true, reference: r.reference };
    if (!canTransition(r.status, "CONFIRMED")) return { ok: false as const, reason: "INVALID_STATUS" as const, status: r.status };
    const holdValid = r.status === "PENDING_PAYMENT" && r.holdExpiresAt !== null && r.holdExpiresAt > now;
    if (!holdValid) {
      const intervals = await occupied(tx, r.offerId, r.startsAt, r.endsAt, now, r.id);
      if (r.offer.capacity - peakOccupancy(intervals, r.startsAt.getTime(), r.endsAt.getTime()) < 1) {
        await writeAudit({ actorType: opts.actorType ?? "SYSTEM", action: "reservation.confirm.no-capacity", entityType: "Reservation", entityId: r.id, metadata: { status: r.status } }, tx);
        return { ok: false as const, reason: "NO_CAPACITY" as const };
      }
    }
    await tx.reservation.update({ where: { id: r.id }, data: { status: "CONFIRMED", confirmedAt: now, holdExpiresAt: null } });
    await writeAudit({ actorType: opts.actorType ?? "SYSTEM", action: "reservation.confirm", entityType: "Reservation", entityId: r.id, metadata: { from: r.status, late: !holdValid } }, tx);
    await enqueue(
      {
        template: "reservation.confirmed",
        recipient: r.customerEmail,
        userId: r.userId,
        dedupeKey: `reservation.confirmed:${r.id}`,
        payload: {
          firstName: r.customerFirstName,
          reference: r.reference,
          parking: r.parking.name,
          offer: r.offer.name,
          startsAt: formatDateTime(r.startsAt.getTime(), r.parking.timeZone),
          endsAt: formatDateTime(r.endsAt.getTime(), r.parking.timeZone),
          total: formatCents(r.totalCents),
        },
      },
      tx,
    );
    return { ok: true as const, alreadyConfirmed: false, reference: r.reference };
  });
}

/* ---------------------------------------------------------------- customer reads and cancellation */

const customerInclude = {
  parking: { select: { name: true, slug: true, timeZone: true, freeCancellationHours: true, airportName: true } },
  offer: { select: { name: true, code: true } },
  cancellationRequests: { orderBy: { createdAt: "desc" as const }, select: { status: true, createdAt: true, decisionNote: true } },
  payments: { select: { status: true, refunds: { select: { status: true, amountCents: true } } } },
};

/** The customer's reservations, scoped by owner in the query (SECURITY.md). */
export async function listCustomerReservations(userId: string) {
  return db().reservation.findMany({ where: { userId }, orderBy: [{ startsAt: "desc" }], include: customerInclude, take: 200 });
}

/** Upcoming or ongoing confirmed stays, soonest first. */
export async function listUpcomingCustomerReservations(userId: string, limit = 3, now = new Date()) {
  return db().reservation.findMany({ where: { userId, endsAt: { gt: now }, status: { in: ["CONFIRMED", "CHECKED_IN"] } }, orderBy: { startsAt: "asc" }, include: customerInclude, take: limit });
}

export async function getCustomerReservation(userId: string, reference: string) {
  return db().reservation.findFirst({ where: { userId, reference }, include: customerInclude });
}

export type CancelResult =
  | { ok: true; outcome: "CANCELLED" | "REQUESTED"; refundIds: string[]; sessionsToExpire: string[] }
  | { ok: false; reason: "NOT_FOUND" | "NOT_CANCELLABLE" | "ALREADY_REQUESTED" | "REASON_REQUIRED" };

/**
 * Customer cancellation (approved rule Q6):
 * - a pending payment can be abandoned (frees the space);
 * - a confirmed booking is cancelled free of charge until `freeCancellationHours` before arrival;
 * - later, a cancellation request is sent to the staff;
 * - nothing once the stay has started.
 * A paid booking cancelled free of charge gets its full refund recorded (PENDING) in the same
 * transaction; the caller then executes it with the provider (`executeRefunds`), and the cron retries
 * it if the provider is unreachable — a cancellation is never left without its refund.
 */
export async function cancelByCustomer(input: { userId: string; reference: string; reason?: string; now?: Date }): Promise<CancelResult> {
  const now = input.now ?? new Date();
  const reason = input.reason?.trim().slice(0, 1000) ?? "";
  return db().$transaction(async (tx) => {
    const r = await tx.reservation.findFirst({
      where: { userId: input.userId, reference: input.reference },
      include: { parking: true, payments: true, cancellationRequests: { where: { status: "PENDING" }, select: { id: true } } },
    });
    if (!r) return { ok: false as const, reason: "NOT_FOUND" as const };

    const cancel = async (action: string) => {
      const { count } = await tx.reservation.updateMany({ where: { id: r.id, status: r.status }, data: { status: "CANCELLED", cancelledAt: now, cancellationReason: reason || null, holdExpiresAt: null } });
      if (count !== 1) return { ok: false as const, reason: "NOT_CANCELLABLE" as const }; // changed concurrently
      await writeAudit({ actorType: "USER", actorId: input.userId, action, entityType: "Reservation", entityId: r.id, metadata: { from: r.status } }, tx);
      // Open checkout sessions are closed so an abandoned booking cannot be paid afterwards.
      const sessionsToExpire = r.payments.filter((p) => p.status === "PENDING" && p.providerSessionId).map((p) => p.providerSessionId!);
      return { ok: true as const, outcome: "CANCELLED" as const, refundIds: [] as string[], sessionsToExpire };
    };

    if (r.status === "PENDING_PAYMENT") return cancel("reservation.abandon");

    const option = cancellationOption(r, r.parking.freeCancellationHours, now);
    if (option === "NONE") return { ok: false as const, reason: "NOT_CANCELLABLE" as const };
    if (option === "FREE") {
      const res = await cancel("reservation.cancel");
      if (res.ok) {
        for (const p of r.payments.filter((x) => x.status === "SUCCEEDED" && x.amountCents > x.refundedCents)) {
          const refund = await tx.refund.create({ data: { paymentId: p.id, amountCents: p.amountCents - p.refundedCents, currency: p.currency, reason: "Annulation gratuite par le client", requestedById: input.userId } });
          res.refundIds.push(refund.id);
        }
        await enqueue({ template: "reservation.cancelled", recipient: r.customerEmail, userId: r.userId, dedupeKey: `reservation.cancelled:${r.id}`, payload: { firstName: r.customerFirstName, reference: r.reference, parking: r.parking.name, startsAt: formatDateTime(r.startsAt.getTime(), r.parking.timeZone) } }, tx);
      }
      return res;
    }
    // REQUEST
    if (r.cancellationRequests.length) return { ok: false as const, reason: "ALREADY_REQUESTED" as const };
    if (reason.length < 5) return { ok: false as const, reason: "REASON_REQUIRED" as const };
    await tx.cancellationRequest.create({ data: { reservationId: r.id, requestedById: input.userId, reason } });
    await writeAudit({ actorType: "USER", actorId: input.userId, action: "reservation.cancellation-request", entityType: "Reservation", entityId: r.id }, tx);
    const staff = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (staff) {
      await enqueue({ template: "reservation.cancellation-requested", recipient: staff, dedupeKey: `reservation.cancellation-requested:${r.id}:${now.getTime()}`, payload: { reference: r.reference, customer: `${r.customerFirstName} ${r.customerLastName} <${r.customerEmail}>`, parking: r.parking.name, startsAt: formatDateTime(r.startsAt.getTime(), r.parking.timeZone), reason } }, tx);
    }
    return { ok: true as const, outcome: "REQUESTED" as const, refundIds: [], sessionsToExpire: [] };
  });
}
