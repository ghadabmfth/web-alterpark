import { z } from "zod";
import { reportError } from "@/server/monitoring/report";
import { consumeRateLimit } from "@/server/security/rate-limit";
import { requestFingerprint } from "@/server/security/request";
import { hasDatabase } from "@/server/db/client";

/* Receives browser error reports (instrumentation-client.ts): same-origin only, size- and rate-limited. */
const schema = z.object({ name: z.string().max(100), message: z.string().min(1).max(1000), path: z.string().max(300), stack: z.string().max(2000).optional() });
const RULE = { name: "client-error:ip", limit: 30, windowSeconds: 600 };

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return new Response(null, { status: 403 });
  const text = await request.text();
  if (text.length > 4000) return new Response(null, { status: 413 });
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return new Response(null, { status: 400 });
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) return new Response(null, { status: 400 });
  if (hasDatabase()) {
    const { ipHash } = await requestFingerprint();
    if (!(await consumeRateLimit(RULE, ipHash)).allowed) return new Response(null, { status: 429 });
  }
  await reportError({ source: "client", ...parsed.data });
  return new Response(null, { status: 204 });
}
