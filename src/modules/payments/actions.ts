"use server";

import { getCurrentUser, requireUser } from "@/server/auth/session";
import { consumeRateLimit, RATE_LIMITS } from "@/server/security/rate-limit";
import { fieldErrorsOf } from "@/lib/action-state";
import { bookingFormSchema } from "@/modules/reservations/schemas";
import type { StayErrors } from "@/modules/reservations/domain/stay";
import { paymentsConfigured } from "./stripe";
import { resumeCheckout, startCheckout, type CheckoutResult } from "./service";
import { bookPayOnSite } from "@/modules/reservations/service";
import { after } from "next/server";
import { processOutbox } from "@/modules/notifications/outbox";

/*
 * Payment Server Actions. The booking form is validated again here (never trusted), the customer
 * must be signed in (ADR-011), and the amount is the one computed by the reservation service.
 */

export type FunnelSession = { signedIn: false } | { signedIn: true; firstName: string; lastName: string; email: string; phone: string };

/** Lets the (static) funnel know whether the visitor is signed in, and prefill their details. */
export async function funnelSessionAction(): Promise<FunnelSession> {
  const u = await getCurrentUser();
  if (!u) return { signedIn: false };
  return { signedIn: true, firstName: u.firstName, lastName: u.lastName, email: u.email, phone: u.phone ?? "" };
}

export type CheckoutState =
  | { status: "redirect"; url: string }
  | { status: "auth" }
  | { status: "invalid"; fieldErrors: Record<string, string> }
  | { status: "stay"; errors: StayErrors }
  | { status: "error"; message: string };

const MESSAGES: Record<string, string> = {
  NOT_BOOKABLE: "Cette formule n’est plus ouverte à la réservation en ligne.",
  NO_PRICE: "Aucun tarif n’est publié pour ces dates.",
  FULL: "La dernière place vient d’être réservée pour ces dates. Choisissez d’autres dates ou une autre formule.",
  IDEMPOTENCY_CONFLICT: "Cette demande a déjà été utilisée. Rechargez la page pour recommencer.",
  INVALID_KEY: "Demande invalide. Rechargez la page pour recommencer.",
  NOT_PAYABLE: "Le délai de paiement de cette réservation est dépassé. Recommencez la réservation.",
  PROVIDER_ERROR: "Le service de paiement ne répond pas. Réessayez dans un instant : aucune somme n’a été débitée.",
};

function toState(r: CheckoutResult): CheckoutState {
  if (r.ok) return { status: "redirect", url: r.url };
  if (r.reason === "INVALID_STAY") return { status: "stay", errors: r.errors };
  return { status: "error", message: MESSAGES[r.reason] ?? "Le paiement n’a pas pu démarrer." };
}

export async function startCheckoutAction(input: unknown, idempotencyKey: string): Promise<CheckoutState> {
  if (!paymentsConfigured()) return { status: "error", message: "Le paiement en ligne n’est pas encore ouvert." };
  const user = await getCurrentUser();
  if (!user) return { status: "auth" };
  const parsed = bookingFormSchema.safeParse(input);
  if (!parsed.success) return { status: "invalid", fieldErrors: fieldErrorsOf(parsed.error) };
  if (!(await consumeRateLimit(RATE_LIMITS.reservationChange, user.id)).allowed) {
    return { status: "error", message: "Trop de tentatives. Réessayez plus tard." };
  }
  const d = parsed.data;
  const r = await startCheckout({
    userId: user.id,
    idempotencyKey,
    request: { parkingSlug: d.parking, offerCode: d.offer, departure: { date: d.departureDate, time: d.departureTime }, ret: { date: d.returnDate, time: d.returnTime } },
    details: { plate: d.plate, passengers: d.passengers, outboundFlight: d.outboundFlight, returnFlight: d.returnFlight, firstName: d.firstName, lastName: d.lastName, email: d.email, phone: d.phone },
  });
  return toState(r);
}

export async function resumeCheckoutAction(reference: string): Promise<CheckoutState> {
  if (!paymentsConfigured()) return { status: "error", message: "Le paiement en ligne n’est pas encore ouvert." };
  const user = await requireUser(`/compte/reservations/${reference}`);
  if (!/^AP-[A-Z]{3}-[A-Z0-9]{6}$/.test(reference)) return { status: "error", message: MESSAGES.NOT_PAYABLE! };
  return toState(await resumeCheckout(user.id, reference));
}

/** « Payer sur place à mon retour »: the booking is confirmed at once, the amount is due on site. */
export async function bookPayOnSiteAction(input: unknown, idempotencyKey: string): Promise<CheckoutState> {
  const user = await getCurrentUser();
  if (!user) return { status: "auth" };
  const parsed = bookingFormSchema.safeParse(input);
  if (!parsed.success) return { status: "invalid", fieldErrors: fieldErrorsOf(parsed.error) };
  if (!(await consumeRateLimit(RATE_LIMITS.reservationChange, user.id)).allowed) {
    return { status: "error", message: "Trop de tentatives. Réessayez plus tard." };
  }
  const d = parsed.data;
  const r = await bookPayOnSite({
    userId: user.id,
    idempotencyKey,
    request: { parkingSlug: d.parking, offerCode: d.offer, departure: { date: d.departureDate, time: d.departureTime }, ret: { date: d.returnDate, time: d.returnTime } },
    details: { plate: d.plate, passengers: d.passengers, outboundFlight: d.outboundFlight, returnFlight: d.returnFlight, firstName: d.firstName, lastName: d.lastName, email: d.email, phone: d.phone },
  });
  if (!r.ok) return toState(r);
  after(() => processOutbox().catch((e) => console.error("outbox", e)));
  return { status: "redirect", url: `/compte/reservations/${r.reference}?reservation=confirmee` };
}
