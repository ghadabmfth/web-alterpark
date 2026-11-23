import { describe, expect, it } from "vitest";
import { db } from "@/server/db/client";
import { customer, details, fixture, key, rand, stay } from "@/test/booking-fixtures";
import { quoteStay } from "@/modules/reservations/service";
import { readSettings } from "@/modules/settings/settings";
import { ALL_PERMISSIONS, SUPER_ADMIN_ONLY } from "@/modules/auth/permissions";
import { loadSessionUser } from "@/modules/auth/service";
import { AdminRefusal, Forbidden, type Actor } from "./guard";
import { changeStaffRole, createRole, deleteRole, inviteStaff, setStaffStatus, updateRole } from "./staff";
import { saveSettings } from "./settings";
import { dashboard, listAudit, monthlyReport } from "./insights";

async function member(roleKey: "ADMIN" | "SUPER_ADMIN") {
  const role = await db().role.findUniqueOrThrow({ where: { key: roleKey } });
  const u = await db().user.create({ data: { email: `${rand()}@staff.test`, firstName: "Sam", lastName: roleKey, passwordHash: "x", roleId: role.id } });
  const actor: Actor = { id: u.id, isStaff: true, roleKey, firstName: "Sam", lastName: roleKey, permissions: roleKey === "SUPER_ADMIN" ? [...ALL_PERMISSIONS] : ALL_PERMISSIONS.filter((p) => !SUPER_ADMIN_ONLY.includes(p)) };
  return { user: u, actor, role };
}

describe("staff accounts", () => {
  it("only super administrators manage staff; invitations e-mail a single-use link", async () => {
    const admin = await member("ADMIN");
    const roleId = admin.role.id;
    await expect(inviteStaff(admin.actor, { email: `${rand()}@x.test`, firstName: "A", lastName: "B", roleId })).rejects.toBeInstanceOf(Forbidden);
    const sa = await member("SUPER_ADMIN");
    const email = `${rand()}@x.test`;
    await inviteStaff(sa.actor, { email: email.toUpperCase(), firstName: "Nina", lastName: "New", roleId });
    const invited = await db().user.findUniqueOrThrow({ where: { email } });
    expect(invited.passwordHash).toBeNull();
    expect(await db().authToken.count({ where: { userId: invited.id, purpose: "PASSWORD_RESET", usedAt: null } })).toBe(1);
    expect(await db().notification.count({ where: { userId: invited.id, template: "staff.invite" } })).toBe(1);
    await expect(inviteStaff(sa.actor, { email, firstName: "N", lastName: "N", roleId })).rejects.toBeInstanceOf(AdminRefusal);
    const customerRole = await db().role.findUniqueOrThrow({ where: { key: "CUSTOMER" } });
    await expect(inviteStaff(sa.actor, { email: `${rand()}@x.test`, firstName: "N", lastName: "N", roleId: customerRole.id })).rejects.toThrow(/rôle de l’équipe/);
  });

  it("no self-change, never without an active super administrator, sessions revoked on change", async () => {
    const sa = await member("SUPER_ADMIN");
    const admin = await member("ADMIN");
    await expect(changeStaffRole(sa.actor, sa.user.id, admin.role.id)).rejects.toThrow(/propre rôle/);
    await expect(setStaffStatus(sa.actor, sa.user.id, "DISABLED")).rejects.toThrow(/propre compte/);

    await changeStaffRole(sa.actor, admin.user.id, sa.role.id); // promote
    const promoted = await db().user.findUniqueOrThrow({ where: { id: admin.user.id } });
    expect(promoted.sessionVersion).toBe(admin.user.sessionVersion + 1);
    expect(await loadSessionUser(admin.user.id, admin.user.sessionVersion)).toBeNull(); // old session revoked

    // Make `sa` the only active super administrator, then try to demote / disable it.
    await db().user.updateMany({ where: { role: { key: "SUPER_ADMIN" }, id: { not: sa.user.id } }, data: { status: "DISABLED" } });
    const other = await member("SUPER_ADMIN");
    await db().user.update({ where: { id: other.user.id }, data: { status: "DISABLED" } });
    await db().user.update({ where: { id: other.user.id }, data: { status: "ACTIVE" } });
    await setStaffStatus(other.actor, sa.user.id, "DISABLED"); // allowed: `other` remains
    await expect(setStaffStatus(sa.actor, other.user.id, "DISABLED")).rejects.toThrow(/dernier super-administrateur/);
    await expect(changeStaffRole(sa.actor, other.user.id, admin.role.id)).rejects.toThrow(/dernier super-administrateur/);
    await setStaffStatus(other.actor, sa.user.id, "ACTIVE");
  });
});

describe("roles", () => {
  it("custom roles grant exactly their permissions, at the next request", async () => {
    const sa = await member("SUPER_ADMIN");
    const name = `Accueil ${rand()}`;
    await createRole(sa.actor, { name, description: "", permissions: ["RESERVATION_READ", "RESERVATION_MANAGE", "NOT_A_PERMISSION"] });
    const role = await db().role.findFirstOrThrow({ where: { name }, include: { permissions: true } });
    expect(role.permissions.map((p) => p.permission).sort()).toEqual(["RESERVATION_MANAGE", "RESERVATION_READ"]);
    const agent = await db().user.create({ data: { email: `${rand()}@staff.test`, firstName: "A", lastName: "A", passwordHash: "x", roleId: role.id } });
    await updateRole(sa.actor, role.id, { name, description: "", permissions: ["RESERVATION_READ"] });
    expect((await loadSessionUser(agent.id, agent.sessionVersion))!.permissions).toEqual(["RESERVATION_READ"]);
    await expect(deleteRole(sa.actor, role.id)).rejects.toThrow(/encore attribué/);
    await db().user.delete({ where: { id: agent.id } });
    await deleteRole(sa.actor, role.id);
    const superRole = await db().role.findUniqueOrThrow({ where: { key: "SUPER_ADMIN" } });
    await expect(updateRole(sa.actor, superRole.id, { name: "x", description: "", permissions: [] })).rejects.toThrow(/non|pas modifiable/);
    const admin = await member("ADMIN");
    await expect(createRole(admin.actor, { name: "x", description: "", permissions: [] })).rejects.toBeInstanceOf(Forbidden);
  });
});

describe("settings, indicators and audit", () => {
  it("the booking switch stops quotes at once", async () => {
    const sa = await member("SUPER_ADMIN");
    const { slug } = await fixture();
    try {
      await saveSettings(sa.actor, { "booking.enabled": false, "booking.notice": "Fermé pour travaux" });
      expect(await readSettings()).toEqual({ "booking.enabled": false, "booking.notice": "Fermé pour travaux" });
      expect(await quoteStay(stay(slug, 10, 2))).toEqual({ ok: false, reason: "NOT_BOOKABLE" });
    } finally {
      await saveSettings(sa.actor, { "booking.enabled": true, "booking.notice": "" });
    }
    expect((await quoteStay(stay(slug, 10, 2))).ok).toBe(true);
    expect((await listAudit(sa.actor, { action: "settings.", entity: "", actorEmail: sa.user.email, from: "", to: "", skip: 0, take: 10 })).count).toBe(2);
  });

  it("indicators and monthly report come from the data", async () => {
    const sa = await member("SUPER_ADMIN");
    const { slug } = await fixture({ capacity: 3 });
    const u = await customer();
    const { createHold, confirmReservation } = await import("@/modules/reservations/service");
    const h = await createHold({ userId: u.id, request: stay(slug, 10, 2), details, idempotencyKey: key() });
    if (!h.ok) throw new Error();
    await confirmReservation(h.reservationId);
    await db().payment.create({ data: { reservationId: h.reservationId, provider: "STRIPE", status: "SUCCEEDED", amountCents: 2500, succeededAt: new Date(), providerPaymentId: `pi_${rand()}` } });
    const k = await dashboard(sa.actor, { parking: slug, from: "", to: "" });
    expect(k).toMatchObject({ confirmed: 1, created: 1, revenue: 2500, averageCents: 2500, averageDays: 2 });
    expect(k.occupancy).toEqual([expect.objectContaining({ capacity: 3, used: 0 })]); // starts in 10 days
    const year = new Date().getUTCFullYear();
    const months = await monthlyReport(sa.actor, year, slug);
    expect(months.reduce((n, m) => n + m.confirmed, 0)).toBe(1);
    expect(months.reduce((n, m) => n + m.paidCents, 0)).toBe(2500);
    const reader = { ...sa.actor, permissions: [] };
    await expect(dashboard(reader, { parking: "", from: "", to: "" })).rejects.toBeInstanceOf(Forbidden);
  });
});
