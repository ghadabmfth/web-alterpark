import "server-only";
import { serverEnv } from "@/lib/env";
import { sign } from "@/lib/signature";

export class WordPressError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = "WordPressError";
  }
}

interface WpRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Signe la requête (obligatoire pour les routes du plugin apbs/v1). */
  signed?: boolean;
  /** Tags de cache Next.js, invalidés par le webhook /api/revalidate. */
  tags?: string[];
  /** Durée de cache en secondes ; false = pas de cache (données transactionnelles). */
  revalidate?: number | false;
  idempotencyKey?: string;
}

/**
 * Seul point d'accès à WordPress. Exécuté côté serveur uniquement :
 * le navigateur ne contacte jamais WordPress et ne voit jamais les secrets.
 */
export async function wpFetch<T>(path: string, opts: WpRequestOptions = {}): Promise<T> {
  const env = serverEnv();
  const method = opts.method ?? "GET";
  const body = opts.body === undefined ? "" : JSON.stringify(opts.body);
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body) headers["Content-Type"] = "application/json";
  if (opts.idempotencyKey) headers["Idempotency-Key"] = opts.idempotencyKey;

  if (opts.signed) {
    const timestamp = Math.floor(Date.now() / 1000);
    const routePath = path.split("?")[0] ?? path;
    headers["X-APBS-Timestamp"] = String(timestamp);
    headers["X-APBS-Signature"] = sign(env.APBS_API_SECRET, { method, path: routePath, body, timestamp });
  }

  const cacheable = method === "GET" && !opts.signed && opts.revalidate !== false;
  const res = await fetch(`${env.WP_API_URL}${path}`, {
    method,
    headers,
    body: body || undefined,
    ...(cacheable
      ? { next: { revalidate: opts.revalidate ?? 3600, tags: opts.tags } }
      : { cache: "no-store" as const }),
    signal: AbortSignal.timeout(10_000),
  });

  const payload: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const p = (payload ?? {}) as { message?: string; code?: string };
    throw new WordPressError(p.message ?? `WordPress a répondu ${res.status}`, res.status, p.code);
  }
  return payload as T;
}
