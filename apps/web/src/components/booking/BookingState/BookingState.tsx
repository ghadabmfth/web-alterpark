/* Proposé : états vides, de chargement et d'erreur du tunnel, construits sur Alert et Button. */
import type { ReactNode } from "react";
import { cx } from "../../lib/cx";
import type { Href } from "../../lib/types";
import type { Tone } from "../../icons/ui";
import { Alert } from "../../feedback/Alert/Alert";
import { Button } from "../../actions/Button/Button";

export interface BookingLoadingProps {
  /** Texte lu et affiché, ex. « Recherche des places disponibles… » */
  label: string;
  /** Grand format (page entière), sinon en ligne. */
  size?: "inline" | "block";
  className?: string;
}

/** Indicateur de chargement : roue orange (immobile si animations réduites) et texte, annoncé aux lecteurs d'écran. */
export function BookingLoading({ label, size = "inline", className }: BookingLoadingProps) {
  return (
    <div className={cx("ap-root ap-loading", size === "block" && "ap-loading--block", className)} role="status">
      <span className="ap-loading__spinner" aria-hidden />
      <span className="ap-loading__label">{label}</span>
    </div>
  );
}

export type BookingNoticeKind = "no-availability" | "quote-expired" | "hold-expired" | "payment-failed" | "place-unavailable" | "error";

interface NoticeCopy {
  tone: Tone;
  title: string;
  text: string;
}

/** Textes par défaut. Les durées viennent de la configuration (devis : 15 min ; blocage : 20 min par défaut). */
export function noticeCopy(kind: BookingNoticeKind, opts: { quoteMinutes?: number; holdMinutes?: number } = {}): NoticeCopy {
  switch (kind) {
    case "no-availability":
      return {
        tone: "warning",
        title: "Aucune place disponible pour ces dates",
        text: "Le parking est complet sur au moins un jour de votre séjour. Essayez d’autres dates ou un autre parking.",
      };
    case "quote-expired":
      return {
        tone: "warning",
        title: "Votre tarif a expiré",
        text: `Les tarifs proposés sont garantis ${opts.quoteMinutes ?? 15} minutes. Relancez la recherche pour obtenir un tarif à jour.`,
      };
    case "hold-expired":
      return {
        tone: "warning",
        title: "Le délai de paiement est dépassé",
        text: `Votre place était bloquée ${opts.holdMinutes ?? 20} minutes et a été libérée. Aucun montant n’a été débité. Relancez la réservation pour vérifier les disponibilités.`,
      };
    case "payment-failed":
      return {
        tone: "error",
        title: "Le paiement n’a pas abouti",
        text: "Aucun montant n’a été débité. Vérifiez vos informations bancaires ou essayez un autre moyen de paiement.",
      };
    case "place-unavailable":
      return {
        tone: "error",
        title: "Cette place n’est plus disponible",
        text: "La dernière place sur ces dates vient d’être réservée. Si un paiement a été effectué, il vous est intégralement remboursé.",
      };
    case "error":
      return {
        tone: "error",
        title: "Le service de réservation ne répond pas",
        text: "Réessayez dans quelques instants. Si le problème persiste, contactez-nous.",
      };
  }
}

export interface BookingNoticeProps {
  kind: BookingNoticeKind;
  /** Remplace le titre par défaut. */
  title?: string;
  /** Remplace le texte par défaut. */
  children?: ReactNode;
  /** Action principale (bouton orange). */
  action?: Href;
  /** Action secondaire (bouton contour). */
  secondaryAction?: Href;
  quoteMinutes?: number;
  holdMinutes?: number;
  className?: string;
}

/** État bloquant d'une étape : message (icône, mot et couleur du ton) et actions pour continuer. */
export function BookingNotice({ kind, title, children, action, secondaryAction, quoteMinutes, holdMinutes, className }: BookingNoticeProps) {
  const copy = noticeCopy(kind, { quoteMinutes, holdMinutes });
  return (
    <div className={cx("ap-root ap-notice", className)}>
      <Alert tone={copy.tone} title={title || copy.title}>
        {children || copy.text}
      </Alert>
      {action || secondaryAction ? (
        <div className="ap-notice__actions">
          {action ? (
            <Button href={action.href} onClick={action.onClick} size="sm">
              {action.label}
            </Button>
          ) : null}
          {secondaryAction ? (
            <Button href={secondaryAction.href} onClick={secondaryAction.onClick} size="sm" variant="outline">
              {secondaryAction.label}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
