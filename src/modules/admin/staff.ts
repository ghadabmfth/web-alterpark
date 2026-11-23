import "server-only";
import type { Permission } from "@/generated/prisma/enums";
import { db } from "@/server/db/client";
import { writeAudit } from "@/server/audit";
import { absoluteUrl } from "@/config/site";
import { enqueue } from "@/modules/notifications/outbox";
import { newToken, normalizeEmail } from "@/modules/auth/tokens";
import { ALL_PERMISSIONS } from "@/modules/auth/permissions";
import { AdminRefusal, ensure, type Actor } from "./guard";

/*
 * Staff accounts and roles. Invariants: nobody changes their own role or disables themselves; the
 * last active super administrator cannot be demoted or disabled; only a super administrator can
 * hand out the super-administrator role. Role and status changes revoke the member's sessions.
 */

const INVITE_TTL_MS = 72 * 3_600_000;

export async function listStaff(actor: Actor) {
  ensure(actor, "ADMIN_USER_MANAGE");
  const [users, roles] = await Promise.all([
    db().user.findMany({ where: { role: { isStaff: true }, deletedAt: null }, orderBy: [{ status: "asc" }, { lastName: "asc" }], include: { role: true } }),
    db().role.findMany({ where: { isStaff: true }, orderBy: { name: "asc" } }),
  ]);
  return { users, roles };
}

async function assertRoleAssignable(actor: Actor, roleId: string) {
  const role = await db().role.findUnique({ where: { id: roleId } });
  if (!role || !role.isStaff) throw new AdminRefusal("Choisissez un rôle de l’équipe.", "roleId");
  if (role.key === "SUPER_ADMIN" && actor.roleKey !== "SUPER_ADMIN") throw new AdminRefusal("Seul un super-administrateur peut attribuer ce rôle.", "roleId");
  return role;
}

async function otherActiveSuperAdmins(userId: string): Promise<number> {
  return db().user.count({ where: { id: { not: userId }, status: "ACTIVE", deletedAt: null, role: { key: "SUPER_ADMIN" } } });
}

/** Creates the account without password and e-mails a single-use link to choose one. */
export async function inviteStaff(actor: Actor, input: { email: string; firstName: string; lastName: string; roleId: string }) {
  ensure(actor, "ADMIN_USER_MANAGE");
  const role = await assertRoleAssignable(actor, input.roleId);
  const email = normalizeEmail(input.email);
  if (await db().user.findUnique({ where: { email } })) throw new AdminRefusal("Un compte existe déjà avec cette adresse.", "email");
  const token = newToken();
  await db().$transaction(async (tx) => {
    const u = await tx.user.create({ data: { email, firstName: input.firstName, lastName: input.lastName, roleId: role.id } });
    await tx.authToken.create({ data: { userId: u.id, purpose: "PASSWORD_RESET", tokenHash: token.hash, expiresAt: new Date(Date.now() + INVITE_TTL_MS) } });
    await enqueue({ template: "staff.invite", recipient: email, userId: u.id, payload: { firstName: u.firstName, invitedBy: `${actor.firstName} ${actor.lastName}`, role: role.name, url: absoluteUrl(`/reinitialiser-mot-de-passe?token=${token.raw}`) } }, tx);
    await writeAudit({ actorType: "USER", actorId: actor.id, action: "staff.invite", entityType: "User", entityId: u.id, metadata: { role: role.key } }, tx);
  });
}

export async function changeStaffRole(actor: Actor, userId: string, roleId: string) {
  ensure(actor, "ADMIN_USER_MANAGE");
  if (userId === actor.id) throw new AdminRefusal("Vous ne pouvez pas modifier votre propre rôle.");
  const role = await assertRoleAssignable(actor, roleId);
  const user = await db().user.findFirst({ where: { id: userId, role: { isStaff: true } }, include: { role: true } });
  if (!user) throw new AdminRefusal("Membre de l’équipe introuvable.");
  if (user.role.key === "SUPER_ADMIN" && actor.roleKey !== "SUPER_ADMIN") throw new AdminRefusal("Seul un super-administrateur peut modifier un super-administrateur.");
  if (user.role.key === "SUPER_ADMIN" && role.key !== "SUPER_ADMIN" && user.status === "ACTIVE" && !(await otherActiveSuperAdmins(userId))) {
    throw new AdminRefusal("C’est le dernier super-administrateur actif : nommez-en un autre avant.");
  }
  await db().$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { roleId: role.id, sessionVersion: { increment: 1 } } });
    await writeAudit({ actorType: "USER", actorId: actor.id, action: "staff.role.change", entityType: "User", entityId: userId, metadata: { from: user.role.key, to: role.key } }, tx);
  });
}

export async function setStaffStatus(actor: Actor, userId: string, status: "ACTIVE" | "DISABLED") {
  ensure(actor, "ADMIN_USER_MANAGE");
  if (userId === actor.id) throw new AdminRefusal("Vous ne pouvez pas désactiver votre propre compte.");
  const user = await db().user.findFirst({ where: { id: userId, role: { isStaff: true } }, include: { role: true } });
  if (!user) throw new AdminRefusal("Membre de l’équipe introuvable.");
  if (user.role.key === "SUPER_ADMIN" && actor.roleKey !== "SUPER_ADMIN") throw new AdminRefusal("Seul un super-administrateur peut modifier un super-administrateur.");
  if (status === "DISABLED" && user.role.key === "SUPER_ADMIN" && !(await otherActiveSuperAdmins(userId))) throw new AdminRefusal("C’est le dernier super-administrateur actif.");
  await db().$transaction(async (tx) => {
    const { count } = await tx.user.updateMany({ where: { id: userId, status: status === "ACTIVE" ? "DISABLED" : "ACTIVE" }, data: { status, sessionVersion: { increment: 1 } } });
    if (!count) throw new AdminRefusal("Ce compte a déjà ce statut.");
    await writeAudit({ actorType: "USER", actorId: actor.id, action: status === "DISABLED" ? "staff.disable" : "staff.enable", entityType: "User", entityId: userId }, tx);
  });
}

/* ---------------------------------------------------------------- roles */

export async function listRoles(actor: Actor) {
  ensure(actor, "ROLE_MANAGE");
  return db().role.findMany({ orderBy: [{ isSystem: "desc" }, { name: "asc" }], include: { permissions: true, _count: { select: { users: true } } } });
}

const validPermissions = (list: string[]): Permission[] => list.filter((p): p is Permission => (ALL_PERMISSIONS as readonly string[]).includes(p));

function roleKeyFrom(name: string): string {
  return name.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 32) || "ROLE";
}

export async function createRole(actor: Actor, input: { name: string; description: string; permissions: string[] }) {
  ensure(actor, "ROLE_MANAGE");
  const permissions = validPermissions(input.permissions);
  let key = roleKeyFrom(input.name);
  if (await db().role.findUnique({ where: { key } })) key = `${key}_${Date.now().toString(36).toUpperCase()}`.slice(0, 40);
  await db().$transaction(async (tx) => {
    const role = await tx.role.create({ data: { key, name: input.name, description: input.description || null, isStaff: true, isSystem: false, permissions: { create: permissions.map((permission) => ({ permission })) } } });
    await writeAudit({ actorType: "USER", actorId: actor.id, action: "role.create", entityType: "Role", entityId: role.id, metadata: { key, permissions } }, tx);
  });
}

/** Permissions take effect on the next request of every member (they are reloaded each time). */
export async function updateRole(actor: Actor, roleId: string, input: { name: string; description: string; permissions: string[] }) {
  ensure(actor, "ROLE_MANAGE");
  const role = await db().role.findUnique({ where: { id: roleId }, include: { permissions: true } });
  if (!role) throw new AdminRefusal("Rôle introuvable.");
  if (role.key === "SUPER_ADMIN") throw new AdminRefusal("Le rôle super-administrateur a toujours tous les droits : il n’est pas modifiable.");
  if (!role.isStaff && input.permissions.length) throw new AdminRefusal("Le rôle client ne donne accès à aucune section du back-office.");
  const permissions = validPermissions(input.permissions);
  const before = role.permissions.map((p) => p.permission);
  await db().$transaction(async (tx) => {
    await tx.role.update({ where: { id: roleId }, data: { name: input.name, description: input.description || null } });
    await tx.rolePermission.deleteMany({ where: { roleId } });
    if (permissions.length) await tx.rolePermission.createMany({ data: permissions.map((permission) => ({ roleId, permission })) });
    await writeAudit({ actorType: "USER", actorId: actor.id, action: "role.update", entityType: "Role", entityId: roleId, metadata: { added: permissions.filter((p) => !before.includes(p)), removed: before.filter((p) => !permissions.includes(p)) } }, tx);
  });
}

export async function deleteRole(actor: Actor, roleId: string) {
  ensure(actor, "ROLE_MANAGE");
  const role = await db().role.findUnique({ where: { id: roleId }, include: { _count: { select: { users: true } } } });
  if (!role) throw new AdminRefusal("Rôle introuvable.");
  if (role.isSystem) throw new AdminRefusal("Les rôles système ne peuvent pas être supprimés.");
  if (role._count.users) throw new AdminRefusal("Ce rôle est encore attribué : changez d’abord le rôle de ses membres.");
  await db().$transaction(async (tx) => {
    await tx.role.delete({ where: { id: roleId } });
    await writeAudit({ actorType: "USER", actorId: actor.id, action: "role.delete", entityType: "Role", entityId: roleId, metadata: { key: role.key } }, tx);
  });
}
