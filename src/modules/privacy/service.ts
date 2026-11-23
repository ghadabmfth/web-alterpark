import "server-only";
import { verify } from "@node-rs/argon2";
import { db } from "@/server/db/client";
import { writeAudit } from "@/server/audit";

/*
 * Right to erasure (GDPR art. 17). Deleting an account ANONYMISES it: identity, contact details,
 * vehicles, tokens and contact messages are erased or replaced; the row stays so that accounting
 * records (reservations, payments, refunds — legal retention) keep a valid owner. Reservation
 * snapshots are kept for the same reason (retention period to confirm with the client, see
 * SECURITY.md). Refused while the customer still has a booking in progress: cancel it first.
 */

export type ErasureResult = { ok: true } | { ok: false; reason: "WRONG_PASSWORD" | "ACTIVE_BOOKINGS" | "NOT_FOUND" | "STAFF_ACCOUNT" };

async function activeBookings(userId: string, now = new Date()): Promise<number> {
  return db().reservation.count({
    where: { userId, endsAt: { gt: now }, OR: [{ status: { in: ["CONFIRMED", "CHECKED_IN"] } }, { status: "PENDING_PAYMENT", holdExpiresAt: { gt: now } }] },
  });
}

async function anonymise(userId: string, actor: { type: "USER"; id: string }, action: string) {
  const now = new Date();
  await db().$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        email: `supprime-${userId}@anonyme.invalid`,
        firstName: "Compte",
        lastName: "supprimé",
        phone: null,
        passwordHash: null,
        emailVerifiedAt: null,
        marketingOptInAt: null,
        status: "DISABLED",
        deletedAt: now,
        sessionVersion: { increment: 1 },
      },
    });
    await tx.authToken.deleteMany({ where: { userId } });
    await tx.vehicle.deleteMany({ where: { userId } });
    await tx.notification.deleteMany({ where: { userId, status: { not: "SENT" } } });
    await tx.contactMessage.updateMany({ where: { userId }, data: { name: "Compte supprimé", email: "anonyme@anonyme.invalid", phone: null, message: "[Message supprimé à la demande du client]" } });
    await writeAudit({ actorType: "USER", actorId: actor.id, action, entityType: "User", entityId: userId }, tx);
  });
}

/** Self-service from « Mon profil », confirmed with the password. */
export async function deleteOwnAccount(userId: string, password: string): Promise<ErasureResult> {
  const u = await db().user.findUnique({ where: { id: userId }, include: { role: true } });
  if (!u || u.deletedAt) return { ok: false, reason: "NOT_FOUND" };
  if (u.role.isStaff) return { ok: false, reason: "STAFF_ACCOUNT" };
  if (!u.passwordHash || !(await verify(u.passwordHash, password).catch(() => false))) return { ok: false, reason: "WRONG_PASSWORD" };
  if (await activeBookings(userId)) return { ok: false, reason: "ACTIVE_BOOKINGS" };
  await anonymise(userId, { type: "USER", id: userId }, "user.delete.self");
  return { ok: true };
}

/** Back office, on a written request from the customer (CUSTOMER_MANAGE). */
export async function anonymiseCustomer(actorId: string, userId: string): Promise<ErasureResult> {
  const u = await db().user.findUnique({ where: { id: userId }, include: { role: true } });
  if (!u || u.deletedAt) return { ok: false, reason: "NOT_FOUND" };
  if (u.role.isStaff) return { ok: false, reason: "STAFF_ACCOUNT" };
  if (await activeBookings(userId)) return { ok: false, reason: "ACTIVE_BOOKINGS" };
  await anonymise(userId, { type: "USER", id: actorId }, "customer.anonymise");
  return { ok: true };
}
