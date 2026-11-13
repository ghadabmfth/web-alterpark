/* Proposé : récapitulatif de la réservation (parking, dates, offre, détail du prix). */
import { useId } from "react";
import { cx } from "../../lib/cx";
import { formatDays, formatEuros } from "../../lib/format";
import { DEFAULT_TIME_ZONE, formatDateTime } from "@/lib/booking/datetime";

export interface PriceLine {
  label: string;
  /** Montant en centimes ; négatif pour une remise. */
  amountCents: number;
}

export interface BookingSummaryProps {
  parking: { name: string; address?: string };
  /** Début et fin du séjour : instants UTC (ms ou ISO 8601), affichés dans le fuseau du parking. */
  start: number | string;
  end: number | string;
  timeZone?: string;
  days: number;
  offerName: string;
  /** Détail du prix (price_snapshot). */
  lines: PriceLine[];
  totalCents: number;
  /** Coordonnées saisies (étape récapitulatif). */
  customer?: { name: string; email: string; plate: string; passengers: number; flight?: string };
  /** Liens « Modifier » vers les étapes précédentes. */
  editDatesHref?: string;
  editOfferHref?: string;
  editCustomerHref?: string;
  title?: string;
  headingAs?: "h2" | "h3";
  className?: string;
}

const ms = (v: number | string) => (typeof v === "number" ? v : Date.parse(v));

function Edit({ href, what }: { href?: string; what: string }) {
  if (!href) return null;
  return (
    <a className="ap-summary__edit" href={href}>
      Modifier<span className="ap-sr">{` ${what}`}</span>
    </a>
  );
}

/** Parking, dates, offre, coordonnées éventuelles et détail du prix jusqu'au total TTC. */
export function BookingSummary({
  parking,
  start,
  end,
  timeZone = DEFAULT_TIME_ZONE,
  days,
  offerName,
  lines,
  totalCents,
  customer,
  editDatesHref,
  editOfferHref,
  editCustomerHref,
  title = "Récapitulatif",
  headingAs: H = "h2",
  className,
}: BookingSummaryProps) {
  const titleId = useId();
  return (
    <section className={cx("ap-root ap-summary", className)} aria-labelledby={titleId}>
      <H className="ap-summary__title" id={titleId}>
        {title}
      </H>
      <div className="ap-summary__group">
        <dl className="ap-summary__list">
          <div>
            <dt>Parking</dt>
            <dd>
              <b>{parking.name}</b>
              {parking.address ? <span>{parking.address}</span> : null}
            </dd>
          </div>
          <div>
            <dt>Départ</dt>
            <dd>{formatDateTime(ms(start), timeZone)}</dd>
          </div>
          <div>
            <dt>Retour</dt>
            <dd>{formatDateTime(ms(end), timeZone)}</dd>
          </div>
          <div>
            <dt>Durée</dt>
            <dd>{formatDays(days)}</dd>
          </div>
        </dl>
        <Edit href={editDatesHref} what="les dates" />
      </div>
      <div className="ap-summary__group">
        <dl className="ap-summary__list">
          <div>
            <dt>Offre</dt>
            <dd>
              <b>{offerName}</b>
            </dd>
          </div>
        </dl>
        <Edit href={editOfferHref} what="l’offre" />
      </div>
      {customer ? (
        <div className="ap-summary__group">
          <dl className="ap-summary__list">
            <div>
              <dt>Conducteur</dt>
              <dd>
                <b>{customer.name}</b>
                <span>{customer.email}</span>
              </dd>
            </div>
            <div>
              <dt>Véhicule</dt>
              <dd>{customer.plate}</dd>
            </div>
            <div>
              <dt>Passagers</dt>
              <dd>{customer.passengers}</dd>
            </div>
            {customer.flight ? (
              <div>
                <dt>Vol</dt>
                <dd>{customer.flight}</dd>
              </div>
            ) : null}
          </dl>
          <Edit href={editCustomerHref} what="les coordonnées" />
        </div>
      ) : null}
      <dl className="ap-summary__prices" aria-label="Détail du prix">
        {lines.map((l, i) => (
          <div key={i}>
            <dt>{l.label}</dt>
            <dd>{l.amountCents < 0 ? `− ${formatEuros(-l.amountCents)}` : formatEuros(l.amountCents)}</dd>
          </div>
        ))}
        <div className="ap-summary__total">
          <dt>Total TTC</dt>
          <dd>{formatEuros(totalCents)}</dd>
        </div>
      </dl>
    </section>
  );
}
