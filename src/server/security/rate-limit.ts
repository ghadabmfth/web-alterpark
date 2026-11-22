import "server-only";
import { db } from "@/server/db/client";

/*
 * Fixed-window rate limiting stored in PostgreSQL (RateLimitBucket), safe on serverless: one
 * atomic upsert per attempt. `key` must not contain personal data in clear (use hashes).
 */

export interface RateLimitRule {
  /** Logical name, e.g. "login:ip". */
  name: string;
  limit: number;
  windowSeconds: number;
}

export const RATE_LIMITS = {
  loginIp: { name: "login:ip", limit: 20, windowSeconds: 15 * 60 },
  loginAccount: { name: "login:account", limit: 8, windowSeconds: 15 * 60 },
  register: { name: "register:ip", limit: 5, windowSeconds: 60 * 60 },
  passwordReset: { name: "reset:ip", limit: 5, windowSeconds: 60 * 60 },
  contact: { name: "contact:ip", limit: 5, windowSeconds: 60 * 60 },
} satisfies Record<string, RateLimitRule>;

/** Start of the fixed window containing `now`. */
export function windowStart(now: number, windowSeconds: number): Date {
  const size = windowSeconds * 1000;
  return new Date(Math.floor(now / size) * size);
}

/** Counts one attempt; returns false when the limit is exceeded for the current window. */
export async function consumeRateLimit(rule: RateLimitRule, subject: string, now = Date.now()): Promise<{ allowed: boolean; remaining: number }> {
  const key = `${rule.name}:${subject}`.slice(0, 160);
  const start = windowStart(now, rule.windowSeconds);
  const rows = await db().$queryRaw<{ count: number }[]>`
    INSERT INTO "RateLimitBucket" ("key", "windowStart", "count") VALUES (${key}, ${start}, 1)
    ON CONFLICT ("key", "windowStart") DO UPDATE SET "count" = "RateLimitBucket"."count" + 1
    RETURNING "count"`;
  const count = Number(rows[0]?.count ?? 0);
  return { allowed: count <= rule.limit, remaining: Math.max(0, rule.limit - count) };
}

/** Housekeeping (cron): delete buckets older than a day. */
export async function purgeRateLimits(now = Date.now()): Promise<number> {
  const r = await db().rateLimitBucket.deleteMany({ where: { windowStart: { lt: new Date(now - 86_400_000) } } });
  return r.count;
}
