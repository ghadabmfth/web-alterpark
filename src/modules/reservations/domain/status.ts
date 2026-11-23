import type { ReservationStatus } from "@/generated/prisma/enums";

/*
 * Reservation lifecycle (ARCHITECTURE.md §5.3). Any transition not listed is rejected.
 *
 *   PENDING_PAYMENT ─paid─▶ CONFIRMED ─arrival─▶ CHECKED_IN ─departure─▶ COMPLETED
 *        │  └─abandoned─▶ CANCELLED      └─cancelled─▶ CANCELLED
 *        └─hold expired─▶ EXPIRED ─late payment, space still free─▶ CONFIRMED
 */
export const TRANSITIONS: Record<ReservationStatus, readonly ReservationStatus[]> = {
  PENDING_PAYMENT: ["CONFIRMED", "EXPIRED", "CANCELLED"],
  EXPIRED: ["CONFIRMED"],
  CONFIRMED: ["CHECKED_IN", "CANCELLED"],
  CHECKED_IN: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function canTransition(from: ReservationStatus, to: ReservationStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

/** Does a reservation in this state take a space? A pending hold only until it expires. */
export function consumesCapacity(status: ReservationStatus, holdExpiresAt: Date | null, now: Date): boolean {
  if (status === "CONFIRMED" || status === "CHECKED_IN") return true;
  if (status === "PENDING_PAYMENT") return holdExpiresAt !== null && holdExpiresAt > now;
  return false;
}

export const STATUS_LABELS: Record<ReservationStatus, string> = {
  PENDING_PAYMENT: "Paiement en attente",
  CONFIRMED: "Confirmée",
  CHECKED_IN: "Véhicule déposé",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
  EXPIRED: "Expirée",
};

export const STATUS_TONES: Record<ReservationStatus, "neutral" | "primary" | "success" | "warning" | "error" | "info"> = {
  PENDING_PAYMENT: "warning",
  CONFIRMED: "success",
  CHECKED_IN: "info",
  COMPLETED: "neutral",
  CANCELLED: "error",
  EXPIRED: "neutral",
};
