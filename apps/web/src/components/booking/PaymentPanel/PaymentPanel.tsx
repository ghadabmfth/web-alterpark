/* Proposé : cadre de l'étape paiement. Le Payment Element de Stripe est monté dans `children` (phase 5). */
import { useId, type ReactNode } from "react";
import { cx } from "../../lib/cx";
import { Alert } from "../../feedback/Alert/Alert";
import { Button } from "../../actions/Button/Button";
import { BookingIcon } from "../../icons/glyphs";
import { BookingLoading } from "../BookingState/BookingState";
import { formatEuros } from "../../lib/format";
import { DEFAULT_TIME_ZONE, formatTime } from "@/lib/booking/datetime";

export interface PaymentPanelProps {
  /** Montant à régler, en centimes (calculé par le plugin). */
  amountCents: number;
  /**
   * loading : préparation du paiement (blocage et PaymentIntent) · ready : formulaire Stripe prêt ·
   * processing : paiement en cours · failed : échec signalé par Stripe (message dans `error`).
   */
  status: "loading" | "ready" | "processing" | "failed";
  /** Message d'erreur renvoyé par Stripe (status failed). */
  error?: string;
  /** Fin du blocage de la place (UTC). */
  holdExpiresAt?: number | string;
  timeZone?: string;
  /** Lance la confirmation du paiement (stripe.confirmPayment). Sans gestionnaire, le bouton reste désactivé. */
  onPay?: () => void;
  /** Emplacement du Payment Element de Stripe. */
  children?: ReactNode;
  className?: string;
}

/** Montant, durée du blocage, emplacement du formulaire Stripe, bouton de paiement et mentions de sécurité. */
export function PaymentPanel({ amountCents, status, error, holdExpiresAt, timeZone = DEFAULT_TIME_ZONE, onPay, children, className }: PaymentPanelProps) {
  const titleId = useId();
  const amount = formatEuros(amountCents);
  const expires = holdExpiresAt == null ? null : typeof holdExpiresAt === "number" ? holdExpiresAt : Date.parse(holdExpiresAt);
  return (
    <section className={cx("ap-root ap-pay", className)} aria-labelledby={titleId}>
      <div className="ap-pay__head">
        <h2 className="ap-pay__title" id={titleId}>
          Paiement sécurisé
        </h2>
        <p className="ap-pay__amount">
          <span>Montant à régler</span>
          <b>{amount}</b>
        </p>
      </div>
      {expires != null && status !== "loading" ? (
        <Alert tone="info" title="Votre place est bloquée">
          {`Réglez avant ${formatTime(expires, timeZone)} pour la conserver. Passé ce délai, elle sera libérée.`}
        </Alert>
      ) : null}
      {status === "failed" ? (
        <Alert tone="error" title="Le paiement n’a pas abouti">
          {error || "Aucun montant n’a été débité. Vérifiez vos informations bancaires ou essayez un autre moyen de paiement."}
        </Alert>
      ) : null}
      <div className="ap-pay__element" aria-busy={status === "loading" || undefined}>
        {status === "loading" ? <BookingLoading label="Préparation du paiement sécurisé…" /> : children}
      </div>
      <Button fullWidth disabled={!onPay || status === "loading" || status === "processing"} onClick={onPay}>
        {status === "processing" ? "Paiement en cours…" : `Payer ${amount}`}
      </Button>
      <p className="ap-pay__note">
        <BookingIcon name="shield" className="ap-pay__note-ico" />
        <span>Paiement traité par Stripe. Vos données bancaires ne transitent pas par nos serveurs.</span>
      </p>
    </section>
  );
}
