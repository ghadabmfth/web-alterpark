/* Proposé : confirmation de réservation, avec l'état d'attente du webhook Stripe. */
import { useId, type ReactNode } from "react";
import { cx } from "../../lib/cx";
import { SuccessIcon } from "../../icons/ui";
import { Alert } from "../../feedback/Alert/Alert";
import { BookingLoading } from "../BookingState/BookingState";

export interface BookingConfirmationProps {
  /**
   * pending : paiement accepté, confirmation par le webhook en attente (la page interroge le statut) ·
   * confirmed : réservation confirmée · delayed : la confirmation tarde au-delà du délai d'attente.
   */
  status: "pending" | "confirmed" | "delayed";
  /** Référence de réservation (apbs_bookings.reference). */
  reference: string;
  /** Adresse qui reçoit l'e-mail de confirmation. */
  email: string;
  /** Récapitulatif (BookingSummary). */
  summary?: ReactNode;
  /** Étapes suivantes propres au parking (informations pratiques). Remplacent les étapes par défaut. */
  nextSteps?: ReactNode[];
  /** Coordonnées à contacter si la confirmation tarde. */
  contact?: ReactNode;
  /** Actions (retour à l'accueil, espace client…). */
  actions?: ReactNode;
  headingAs?: "h1" | "h2";
  className?: string;
}

/** Écran final : référence, récapitulatif et étapes suivantes ; état d'attente tant que le webhook n'a pas confirmé. */
export function BookingConfirmation({ status, reference, email, summary, nextSteps, contact, actions, headingAs: H = "h1", className }: BookingConfirmationProps) {
  const titleId = useId();
  if (status === "pending") {
    return (
      <section className={cx("ap-root ap-confirm ap-confirm--pending", className)} aria-labelledby={titleId}>
        <H className="h2 ap-h2 ap-confirm__title" id={titleId}>
          Paiement reçu, confirmation en cours
        </H>
        <BookingLoading size="block" label="Nous finalisons votre réservation. Cette page se met à jour automatiquement." />
        <p className="ap-confirm__text">Ne relancez pas le paiement et ne fermez pas cette page.</p>
        <p className="ap-confirm__ref">
          <span>Référence de réservation</span>
          <strong>{reference}</strong>
        </p>
      </section>
    );
  }
  if (status === "delayed") {
    return (
      <section className={cx("ap-root ap-confirm", className)} aria-labelledby={titleId}>
        <H className="h2 ap-h2 ap-confirm__title" id={titleId}>
          Confirmation en attente
        </H>
        <Alert tone="warning" title="La confirmation prend plus de temps que prévu">
          {`Votre paiement a été accepté. Dès que la réservation est confirmée, vous recevez un e-mail à ${email}. Sans nouvelles d’ici une heure, contactez-nous en indiquant la référence ${reference}.`}
        </Alert>
        <p className="ap-confirm__ref">
          <span>Référence de réservation</span>
          <strong>{reference}</strong>
        </p>
        {contact ? <div className="ap-confirm__contact">{contact}</div> : null}
        {actions ? <div className="ap-confirm__actions">{actions}</div> : null}
      </section>
    );
  }
  const steps = nextSteps ?? [
    <>
      Un e-mail de confirmation vous est envoyé à <b>{email}</b>.
    </>,
    "Le jour du départ, présentez-vous au parking avec votre référence de réservation.",
  ];
  return (
    <section className={cx("ap-root ap-confirm", className)} aria-labelledby={titleId}>
      <div className="ap-confirm__status" role="status">
        <SuccessIcon className="ap-confirm__icon" />
        <span>Réservation confirmée</span>
      </div>
      <H className="h2 ap-h2 ap-confirm__title" id={titleId}>
        Votre place est réservée !
      </H>
      <p className="ap-confirm__ref">
        <span>Référence de réservation</span>
        <strong>{reference}</strong>
      </p>
      {summary}
      <div className="ap-confirm__next">
        <h2 className="ap-confirm__subtitle">Et maintenant ?</h2>
        <ol>
          {steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </div>
      {actions ? <div className="ap-confirm__actions">{actions}</div> : null}
    </section>
  );
}
