import type { PaymentStatus, RefundStatus } from "@/generated/prisma/enums";
import type { BadgeTone } from "@/components/ui/feedback/Badge";

/* Labels of the back office (French), shared by lists and details. */

export const PAYMENT_LABELS: Record<PaymentStatus, [string, BadgeTone]> = {
  PENDING: ["En attente", "warning"],
  REQUIRES_ACTION: ["Action requise", "warning"],
  PROCESSING: ["En vérification", "info"],
  SUCCEEDED: ["Payé", "success"],
  FAILED: ["Échoué", "error"],
  CANCELED: ["Abandonné", "neutral"],
};

export const REFUND_LABELS: Record<RefundStatus, [string, BadgeTone]> = {
  PENDING: ["En cours", "warning"],
  SUCCEEDED: ["Remboursé", "success"],
  FAILED: ["Échoué", "error"],
  CANCELED: ["Annulé", "neutral"],
};

const dt = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
/** 22/11/2026 15:04 (Paris). */
export const shortDateTime = (d: Date) => dt.format(d);

/** Human labels of audit actions (unknown ones are shown as-is). */
export const AUDIT_LABELS: Record<string, string> = {
  "reservation.hold": "Place bloquée, paiement en attente",
  "reservation.confirm": "Réservation confirmée",
  "reservation.confirm.no-capacity": "Paiement tardif refusé : plus de place",
  "reservation.expire": "Délai de paiement dépassé",
  "reservation.abandon": "Abandonnée par le client",
  "reservation.cancel": "Annulée par le client",
  "reservation.cancel.staff": "Annulée par l’équipe",
  "reservation.cancellation-request": "Demande d’annulation du client",
  "reservation.cancellation-request.reject": "Demande d’annulation refusée",
  "reservation.check-in": "Véhicule déposé",
  "reservation.complete": "Véhicule rendu",
  "reservation.refund": "Remboursement décidé par l’équipe",
  "payment.checkout-start": "Paiement démarré",
  "payment.checkout-error": "Erreur du prestataire de paiement",
  "payment.succeeded": "Paiement reçu",
  "payment.failed": "Paiement refusé",
  "payment.expired": "Session de paiement expirée",
  "payment.amount-mismatch": "Montant payé incohérent",
  "refund.succeeded": "Remboursement effectué",
  "refund.failed": "Remboursement en échec",
};

export const PARKING_STATUS: Record<string, [string, BadgeTone]> = {
  ACTIVE: ["Ouvert à la réservation", "success"],
  DRAFT: ["Brouillon", "info"],
  SUSPENDED: ["Suspendu", "warning"],
};

export const CONTACT_STATUS: Record<string, [string, BadgeTone]> = {
  NEW: ["Nouvelle", "warning"],
  IN_PROGRESS: ["En cours", "info"],
  RESOLVED: ["Traitée", "success"],
  SPAM: ["Indésirable", "neutral"],
  ARCHIVED: ["Archivée", "neutral"],
};
