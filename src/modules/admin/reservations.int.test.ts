import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { db } from "@/server/db/client";
import { FakePaymentProvider } from "@/test/fake-payment-provider";
import { customer, details, fixture, key, stay } from "@/test/booking-fixtures";
import { setPaymentProviderForTests } from "@/modules/payments/stripe";
import { executeRefunds, handlePaymentEvent, startCheckout } from "@/modules/payments/service";
import { cancelByCustomer } from "@/modules/reservations/service";
import { ALL_PERMISSIONS } from "@/modules/auth/permissions";
import type { Permission } from "@/generated/prisma/enums";
import { AdminRefusal, Forbidden, type Actor } from "./guard";
import { checkIn, complete, getReservation, listReservations, refundReservation, rejectCancellationRequest, staffCancel } from "./reservations";

let fake: FakePaymentProvider;
beforeEach(() => {
  fake = new FakePaymentProvider();
  setPaymentProviderForTests(fake);
});
afterEach(() => setPaymentProviderForTests(null));

async function staff(permissions: readonly Permission[] = ALL_PERMISSIONS): Promise<Actor> {
  const u = await customer();
  return { id: u.id, isStaff: true, permissions: [...permissions], roleKey: "ADMIN", firstName: "Ada", lastName: "Admin" };
}

/** A confirmed, paid booking (2 500 cents). */
async function paidBooking(inDays = 10) {
  const { slug } = await fixture({ capacity: 2 });
  const user = await customer();
  const r = await startCheckout({ userId: user.id, request: stay(slug, inDays, 2), details, idempotencyKey: key() }, fake);
  if (!r.ok) throw new Error(r.reason);
  const res = await db().reservation.findUniqueOrThrow({ where: { reference: r.reference }, include: { payments: true } });
  await handlePaymentEvent(fake.completed(res.payments[0]!.providerSessionId!), fake);
  return { user, res, slug };
}

const statusOf = async (id: string) => (await db().reservation.findUniqueOrThrow({ where: { id } })).status;

describe("permissions", () => {
  it("every command refuses an actor without the permission", async () => {
    const { res } = await paidBooking();
    const reader = await staff(["RESERVATION_READ"]);
    await expect(checkIn(reader, res.id)).rejects.toBeInstanceOf(Forbidden);
    await expect(staffCancel(reader, { id: res.id, reason: "x", refundCents: 0 })).rejects.toBeInstanceOf(Forbidden);
    await expect(refundReservation(reader, { id: res.id, amountCents: 100, reason: "x" })).rejects.toBeInstanceOf(Forbidden);
    const canceller = await staff(["RESERVATION_READ", "RESERVATION_CANCEL"]);
    await expect(staffCancel(canceller, { id: res.id, reason: "test", refundCents: 100 })).rejects.toBeInstanceOf(Forbidden); // refund needs PAYMENT_REFUND
    const outsider = await staff([]);
    await expect(listReservations(outsider, { q: "", parking: "", status: "", from: "", to: "", skip: 0, take: 10 })).rejects.toBeInstanceOf(Forbidden);
    expect(await statusOf(res.id)).toBe("CONFIRMED");
  });
});

describe("lifecycle", () => {
  it("check-in then completion, each once, audit-logged with the actor", async () => {
    const { res } = await paidBooking();
    const admin = await staff();
    await expect(complete(admin, res.id)).rejects.toBeInstanceOf(AdminRefusal);
    await checkIn(admin, res.id);
    await expect(checkIn(admin, res.id)).rejects.toBeInstanceOf(AdminRefusal);
    await complete(admin, res.id);
    expect(await statusOf(res.id)).toBe("COMPLETED");
    const detail = await getReservation(admin, res.reference);
    expect(detail!.timeline.map((e) => e.action)).toEqual(expect.arrayContaining(["reservation.hold", "payment.succeeded", "reservation.confirm", "reservation.check-in", "reservation.complete"]));
    expect(detail!.timeline.find((e) => e.action === "reservation.check-in")?.actorId).toBe(admin.id);
  });

  it("search finds by reference, plate, name and e-mail, with status filter", async () => {
    const { res, slug } = await paidBooking();
    const admin = await staff();
    // Narrowed to this test's parking: the test database holds many bookings with the same details.
    const base = { q: "", parking: slug, status: "", from: "", to: "", skip: 0, take: 50 };
    for (const q of [res.reference.toLowerCase(), "ab-123", "TEST", "lea@example"]) {
      expect((await listReservations(admin, { ...base, q })).rows.some((r) => r.id === res.id)).toBe(true);
    }
    expect((await listReservations(admin, { ...base, q: res.reference, status: "CANCELLED" })).count).toBe(0);
  });
});

describe("cancellation and refunds", () => {
  it("staff cancellation with a full refund frees the space, refunds once and e-mails the customer", async () => {
    const { res } = await paidBooking();
    const admin = await staff();
    await staffCancel(admin, { id: res.id, reason: "Fermeture exceptionnelle", refundCents: 2500 });
    const after = await db().reservation.findUniqueOrThrow({ where: { id: res.id } });
    expect(after).toMatchObject({ status: "CANCELLED", cancellationReason: "Fermeture exceptionnelle" });
    // Payments are not configured in tests (no Stripe variables): execute with the fake provider.
    const refunds = await db().refund.findMany({ where: { payment: { reservationId: res.id } } });
    await executeRefunds(refunds.map((r) => r.id), fake);
    expect(fake.refunds.filter((r) => r.reservationId === res.id)).toHaveLength(1);
    expect((await db().reservation.findUniqueOrThrow({ where: { id: res.id } })).refundedCents).toBe(2500);
    expect(await db().notification.count({ where: { dedupeKey: `reservation.cancelled:${res.id}` } })).toBe(1);
    await expect(staffCancel(admin, { id: res.id, reason: "encore", refundCents: 0 })).rejects.toBeInstanceOf(AdminRefusal);
  });

  it("never refunds more than was paid, even across two decisions", async () => {
    const { res } = await paidBooking();
    const admin = await staff();
    await refundReservation(admin, { id: res.id, amountCents: 1500, reason: "Geste commercial" });
    await expect(refundReservation(admin, { id: res.id, amountCents: 1500, reason: "Encore" })).rejects.toThrow(/dépasse/);
    const results = await Promise.allSettled([
      refundReservation(admin, { id: res.id, amountCents: 1000, reason: "A" }),
      refundReservation(admin, { id: res.id, amountCents: 1000, reason: "B" }),
    ]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1); // only 1 000 left
    const total = await db().refund.aggregate({ where: { payment: { reservationId: res.id } }, _sum: { amountCents: true } });
    expect(total._sum.amountCents).toBe(2500);
  });

  it("a cancellation request is approved with a partial refund, or rejected with a note", async () => {
    const admin = await staff();
    for (const decision of ["approve", "reject"] as const) {
      const { res, user } = await paidBooking(1); // within 24 h → request
      const now = new Date(res.startsAt.getTime() - 10 * 3_600_000);
      expect(await cancelByCustomer({ userId: user.id, reference: res.reference, reason: "Vol annulé", now })).toMatchObject({ ok: true, outcome: "REQUESTED" });
      const req = await db().cancellationRequest.findFirstOrThrow({ where: { reservationId: res.id } });
      if (decision === "approve") {
        await staffCancel(admin, { id: res.id, reason: "Vol annulé", refundCents: 1250, requestId: req.id, note: "Remboursement de 50 %" });
        expect(await db().cancellationRequest.findUniqueOrThrow({ where: { id: req.id } })).toMatchObject({ status: "APPROVED", decidedById: admin.id });
        expect(await statusOf(res.id)).toBe("CANCELLED");
      } else {
        await rejectCancellationRequest(admin, { requestId: req.id, note: "Annulation hors délai selon les CGV." });
        expect(await db().cancellationRequest.findUniqueOrThrow({ where: { id: req.id } })).toMatchObject({ status: "REJECTED" });
        expect(await statusOf(res.id)).toBe("CONFIRMED");
        await expect(rejectCancellationRequest(admin, { requestId: req.id, note: "deux fois" })).rejects.toBeInstanceOf(AdminRefusal);
      }
    }
  });
});
