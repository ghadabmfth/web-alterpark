import "server-only";
import { hash, verify } from "@node-rs/argon2";
import { db } from "@/server/db/client";
import { writeAudit } from "@/server/audit";
import { absoluteUrl } from "@/config/site";
import { enqueue } from "@/modules/notifications/outbox";
import type { Permission } from "@/generated/prisma/enums";
import { ARGON2_OPTIONS } from "./password-options";
import { hashToken, newToken, normalizeEmail, TOKEN_TTL_MS } from "./tokens";

/*
 * Authentication use cases. Independent from Auth.js (which only calls `verifyCredentials` and
 * `loadSessionUser`), so they are integration-tested against PostgreSQL and the library can be
 * replaced (ADR-008). Every state change is audit-logged; e-mails go through the outbox.
 */

export interface RequestMeta {
  ipHash?: string | null;
  userAgent?: string | null;
}

export interface SessionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  civility: "MME" | "M" | null;
  companyName: string | null;
  postalCode: string | null;
  emailVerified: boolean;
  roleKey: string;
  isStaff: boolean;
  permissions: Permission[];
  sessionVersion: number;
}

// Hash of a random password: verifying against it when the account does not exist keeps the
// response time constant, so timing does not reveal which e-mails have an account.
let dummyHashPromise: Promise<string> | null = null;
const dummyHash = () => (dummyHashPromise ??= hash(newToken().raw, ARGON2_OPTIONS));

export async function hashPassword(password: string): Promise<string> {
  return hash(password, ARGON2_OPTIONS);
}

// ───────────────────────────── Registration ─────────────────────────────

export async function registerCustomer(
  input: { firstName: string; lastName: string; email: string; phone: string; password: string; civility?: "MME" | "M"; companyName?: string; postalCode?: string },
  meta: RequestMeta = {},
): Promise<{ ok: true; userId: string } | { ok: false; reason: "EMAIL_TAKEN" }> {
  const email = normalizeEmail(input.email);
  const existing = await db().user.findUnique({ where: { email }, select: { id: true } });
  if (existing) return { ok: false, reason: "EMAIL_TAKEN" };

  const passwordHash = await hashPassword(input.password);
  const token = newToken();
  try {
    const user = await db().$transaction(async (tx) => {
      const role = await tx.role.findUniqueOrThrow({ where: { key: "CUSTOMER" }, select: { id: true } });
      const created = await tx.user.create({
        data: {
          email,
          civility: input.civility ?? null,
          firstName: input.firstName.trim(),
          lastName: input.lastName.trim(),
          companyName: input.companyName?.trim() || null,
          postalCode: input.postalCode?.trim().toUpperCase() || null,
          phone: input.phone.trim() || null,
          passwordHash,
          roleId: role.id,
        },
      });
      await tx.authToken.create({
        data: { userId: created.id, purpose: "EMAIL_VERIFICATION", tokenHash: token.hash, expiresAt: new Date(Date.now() + TOKEN_TTL_MS.EMAIL_VERIFICATION) },
      });
      await enqueue({ template: "auth.verify-email", recipient: email, userId: created.id, payload: { firstName: created.firstName, url: absoluteUrl(`/verification?token=${token.raw}`) } }, tx);
      await writeAudit({ actorType: "USER", actorId: created.id, action: "user.register", entityType: "User", entityId: created.id, ...meta }, tx);
      return created;
    });
    return { ok: true, userId: user.id };
  } catch (e) {
    // Unique violation: two registrations raced for the same e-mail.
    if ((e as { code?: string }).code === "P2002") return { ok: false, reason: "EMAIL_TAKEN" };
    throw e;
  }
}

// ───────────────────────────── Login ─────────────────────────────

/** Returns the user id when e-mail and password match an active account; null otherwise. */
export async function verifyCredentials(emailInput: string, password: string, meta: RequestMeta = {}): Promise<{ id: string; sessionVersion: number } | null> {
  const email = normalizeEmail(emailInput);
  const user = await db().user.findUnique({ where: { email }, select: { id: true, passwordHash: true, status: true, deletedAt: true, sessionVersion: true } });
  const ok = await verify(user?.passwordHash ?? (await dummyHash()), password).catch(() => false);
  if (!user || !user.passwordHash || !ok || user.status !== "ACTIVE" || user.deletedAt) {
    if (user) await writeAudit({ actorType: "USER", actorId: user.id, action: "user.login.failed", entityType: "User", entityId: user.id, ...meta });
    return null;
  }
  await db().user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await writeAudit({ actorType: "USER", actorId: user.id, action: "user.login", entityType: "User", entityId: user.id, ...meta });
  return { id: user.id, sessionVersion: user.sessionVersion };
}

/** Session check: the user still exists, is active, and the token's version is current. */
export async function loadSessionUser(id: string, sessionVersion: number): Promise<SessionUser | null> {
  const u = await db().user.findUnique({
    where: { id },
    include: { role: { include: { permissions: { select: { permission: true } } } } },
  });
  if (!u || u.status !== "ACTIVE" || u.deletedAt || u.sessionVersion !== sessionVersion) return null;
  return {
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    phone: u.phone,
    civility: u.civility,
    companyName: u.companyName,
    postalCode: u.postalCode,
    emailVerified: !!u.emailVerifiedAt,
    roleKey: u.role.key,
    isStaff: u.role.isStaff,
    permissions: u.role.permissions.map((p) => p.permission),
    sessionVersion: u.sessionVersion,
  };
}

// ───────────────────────────── Tokens ─────────────────────────────

/** Marks a valid token used, atomically. Returns its user id, or null if invalid, used or expired. */
async function consumeToken(raw: string, purpose: "EMAIL_VERIFICATION" | "PASSWORD_RESET"): Promise<string | null> {
  const tokenHash = hashToken(raw);
  const row = await db().authToken.findUnique({ where: { tokenHash }, select: { id: true, userId: true, purpose: true } });
  if (!row || row.purpose !== purpose) return null;
  const claimed = await db().authToken.updateMany({ where: { id: row.id, usedAt: null, expiresAt: { gt: new Date() } }, data: { usedAt: new Date() } });
  return claimed.count === 1 ? row.userId : null;
}

export async function verifyEmail(raw: string, meta: RequestMeta = {}): Promise<boolean> {
  const userId = await consumeToken(raw, "EMAIL_VERIFICATION");
  if (!userId) return false;
  await db().user.update({ where: { id: userId }, data: { emailVerifiedAt: new Date() } });
  await writeAudit({ actorType: "USER", actorId: userId, action: "user.email.verified", entityType: "User", entityId: userId, ...meta });
  return true;
}

/** Always resolves the same way, whether or not the account exists (no account enumeration). */
export async function requestPasswordReset(emailInput: string, meta: RequestMeta = {}): Promise<void> {
  const email = normalizeEmail(emailInput);
  const user = await db().user.findUnique({ where: { email }, select: { id: true, firstName: true, status: true, deletedAt: true } });
  if (!user || user.status !== "ACTIVE" || user.deletedAt) return;
  const token = newToken();
  await db().$transaction(async (tx) => {
    // Only the latest link works.
    await tx.authToken.updateMany({ where: { userId: user.id, purpose: "PASSWORD_RESET", usedAt: null }, data: { usedAt: new Date() } });
    await tx.authToken.create({ data: { userId: user.id, purpose: "PASSWORD_RESET", tokenHash: token.hash, expiresAt: new Date(Date.now() + TOKEN_TTL_MS.PASSWORD_RESET) } });
    await enqueue({ template: "auth.reset-password", recipient: email, userId: user.id, payload: { firstName: user.firstName, url: absoluteUrl(`/reinitialiser-mot-de-passe?token=${token.raw}`) } }, tx);
    await writeAudit({ actorType: "USER", actorId: user.id, action: "user.password.reset.requested", entityType: "User", entityId: user.id, ...meta }, tx);
  });
}

async function setPassword(userId: string, password: string, action: string, meta: RequestMeta, actorId: string | null): Promise<void> {
  const passwordHash = await hashPassword(password);
  await db().$transaction(async (tx) => {
    // Incrementing sessionVersion revokes every existing session.
    const u = await tx.user.update({ where: { id: userId }, data: { passwordHash, sessionVersion: { increment: 1 } }, select: { email: true, firstName: true } });
    await enqueue({ template: "auth.password-changed", recipient: u.email, userId, payload: { firstName: u.firstName } }, tx);
    await writeAudit({ actorType: "USER", actorId, action, entityType: "User", entityId: userId, ...meta }, tx);
  });
}

export async function resetPassword(raw: string, password: string, meta: RequestMeta = {}): Promise<boolean> {
  const userId = await consumeToken(raw, "PASSWORD_RESET");
  if (!userId) return false;
  await setPassword(userId, password, "user.password.reset", meta, userId);
  // The link arrived by e-mail: the address is proven (also completes staff invitations).
  await db().user.updateMany({ where: { id: userId, emailVerifiedAt: null }, data: { emailVerifiedAt: new Date() } });
  return true;
}

export async function changePassword(userId: string, current: string, next: string, meta: RequestMeta = {}): Promise<boolean> {
  const u = await db().user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
  if (!u?.passwordHash || !(await verify(u.passwordHash, current).catch(() => false))) return false;
  await setPassword(userId, next, "user.password.changed", meta, userId);
  return true;
}

export async function updateProfile(userId: string, input: { firstName: string; lastName: string; phone: string; civility?: "MME" | "M" | null; companyName?: string; postalCode?: string }, meta: RequestMeta = {}): Promise<void> {
  await db().user.update({
    where: { id: userId },
    data: {
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      phone: input.phone.trim() || null,
      ...(input.civility !== undefined ? { civility: input.civility } : {}),
      ...(input.companyName !== undefined ? { companyName: input.companyName.trim() || null } : {}),
      ...(input.postalCode !== undefined ? { postalCode: input.postalCode.trim().toUpperCase() || null } : {}),
    },
  });
  await writeAudit({ actorType: "USER", actorId: userId, action: "user.profile.updated", entityType: "User", entityId: userId, metadata: { fields: ["civility", "firstName", "lastName", "companyName", "postalCode", "phone"] }, ...meta });
}
