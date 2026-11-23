/*
 * Error monitoring without a vendor lock-in. Every server error (instrumentation onRequestError)
 * and every browser error (instrumentation-client → /api/monitoring/client-error) becomes ONE
 * structured JSON line in the logs (Vercel: Logs, filter `"alterpark.error"`; a Log Drain can
 * forward them). If ERROR_WEBHOOK_URL is set (Slack, Better Stack, Sentry HTTP ingest…), the same
 * payload is POSTed to it, with a short timeout so reporting never slows a request down.
 *
 * Never logged: query strings (reset and verification links carry tokens there), headers,
 * cookies, request bodies, user data.
 */

export interface ErrorReport {
  source: "server" | "client";
  message: string;
  name?: string;
  digest?: string;
  path?: string;
  method?: string;
  routePath?: string;
  routeType?: string;
  stack?: string;
}

/** "/reinitialiser-mot-de-passe?token=abc" → "/reinitialiser-mot-de-passe" */
export function stripQuery(path: string | undefined): string | undefined {
  if (!path) return path;
  return path.split(/[?#]/)[0]!.slice(0, 300);
}

export function toReport(input: ErrorReport): ErrorReport & { level: "error"; event: "alterpark.error"; at: string; env: string } {
  return {
    level: "error",
    event: "alterpark.error",
    at: new Date().toISOString(),
    env: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown",
    ...input,
    message: input.message.slice(0, 1000),
    path: stripQuery(input.path),
    stack: input.stack?.split("\n").slice(0, 12).join("\n"),
  };
}

export async function reportError(input: ErrorReport): Promise<void> {
  const report = toReport(input);
  console.error(JSON.stringify(report));
  const url = process.env.ERROR_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(report), signal: AbortSignal.timeout(2000) });
  } catch {
    /* reporting must never fail the request */
  }
}
