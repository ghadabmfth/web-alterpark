import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/** Fenêtre de validité d'une signature, en secondes (protection contre le rejeu). */
export const SIGNATURE_TTL_SECONDS = 300;

export interface SignatureParts {
  method: string;
  /** Chemin de la route, ex. /apbs/v1/health (sans la racine /wp-json) */
  path: string;
  body: string;
  timestamp: number;
}

/**
 * Chaîne canonique signée, identique côté PHP (Alterpark\Booking\Rest\Auth\HmacGuard) :
 * "<timestamp>\n<MÉTHODE>\n<chemin>\n<sha256 hex du corps>"
 */
export function canonicalString({ method, path, body, timestamp }: SignatureParts): string {
  const bodyHash = createHash("sha256").update(body, "utf8").digest("hex");
  return `${timestamp}\n${method.toUpperCase()}\n${path}\n${bodyHash}`;
}

export function sign(secret: string, parts: SignatureParts): string {
  return createHmac("sha256", secret).update(canonicalString(parts), "utf8").digest("hex");
}

export function verify(
  secret: string,
  parts: SignatureParts,
  signature: string,
  now: number = Math.floor(Date.now() / 1000),
): boolean {
  if (!Number.isInteger(parts.timestamp) || Math.abs(now - parts.timestamp) > SIGNATURE_TTL_SECONDS) {
    return false;
  }
  if (!/^[a-f0-9]{64}$/.test(signature)) return false;
  const expected = Buffer.from(sign(secret, parts), "hex");
  const given = Buffer.from(signature, "hex");
  return expected.length === given.length && timingSafeEqual(expected, given);
}
