/* Étapes du tunnel de réservation et leur état. */

export interface BookingStep {
  id: string;
  label: string;
  /** Lien de retour vers une étape terminée (facultatif). */
  href?: string;
}

/** Ordre du parcours : recherche (parking + dates) → offre → coordonnées → récapitulatif → paiement → confirmation. */
export const BOOKING_STEPS: readonly BookingStep[] = [
  { id: "search", label: "Dates" },
  { id: "offer", label: "Offre" },
  { id: "customer", label: "Coordonnées" },
  { id: "summary", label: "Récapitulatif" },
  { id: "payment", label: "Paiement" },
  { id: "confirmation", label: "Confirmation" },
];

export type StepStatus = "complete" | "current" | "upcoming";

/** Index de l'étape courante, borné ; -1 si l'identifiant est inconnu. */
export function stepIndex(steps: readonly BookingStep[], id: string): number {
  return steps.findIndex((s) => s.id === id);
}

export function stepStatus(index: number, current: number): StepStatus {
  if (index < current) return "complete";
  if (index === current) return "current";
  return "upcoming";
}

/** Progression de 0 à 1 : la première étape compte déjà (barre jamais vide). */
export function stepProgress(current: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(1, Math.max(0, (current + 1) / total));
}
