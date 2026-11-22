import { describe, expect, it } from "vitest";
import { db } from "@/server/db/client";
import { customer, details, fixture, key, rand, stay } from "@/test/booking-fixtures";
import { bookPayOnSite, cancelByCustomer, createHold } from "@/modules/reservations/service";
import { recordOnSitePayment, refundReservation, staffCancel } from "@/modules/admin/reservations";
import { ALL_PERMISSIONS } from "@/modules/auth/permissions";
import { AdminRefusal, Forbidden, type Actor } from "@/modules/admin/guard";
import { dueCents } from "./service";

async function staff(permissions = [...ALL_PERMISSIONS]): Promise<Actor> {
  const u = await customer();
  return { id: u.id, isStaff: true, permissions, roleKey: "ADMIN", firstName: "Ada", lastName: "Admin" };
}

describe("pay on site", () => {
  it("confirms at once without online payment, takes the space, e-mails the amount due", async () => {
    const { slug } = await fixture({ capacity: 1 });
    const user = await customer();
    const k = key();
    const r = await bookPayOnSite({ userId: user.id, request: stay(slug, 10, 2), details, idempotencyKey: k });
    if (!r.ok) throw new Error(r.reason);
    const res = await db().reservation.findUniqueOrThrow({ where: { id: r.reservationId } });
    expect(res).toMatchObject({ status: "CONFIRMED", paymentMethod: "ON_SITE", holdExpiresAt: null });
    expect(await dueCents(res.id)).toBe(2500);
    const mail = await db().notification.findFirstOrThrow({ where: { dedupeKey: `reservation.confirmed:${res.id}` } });
    expect((mail.payload as { payment: string }).payment).toMatch(/à régler sur place/);
    // Same key → same reservation; the space is taken for others.
    expect(await bookPayOnSite({ userId: user.id, request: stay(slug, 10, 2), details, idempotencyKey: k })).toMatchObject({ ok: true, reservationId: res.id, replayed: true });
    const other = await customer();
    expect(await bookPayOnSite({ userId: other.id, request: stay(slug, 10, 2), details, idempotencyKey: key() })).toEqual({ ok: false, reason: "FULL" });
  });

  it("a key used for an online booking cannot become an on-site one", async () => {
    const { slug } = await fixture({ capacity: 2 });
    const user = await customer();
    const k = key();
    expect((await createHold({ userId: user.id, request: stay(slug, 10, 2), details, idempotencyKey: k })).ok).toBe(true);
    expect(await bookPayOnSite({ userId: user.id, request: stay(slug, 10, 2), details, idempotencyKey: k })).toEqual({ ok: false, reason: "IDEMPOTENCY_CONFLICT" });
  });

  it("staff record the payment at the counter, never more than due; refunds are immediate", async () => {
    const { slug } = await fixture({ capacity: 1 });
    const user = await customer();
    const r = await bookPayOnSite({ userId: user.id, request: stay(slug, 10, 2), details, idempotencyKey: key() });
    if (!r.ok) throw new Error();
    const desk = await staff(["RESERVATION_READ", "RESERVATION_MANAGE"]);
    await expect(recordOnSitePayment(await staff(["RESERVATION_READ"]), { id: r.reservationId, amountCents: 100, method: "CASH" })).rejects.toBeInstanceOf(Forbidden);
    await expect(recordOnSitePayment(desk, { id: r.reservationId, amountCents: 3000, method: "CARD" })).rejects.toBeInstanceOf(AdminRefusal);
    await recordOnSitePayment(desk, { id: r.reservationId, amountCents: 1500, method: "HOLIDAY_VOUCHERS" });
    await recordOnSitePayment(desk, { id: r.reservationId, amountCents: 1000, method: "CARD" });
    expect(await dueCents(r.reservationId)).toBe(0);
    await expect(recordOnSitePayment(desk, { id: r.reservationId, amountCents: 1, method: "CASH" })).rejects.toThrow(/dépasse/);
    expect(await db().auditLog.count({ where: { action: "payment.on-site", actorId: desk.id } })).toBe(2);

    const admin = await staff();
    await refundReservation(admin, { id: r.reservationId, amountCents: 2000, reason: "Geste commercial" });
    const refunds = await db().refund.findMany({ where: { payment: { reservationId: r.reservationId } } });
    expect(refunds.every((x) => x.status === "SUCCEEDED")).toBe(true); // given back at the counter
    expect((await db().reservation.findUniqueOrThrow({ where: { id: r.reservationId } })).refundedCents).toBe(2000);
  });

  it("an unpaid on-site booking is cancelled free of charge, nothing to refund", async () => {
    const { slug } = await fixture({ capacity: 1 });
    const user = await customer();
    const r = await bookPayOnSite({ userId: user.id, request: stay(slug, 10, 2), details, idempotencyKey: key() });
    if (!r.ok) throw new Error();
    expect(await cancelByCustomer({ userId: user.id, reference: r.reference })).toMatchObject({ ok: true, outcome: "CANCELLED", refundIds: [] });
    const r2 = await bookPayOnSite({ userId: user.id, request: stay(slug, 10, 2), details, idempotencyKey: `k_${rand()}${rand()}`.slice(0, 40) });
    expect(r2.ok).toBe(true); // space released
    if (!r2.ok) throw new Error();
    await staffCancel(await staff(), { id: r2.reservationId, reason: "Doublon", refundCents: 0 });
    expect((await db().reservation.findUniqueOrThrow({ where: { id: r2.reservationId } })).status).toBe("CANCELLED");
  });
});
