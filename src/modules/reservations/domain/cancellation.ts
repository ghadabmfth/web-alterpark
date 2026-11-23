import type { ReservationStatus } from "@/generated/prisma/enums";

/*
 * Cancellation policy (approved rule Q6): free cancellation by the customer until
 * `freeCancellationHours` before the arrival; after that, a request reviewed by staff; nothing once
 * the stay has started or for a reservation that is not confirmed.
 */
export type CancellationOption = "FREE" | "REQUEST" | "NONE";

export function cancellationOption(r: { status: ReservationStatus; startsAt: Date }, freeCancellationHours: number, now: Date): CancellationOption {
  if (r.status !== "CONFIRMED") return "NONE";
  if (now >= r.startsAt) return "NONE";
  const freeUntil = r.startsAt.getTime() - freeCancellationHours * 3_600_000;
  return now.getTime() <= freeUntil ? "FREE" : "REQUEST";
}
