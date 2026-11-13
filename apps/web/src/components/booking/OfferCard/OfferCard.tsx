/* Proposé : carte d'offre du tunnel, construite sur Button et les tokens. */
import { useId } from "react";
import { cx } from "../../lib/cx";
import { CheckIcon, WarningIcon } from "../../icons/ui";
import { Button } from "../../actions/Button/Button";
import { formatDays, formatEuros } from "../../lib/format";

/** Offre tarifée renvoyée par la recherche (devis signé côté plugin). Montants en centimes. */
export interface BookingOfferQuote {
  id: string;
  name: string;
  description?: string;
  /** Ce qui est inclus. */
  features: string[];
  /** Total TTC pour le séjour, en centimes. */
  totalCents: number;
  /** Pastille (ex. « Le plus demandé »). */
  badge?: string;
  /** Contour orange (offre mise en avant). */
  highlight?: boolean;
  /** false : plus de place pour cette offre sur ces dates. */
  available?: boolean;
}

export interface OfferCardProps {
  offer: BookingOfferQuote;
  /** Jours facturés, affichés sous le prix. */
  days: number;
  selected?: boolean;
  onSelect?: (offer: BookingOfferQuote) => void;
  /** Envoi en cours après le choix : bouton désactivé. */
  pending?: boolean;
  headingAs?: "h2" | "h3";
  className?: string;
}

/** Nom, inclusions, prix total TTC et action de choix. L'offre choisie porte une coche et le mot « Offre choisie ». */
export function OfferCard({ offer, days, selected, onSelect, pending, headingAs: H = "h3", className }: OfferCardProps) {
  const titleId = useId();
  const available = offer.available !== false;
  return (
    <article
      className={cx("ap-root ap-offer", offer.highlight && "is-highlight", selected && "is-selected", !available && "is-unavailable", className)}
      aria-labelledby={titleId}
    >
      {offer.badge ? <span className="ap-offer__badge">{offer.badge}</span> : null}
      <H className="h4 ap-h4 ap-offer__name" id={titleId}>
        {offer.name}
      </H>
      {offer.description ? <p className="ap-offer__desc">{offer.description}</p> : null}
      {offer.features.length ? (
        <ul className="ap-offer__features" aria-label="Inclus">
          {offer.features.map((f, i) => (
            <li key={i}>
              <CheckIcon />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="ap-offer__price">
        <b>{formatEuros(offer.totalCents)}</b>
        <small>{`TTC pour ${formatDays(days)}`}</small>
      </p>
      {available ? (
        <Button
          fullWidth
          variant={selected ? "secondary" : "primary"}
          aria-pressed={selected ? "true" : "false"}
          disabled={pending}
          iconStart={selected ? <CheckIcon /> : undefined}
          onClick={() => onSelect?.(offer)}
        >
          {selected ? "Offre choisie" : "Choisir cette offre"}
        </Button>
      ) : (
        <p className="ap-offer__full">
          <WarningIcon className="ap-offer__full-ico" />
          <span>Complet pour ces dates</span>
        </p>
      )}
    </article>
  );
}
