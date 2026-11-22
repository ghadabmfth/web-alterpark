import { describe, expect, it } from "vitest";
import { db } from "@/server/db/client";
import { utcToZoned } from "./domain/stay";
import { REFERENCE_RE } from "./domain/reference";
import { cancelByCustomer, confirmReservation, createHold, expireHolds, getCustomerReservation, listCustomerReservations, quoteStay, type HoldDetails, type StayRequest } from "./service";

const TZ = "Europe/Paris";
const DAY = 86_400_000;
const rand = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const key = () => `k_${rand()}${rand()}`.slice(0, 40);

async function fixture({ capacity = 1, status = "ACTIVE" }: { capacity?: number; status?: "ACTIVE" | "DRAFT" } = {}) {
  const slug = `test-${rand()}`;
  const parking = await db().parking.create({
    data: {
      slug, name: `Parking ${slug}`, airportCode: "NTE", airportName: "Nantes Atlantique", addressLine: "1 rue du Test", postalCode: "44000", city: "Nantes", status,
      offers: {
        create: {
          code: "eco", name: "Éco", capacity,
          prices: {
            create: [
              { validFrom: new Date("2020-01-01"), mode: "PER_DAY", amountCents: 1000, minDays: 1, maxDays: 7, extraDayCents: 500 },
              { validFrom: new Date("2020-01-01"), mode: "FLAT", amountCents: 2500, minDays: 1, maxDays: 3, priority: 5 },
            ],
          },
        },
      },
    },
  });
  return { parking, slug };
}

async function customer() {
  const role = await db().role.findUniqueOrThrow({ where: { key: "CUSTOMER" } });
  return db().user.create({ data: { email: `${rand()}@example.com`, firstName: "Léa", lastName: "Test", passwordHash: "x", roleId: role.id } });
}

/** A stay starting `inDays` days from now at 10:00 local time, lasting `days` × 24 h. */
function stay(slug: string, inDays: number, days: number): StayRequest {
  const start = utcToZoned(Date.now() + inDays * DAY, TZ).date;
  const end = utcToZoned(Date.now() + (inDays + days) * DAY, TZ).date;
  return { parkingSlug: slug, offerCode: "eco", departure: { date: start, time: "10:00" }, ret: { date: end, time: "10:00" } };
}

const details: HoldDetails = { plate: "AB-123-CD", passengers: 2, outboundFlight: "AF1234", returnFlight: "", firstName: "Léa", lastName: "Test", email: "lea@example.com", phone: "0612345678" };

describe("quote", () => {
  it("prices with the database rates and reports availability", async () => {
    const { slug } = await fixture({ capacity: 2 });
    const short = await quoteStay(stay(slug, 10, 2));
    expect(short).toMatchObject({ ok: true, quote: { price: { totalCents: 2500 }, remaining: 2, stay: { days: 2 } } }); // FLAT has priority
    const long = await quoteStay(stay(slug, 10, 9));
    expect(long).toMatchObject({ ok: true, quote: { price: { totalCents: 7 * 1000 + 2 * 500 } } });
  });

  it("refuses draft sites, unknown offers and invalid stays", async () => {
    const draft = await fixture({ status: "DRAFT" });
    expect(await quoteStay(stay(draft.slug, 10, 2))).toEqual({ ok: false, reason: "NOT_BOOKABLE" });
    const { slug } = await fixture();
    expect(await quoteStay({ ...stay(slug, 10, 2), offerCode: "nope" })).toEqual({ ok: false, reason: "NOT_BOOKABLE" });
    const past = await quoteStay(stay(slug, -2, 1));
    expect(past).toMatchObject({ ok: false, reason: "INVALID_STAY" });
  });
});

describe("holds and capacity", () => {
  it("creates a pending reservation with snapshots, an audit entry and an idempotent replay", async () => {
    const { slug } = await fixture();
    const user = await customer();
    const k = key();
    const r = await createHold({ userId: user.id, request: stay(slug, 10, 2), details, idempotencyKey: k });
    expect(r).toMatchObject({ ok: true, totalCents: 2500, replayed: false });
    if (!r.ok) throw new Error();
    expect(r.reference).toMatch(REFERENCE_RE);
    const row = await db().reservation.findUniqueOrThrow({ where: { id: r.reservationId } });
    expect(row).toMatchObject({ status: "PENDING_PAYMENT", billedDays: 2, vehiclePlate: "AB-123-CD", customerEmail: "lea@example.com", outboundFlight: "AF1234", returnFlight: null });
    expect(row.holdExpiresAt!.getTime() - row.createdAt.getTime()).toBeGreaterThan(29 * 60_000);
    expect(await db().auditLog.count({ where: { entityId: r.reservationId, action: "reservation.hold" } })).toBe(1);
    // Same key → same reservation; another user with the key → conflict.
    expect(await createHold({ userId: user.id, request: stay(slug, 10, 2), details, idempotencyKey: k })).toMatchObject({ ok: true, reservationId: r.reservationId, replayed: true });
    const other = await customer();
    expect(await createHold({ userId: other.id, request: stay(slug, 10, 2), details, idempotencyKey: k })).toEqual({ ok: false, reason: "IDEMPOTENCY_CONFLICT" });
  });

  it("N parallel bookings of the last space: exactly one succeeds", async () => {
    const { slug } = await fixture({ capacity: 1 });
    const users = await Promise.all(Array.from({ length: 8 }, () => customer()));
    const results = await Promise.all(users.map((u) => createHold({ userId: u.id, request: stay(slug, 20, 3), details, idempotencyKey: key() })));
    expect(results.filter((r) => r.ok)).toHaveLength(1);
    expect(results.filter((r) => !r.ok && r.reason === "FULL")).toHaveLength(7);
  });

  it("parallel retries with the same key create one reservation", async () => {
    const { slug } = await fixture({ capacity: 5 });
    const user = await customer();
    const k = key();
    const results = await Promise.all(Array.from({ length: 5 }, () => createHold({ userId: user.id, request: stay(slug, 20, 3), details, idempotencyKey: k })));
    const ids = new Set(results.map((r) => (r.ok ? r.reservationId : r.reason)));
    expect(ids.size).toBe(1);
    expect(await db().reservation.count({ where: { idempotencyKey: k } })).toBe(1);
  });

  it("counts the peak occupancy: consecutive stays share a space", async () => {
    const { slug } = await fixture({ capacity: 1 });
    const [a, b, c] = await Promise.all([customer(), customer(), customer()]);
    expect((await createHold({ userId: a.id, request: stay(slug, 10, 2), details, idempotencyKey: key() })).ok).toBe(true);
    expect((await createHold({ userId: b.id, request: stay(slug, 12, 2), details, idempotencyKey: key() })).ok).toBe(true); // starts when the first ends
    expect(await createHold({ userId: c.id, request: stay(slug, 11, 2), details, idempotencyKey: key() })).toEqual({ ok: false, reason: "FULL" });
  });

  it("expired holds free the space and are marked by the cron", async () => {
    const { slug } = await fixture({ capacity: 1 });
    const [a, b] = await Promise.all([customer(), customer()]);
    const past = new Date(Date.now() - 31 * 60_000);
    const first = await createHold({ userId: a.id, request: stay(slug, 10, 2), details, idempotencyKey: key(), now: past });
    expect(first.ok).toBe(true);
    // The hold has expired: the space is free again, even before the cron runs.
    const second = await createHold({ userId: b.id, request: stay(slug, 10, 2), details, idempotencyKey: key() });
    expect(second.ok).toBe(true);
    expect(await expireHolds()).toBeGreaterThanOrEqual(1);
    if (!first.ok) throw new Error();
    expect((await db().reservation.findUniqueOrThrow({ where: { id: first.reservationId } })).status).toBe("EXPIRED");
  });
});

describe("confirmation", () => {
  it("confirms a valid hold once, enqueues the e-mail, and is idempotent", async () => {
    const { slug } = await fixture();
    const user = await customer();
    const r = await createHold({ userId: user.id, request: stay(slug, 10, 2), details, idempotencyKey: key() });
    if (!r.ok) throw new Error();
    expect(await confirmReservation(r.reservationId)).toMatchObject({ ok: true, alreadyConfirmed: false });
    expect(await confirmReservation(r.reservationId)).toMatchObject({ ok: true, alreadyConfirmed: true });
    const row = await db().reservation.findUniqueOrThrow({ where: { id: r.reservationId } });
    expect(row).toMatchObject({ status: "CONFIRMED", holdExpiresAt: null });
    expect(await db().notification.count({ where: { dedupeKey: `reservation.confirmed:${r.reservationId}` } })).toBe(1);
  });

  it("late payment: confirms if the space is still free, refuses otherwise", async () => {
    const { slug } = await fixture({ capacity: 1 });
    const [a, b] = await Promise.all([customer(), customer()]);
    const past = new Date(Date.now() - 40 * 60_000);
    const late = await createHold({ userId: a.id, request: stay(slug, 10, 2), details, idempotencyKey: key(), now: past });
    if (!late.ok) throw new Error();
    await expireHolds();
    expect(await confirmReservation(late.reservationId)).toMatchObject({ ok: true }); // EXPIRED → CONFIRMED, space free

    const late2 = await createHold({ userId: b.id, request: stay(slug, 20, 2), details, idempotencyKey: key(), now: past });
    if (!late2.ok) throw new Error();
    const taker = await createHold({ userId: a.id, request: stay(slug, 20, 2), details, idempotencyKey: key() });
    expect(taker.ok).toBe(true);
    expect(await confirmReservation(late2.reservationId)).toEqual({ ok: false, reason: "NO_CAPACITY" });
  });
});

describe("customer access and cancellation", () => {
  it("customers only see their own reservations", async () => {
    const { slug } = await fixture();
    const [a, b] = await Promise.all([customer(), customer()]);
    const r = await createHold({ userId: a.id, request: stay(slug, 10, 2), details, idempotencyKey: key() });
    if (!r.ok) throw new Error();
    expect((await listCustomerReservations(a.id)).map((x) => x.reference)).toContain(r.reference);
    expect(await listCustomerReservations(b.id)).toHaveLength(0);
    expect(await getCustomerReservation(b.id, r.reference)).toBeNull();
    expect(await cancelByCustomer({ userId: b.id, reference: r.reference })).toEqual({ ok: false, reason: "NOT_FOUND" });
  });

  it("abandons a pending payment and frees the space", async () => {
    const { slug } = await fixture({ capacity: 1 });
    const [a, b] = await Promise.all([customer(), customer()]);
    const r = await createHold({ userId: a.id, request: stay(slug, 10, 2), details, idempotencyKey: key() });
    if (!r.ok) throw new Error();
    expect(await cancelByCustomer({ userId: a.id, reference: r.reference })).toEqual({ ok: true, outcome: "CANCELLED" });
    expect((await createHold({ userId: b.id, request: stay(slug, 10, 2), details, idempotencyKey: key() })).ok).toBe(true);
  });

  it("free cancellation before the deadline, request after, refusal once started", async () => {
    const { slug } = await fixture({ capacity: 3 });
    const user = await customer();
    const book = async (inDays: number) => {
      const r = await createHold({ userId: user.id, request: stay(slug, inDays, 2), details, idempotencyKey: key() });
      if (!r.ok) throw new Error(r.reason);
      await confirmReservation(r.reservationId);
      return r;
    };
    const early = await book(5);
    expect(await cancelByCustomer({ userId: user.id, reference: early.reference })).toEqual({ ok: true, outcome: "CANCELLED" });

    const soon = await book(5);
    const { startsAt } = await db().reservation.findUniqueOrThrow({ where: { id: soon.reservationId } });
    const at = async (h: number) => new Date(startsAt.getTime() - h * 3_600_000);
    expect(await cancelByCustomer({ userId: user.id, reference: soon.reference, reason: "", now: await at(10) })).toEqual({ ok: false, reason: "REASON_REQUIRED" });
    expect(await cancelByCustomer({ userId: user.id, reference: soon.reference, reason: "Vol annulé par la compagnie", now: await at(10) })).toEqual({ ok: true, outcome: "REQUESTED" });
    expect(await cancelByCustomer({ userId: user.id, reference: soon.reference, reason: "Encore", now: await at(9) })).toEqual({ ok: false, reason: "ALREADY_REQUESTED" });
    expect(await cancelByCustomer({ userId: user.id, reference: soon.reference, now: await at(-1) })).toEqual({ ok: false, reason: "NOT_CANCELLABLE" });
  });

  it("never cancels a paid booking without a refund (refunds arrive in Phase 6)", async () => {
    const { slug } = await fixture();
    const user = await customer();
    const r = await createHold({ userId: user.id, request: stay(slug, 10, 2), details, idempotencyKey: key() });
    if (!r.ok) throw new Error();
    await confirmReservation(r.reservationId);
    await db().payment.create({ data: { reservationId: r.reservationId, provider: "STRIPE", status: "SUCCEEDED", amountCents: 2500, providerPaymentId: `pi_test_${rand()}` } });
    expect(await cancelByCustomer({ userId: user.id, reference: r.reference })).toEqual({ ok: false, reason: "REFUND_UNAVAILABLE" });
  });
});
