import { describe, expect, it } from "vitest";
import { db } from "@/server/db/client";
import { details, fixture, key, rand, stay } from "@/test/booking-fixtures";
import { registerCustomer, loadSessionUser, verifyCredentials } from "@/modules/auth/service";
import { cancelByCustomer, confirmReservation, createHold } from "@/modules/reservations/service";
import { anonymiseCustomer, deleteOwnAccount } from "./service";

const PASSWORD = "correct horse battery staple";

async function account() {
  const email = `${rand()}@example.com`;
  const r = await registerCustomer({ firstName: "Léa", lastName: "Privée", email, phone: "0611223344", password: PASSWORD });
  if (!r.ok) throw new Error();
  return db().user.findUniqueOrThrow({ where: { email } });
}

describe("right to erasure", () => {
  it("needs the password, refuses while a booking is in progress, then anonymises", async () => {
    const u = await account();
    const { slug } = await fixture();
    const h = await createHold({ userId: u.id, request: stay(slug, 10, 2), details, idempotencyKey: key() });
    if (!h.ok) throw new Error();
    await confirmReservation(h.reservationId);
    await db().contactMessage.create({ data: { name: "Léa Privée", email: u.email, subject: "OTHER", message: "Mon numéro est le 06…", userId: u.id } });

    expect(await deleteOwnAccount(u.id, "wrong password!!")).toEqual({ ok: false, reason: "WRONG_PASSWORD" });
    expect(await deleteOwnAccount(u.id, PASSWORD)).toEqual({ ok: false, reason: "ACTIVE_BOOKINGS" });
    const res = await db().reservation.findUniqueOrThrow({ where: { id: h.reservationId } });
    expect((await cancelByCustomer({ userId: u.id, reference: res.reference })).ok).toBe(true);
    expect(await deleteOwnAccount(u.id, PASSWORD)).toEqual({ ok: true });

    const after = await db().user.findUniqueOrThrow({ where: { id: u.id } });
    expect(after).toMatchObject({ firstName: "Compte", lastName: "supprimé", phone: null, passwordHash: null, status: "DISABLED" });
    expect(after.email).toBe(`supprime-${u.id}@anonyme.invalid`);
    expect(await verifyCredentials(u.email, PASSWORD)).toBeNull();
    expect(await loadSessionUser(u.id, u.sessionVersion)).toBeNull();
    expect(await db().vehicle.count({ where: { userId: u.id } })).toBe(0);
    expect((await db().contactMessage.findFirstOrThrow({ where: { userId: u.id } })).message).toContain("supprimé");
    expect(await db().reservation.count({ where: { userId: u.id } })).toBe(1); // accounting record kept
    // The e-mail address can be used again for a new account.
    expect((await registerCustomer({ firstName: "Léa", lastName: "Nouvelle", email: u.email, phone: "", password: PASSWORD })).ok).toBe(true);
  });

  it("the back office anonymises on request, never a staff account", async () => {
    const u = await account();
    const staffRole = await db().role.findUniqueOrThrow({ where: { key: "ADMIN" } });
    const staff = await db().user.create({ data: { email: `${rand()}@staff.test`, firstName: "S", lastName: "S", roleId: staffRole.id } });
    expect(await anonymiseCustomer(staff.id, staff.id)).toEqual({ ok: false, reason: "STAFF_ACCOUNT" });
    expect(await anonymiseCustomer(staff.id, u.id)).toEqual({ ok: true });
    expect(await db().auditLog.count({ where: { entityId: u.id, action: "customer.anonymise", actorId: staff.id } })).toBe(1);
    expect(await anonymiseCustomer(staff.id, u.id)).toEqual({ ok: false, reason: "NOT_FOUND" });
  });
});
