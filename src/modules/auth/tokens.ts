import { createHash, randomBytes } from "node:crypto";

/*
 * Single-use tokens (e-mail verification, password reset). The raw token only exists in the
 * e-mail link; the database stores its SHA-256 hash.
 */

export const TOKEN_TTL_MS = {
  EMAIL_VERIFICATION: 48 * 3_600_000,
  PASSWORD_RESET: 60 * 60_000,
} as const;

export function newToken(): { raw: string; hash: string } {
  const raw = randomBytes(32).toString("base64url");
  return { raw, hash: hashToken(raw) };
}

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/** "  Sophie@Example.COM " → "sophie@example.com" */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
