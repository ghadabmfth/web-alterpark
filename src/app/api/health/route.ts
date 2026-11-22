import { connection } from "next/server";
import { db, hasDatabase } from "@/server/db/client";

/*
 * Health check for uptime monitoring and post-deploy smoke tests: is the app up, and does it reach
 * its database? No secret, no data, never cached. 503 when the database is configured but down.
 */
export async function GET() {
  await connection();
  const version = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local";
  if (!hasDatabase()) return Response.json({ status: "ok", database: "not_configured", version }, { headers: { "Cache-Control": "no-store" } });
  try {
    await Promise.race([db().$queryRaw`SELECT 1`, new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 3000))]);
    return Response.json({ status: "ok", database: "ok", version }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ status: "degraded", database: "unreachable", version }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
