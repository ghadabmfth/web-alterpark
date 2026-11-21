import { afterEach, describe, expect, it, vi } from "vitest";
import { db } from "@/server/db/client";
import { hashToken } from "./tokens";
import {
  changePassword,
  loadSessionUser,
  registerCustomer,
  requestPasswordReset,
  resetPassword,
  verifyCredentials,
  verifyEmail,
} from "./service";

const unique = () => `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
const PASSWORD = "correct horse battery staple";

/** Raw token of the last e-mail sent to `email` (from the outbox payload). */
async function lastLinkToken(email: string, template: string): Promise<string> {
  const n = await db().notification.findFirstOrThrow({ where: { recipient: email, template }, orderBy: { createdAt: "desc" } });
  return new URL((n.payload as { url: string }).url).searchParams.get("token")!;
}

describe("registration and login", () => {
  it("creates a customer, a verification token, an outbox e-mail and an audit entry", async () => {
    const email = unique();
    const r = await registerCustomer({ firstName: "Sophie", lastName: "Martin", email: `  ${email.toUpperCase()} `, phone: "", password: PASSWORD });
    expect(r.ok).toBe(true);
    const user = await db().user.findUniqueOrThrow({ where: { email }, include: { role: true } });
    expect(user.role.key).toBe("CUSTOMER");
    expect(user.passwordHash).toMatch(/^\$argon2id\$/);
    expect(await db().authToken.count({ where: { userId: user.id, purpose: "EMAIL_VERIFICATION" } })).toBe(1);
    expect(await db().notification.count({ where: { userId: user.id, template: "auth.verify-email", status: "PENDING" } })).toBe(1);
    expect(await db().auditLog.count({ where: { entityId: user.id, action: "user.register" } })).toBe(1);
  });

  it("refuses a second account with the same e-mail, whatever the case", async () => {
    const email = unique();
    await registerCustomer({ firstName: "A", lastName: "B", email, phone: "", password: PASSWORD });
    expect(await registerCustomer({ firstName: "A", lastName: "B", email: email.toUpperCase(), phone: "", password: PASSWORD })).toEqual({ ok: false, reason: "EMAIL_TAKEN" });
  });

  it("verifies credentials and rejects wrong passwords, unknown and disabled accounts", async () => {
    const email = unique();
    await registerCustomer({ firstName: "A", lastName: "B", email, phone: "", password: PASSWORD });
    expect(await verifyCredentials(email, PASSWORD)).toMatchObject({ sessionVersion: 0 });
    expect(await verifyCredentials(email, "wrong password!!")).toBeNull();
    expect(await verifyCredentials(unique(), PASSWORD)).toBeNull();
    await db().user.update({ where: { email }, data: { status: "DISABLED" } });
    expect(await verifyCredentials(email, PASSWORD)).toBeNull();
  });
});

describe("sessions", () => {
  it("loads the role's permissions and rejects a stale sessionVersion", async () => {
    const admin = await db().role.findUniqueOrThrow({ where: { key: "ADMIN" } });
    const email = unique();
    const { userId } = (await registerCustomer({ firstName: "A", lastName: "B", email, phone: "", password: PASSWORD })) as { userId: string };
    await db().user.update({ where: { id: userId }, data: { roleId: admin.id } });
    const s = await loadSessionUser(userId, 0);
    expect(s).toMatchObject({ roleKey: "ADMIN", isStaff: true });
    expect(s!.permissions).toContain("RESERVATION_READ");
    expect(s!.permissions).not.toContain("ROLE_MANAGE");
    await db().user.update({ where: { id: userId }, data: { sessionVersion: { increment: 1 } } });
    expect(await loadSessionUser(userId, 0)).toBeNull();
  });
});

describe("e-mail verification and password reset", () => {
  it("verifies the e-mail once", async () => {
    const email = unique();
    await registerCustomer({ firstName: "A", lastName: "B", email, phone: "", password: PASSWORD });
    const token = await lastLinkToken(email, "auth.verify-email");
    expect(await verifyEmail(token)).toBe(true);
    expect(await verifyEmail(token)).toBe(false);
    expect((await db().user.findUniqueOrThrow({ where: { email } })).emailVerifiedAt).not.toBeNull();
  });

  it("does nothing for unknown e-mails (no enumeration)", async () => {
    const before = await db().authToken.count();
    await requestPasswordReset(unique());
    expect(await db().authToken.count()).toBe(before);
  });

  it("resets the password once, revokes sessions and invalidates older links", async () => {
    const email = unique();
    await registerCustomer({ firstName: "A", lastName: "B", email, phone: "", password: PASSWORD });
    await requestPasswordReset(email);
    const first = await lastLinkToken(email, "auth.reset-password");
    await requestPasswordReset(email);
    const second = await lastLinkToken(email, "auth.reset-password");
    expect(await resetPassword(first, "a brand new long password")).toBe(false); // superseded
    expect(await resetPassword(second, "a brand new long password")).toBe(true);
    expect(await resetPassword(second, "another long password!")).toBe(false); // single use
    expect(await verifyCredentials(email, PASSWORD)).toBeNull();
    expect(await verifyCredentials(email, "a brand new long password")).toMatchObject({ sessionVersion: 1 });
    expect(await db().notification.count({ where: { recipient: email, template: "auth.password-changed" } })).toBe(1);
  });

  it("rejects expired reset links", async () => {
    const email = unique();
    await registerCustomer({ firstName: "A", lastName: "B", email, phone: "", password: PASSWORD });
    await requestPasswordReset(email);
    const token = await lastLinkToken(email, "auth.reset-password");
    await db().authToken.update({ where: { tokenHash: hashToken(token) }, data: { expiresAt: new Date(Date.now() - 1000) } });
    expect(await resetPassword(token, "a brand new long password")).toBe(false);
  });

  it("changes the password only with the current one", async () => {
    const email = unique();
    const { userId } = (await registerCustomer({ firstName: "A", lastName: "B", email, phone: "", password: PASSWORD })) as { userId: string };
    expect(await changePassword(userId, "not my password", "a brand new long password")).toBe(false);
    expect(await changePassword(userId, PASSWORD, "a brand new long password")).toBe(true);
    expect(await loadSessionUser(userId, 0)).toBeNull();
  });
});

describe("outbox", () => {
  afterEach(() => vi.restoreAllMocks());

  it("sends pending e-mails once and retries failures with back-off", async () => {
    const { processOutbox } = await import("@/modules/notifications/outbox");
    const transport = await import("@/server/email/transport");
    const email = unique();
    await registerCustomer({ firstName: "A", lastName: "B", email, phone: "", password: PASSWORD });

    const failing = vi.spyOn(transport, "emailTransport").mockReturnValue({ send: async () => Promise.reject(new Error("provider down")) });
    await processOutbox(500);
    const failed = await db().notification.findFirstOrThrow({ where: { recipient: email } });
    expect(failed).toMatchObject({ status: "PENDING", attempts: 1, lastError: "provider down" });
    expect(failed.nextAttemptAt.getTime()).toBeGreaterThan(Date.now());
    failing.mockRestore();

    const sent: string[] = [];
    vi.spyOn(transport, "emailTransport").mockReturnValue({ send: async (m) => void sent.push(m.to) });
    await db().notification.update({ where: { id: failed.id }, data: { nextAttemptAt: new Date() } });
    await processOutbox(500);
    expect(sent).toContain(email);
    expect((await db().notification.findUniqueOrThrow({ where: { id: failed.id } })).status).toBe("SENT");
    await processOutbox(500);
    expect(sent.filter((t) => t === email)).toHaveLength(1);
  });
});
