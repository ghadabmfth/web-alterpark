"use server";

import { after } from "next/server";
import { z } from "zod";
import { refresh } from "next/cache";
import { requireUser } from "@/server/auth/session";
import { consumeRateLimit, RATE_LIMITS } from "@/server/security/rate-limit";
import { requestFingerprint } from "@/server/security/request";
import { hasDatabase } from "@/server/db/client";
import { processOutbox } from "@/modules/notifications/outbox";
import { formatCents } from "@/components/ui/lib/format";
import type { ActionState } from "@/lib/action-state";
import type { StayErrors } from "./domain/stay";
import { searchSchema } from "./schemas";
import { cancelByCustomer, quoteStay } from "./service";

/*
 * Reservation Server Actions. The quote is public (read-only, rate-limited per IP); cancellation
 * requires the signed-in owner (the service scopes the query by user id).
 */

export type QuoteState =
  | { status: "ok"; totalCents: number; total: string; days: number; offerName: string }
  | { status: "invalid"; errors: StayErrors }
  | { status: "unavailable"; message: string };

const UNAVAILABLE: Record<"NOT_BOOKABLE" | "NO_PRICE" | "FULL", string> = {
  NOT_BOOKABLE: "Cette formule n’est pas ouverte à la réservation en ligne. Contactez-nous pour réserver.",
  NO_PRICE: "Aucun tarif n’est encore publié pour ces dates. Contactez-nous pour réserver.",
  FULL: "Plus aucune place n’est disponible pour ces dates dans cette formule. Essayez d’autres dates ou une autre formule.",
};

export async function quoteAction(input: unknown): Promise<QuoteState> {
  const parsed = searchSchema.safeParse(input);
  if (!parsed.success || !hasDatabase()) return { status: "unavailable", message: UNAVAILABLE.NOT_BOOKABLE };
  const { ipHash } = await requestFingerprint();
  if (!(await consumeRateLimit(RATE_LIMITS.quote, ipHash)).allowed) {
    return { status: "unavailable", message: "Trop de recherches en peu de temps. Réessayez dans quelques minutes." };
  }
  const d = parsed.data;
  const r = await quoteStay({
    parkingSlug: d.parking,
    offerCode: d.offer,
    departure: { date: d.departureDate, time: d.departureTime },
    ret: { date: d.returnDate, time: d.returnTime },
  });
  if (r.ok) return { status: "ok", totalCents: r.quote.price.totalCents, total: formatCents(r.quote.price.totalCents), days: r.quote.stay.days, offerName: r.quote.offer.name };
  if (r.reason === "INVALID_STAY") return { status: "invalid", errors: r.errors };
  return { status: "unavailable", message: UNAVAILABLE[r.reason] };
}

const cancelSchema = z.object({
  reference: z.string().regex(/^AP-[A-Z]{3}-[A-Z0-9]{6}$/),
  reason: z.string().max(1000, "1000 caractères au maximum.").optional(),
});

const CANCEL_ERRORS = {
  NOT_FOUND: "Réservation introuvable.",
  NOT_CANCELLABLE: "Cette réservation ne peut plus être annulée en ligne. Contactez-nous.",
  ALREADY_REQUESTED: "Une demande d’annulation est déjà en cours de traitement.",
  REFUND_UNAVAILABLE: "L’annulation en ligne d’une réservation payée sera disponible prochainement. Contactez-nous pour l’annuler.",
  REASON_REQUIRED: "Indiquez le motif de votre demande (5 caractères au minimum).",
} as const;

export async function cancelReservationAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = cancelSchema.safeParse({ reference: formData.get("reference"), reason: formData.get("reason") ?? undefined });
  if (!parsed.success) return { status: "error", message: "Demande invalide." };
  const user = await requireUser(`/compte/reservations/${parsed.data.reference}`);
  if (!(await consumeRateLimit(RATE_LIMITS.reservationChange, user.id)).allowed) {
    return { status: "error", message: "Trop de demandes. Réessayez plus tard." };
  }
  const r = await cancelByCustomer({ userId: user.id, reference: parsed.data.reference, reason: parsed.data.reason });
  if (!r.ok) return { status: "error", message: CANCEL_ERRORS[r.reason], ...(r.reason === "REASON_REQUIRED" ? { fieldErrors: { reason: CANCEL_ERRORS.REASON_REQUIRED } } : {}) };
  after(() => processOutbox().catch((e) => console.error("outbox", e)));
  refresh();
  return {
    status: "success",
    message: r.outcome === "CANCELLED" ? "Votre réservation est annulée." : "Votre demande d’annulation a été transmise. Nous vous répondrons rapidement.",
  };
}
