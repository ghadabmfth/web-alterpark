import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";

/*
 * Request metadata for security features. IP addresses are never stored in clear: only a salted
 * SHA-256 hash (IP_HASH_SALT), enough to rate-limit and investigate abuse.
 */

export async function clientIp(): Promise<string> {
  const h = await headers();
  // Vercel and most proxies put the client first in x-forwarded-for.
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || h.get("x-real-ip") || "0.0.0.0";
}

export function hashIp(ip: string, salt: string | undefined = process.env.IP_HASH_SALT): string {
  if (!salt || salt.length < 32) throw new Error("IP_HASH_SALT must be configured (32+ characters)");
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export async function requestFingerprint(): Promise<{ ipHash: string; userAgent: string | null }> {
  const h = await headers();
  return { ipHash: hashIp(await clientIp()), userAgent: h.get("user-agent")?.slice(0, 255) ?? null };
}
