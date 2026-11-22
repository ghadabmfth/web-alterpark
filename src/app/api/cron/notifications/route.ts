import { timingSafeEqual } from "node:crypto";
import { processOutbox } from "@/modules/notifications/outbox";
import { purgeRateLimits } from "@/server/security/rate-limit";
import { expireHolds } from "@/modules/reservations/service";

/*
 * Vercel Cron job (vercel.json, daily at 03:17 UTC — the Hobby plan allows daily jobs only; every
 * 10 minutes is recommended on Pro): retries pending e-mails (they are normally sent right after
 * the request via after()), marks unpaid holds past their time as EXPIRED (availability already
 * ignores them, so this is bookkeeping, not a correctness requirement) and purges old rate-limit
 * buckets.
 * Authenticated with the CRON_SECRET bearer token that Vercel Cron sends.
 */

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("authorization") ?? "";
  if (!secret || secret.length < 32) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const given = Buffer.from(header);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function GET(request: Request) {
  if (!authorized(request)) return new Response("Unauthorized", { status: 401 });
  const [outbox, purged, expired] = await Promise.all([processOutbox(50), purgeRateLimits(), expireHolds()]);
  return Response.json({ ...outbox, purgedRateLimits: purged, expiredHolds: expired });
}
