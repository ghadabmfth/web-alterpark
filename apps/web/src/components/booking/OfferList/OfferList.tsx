/* Proposé : liste des offres du tunnel, avec ses états (chargement, aucune disponibilité, erreur). */
import type { ReactNode } from "react";
import { cx } from "../../lib/cx";
import type { Href } from "../../lib/types";
import { OfferCard, type BookingOfferQuote } from "../OfferCard/OfferCard";
import { BookingLoading, BookingNotice } from "../BookingState/BookingState";

export interface OfferListProps {
  /** ready : offres affichées · loading : recherche en cours · error : service indisponible. Liste vide en ready : aucune disponibilité. */
  status?: "ready" | "loading" | "error";
  offers: BookingOfferQuote[];
  days: number;
  selectedId?: string;
  onSelect?: (offer: BookingOfferQuote) => void;
  /** Choix en cours d'envoi. */
  pending?: boolean;
  /** Résumé au-dessus des offres (dates et durée). */
  summary?: ReactNode;
  /** Retour à la recherche (aucune disponibilité, erreur). */
  changeDates?: Href;
  /** Relancer la recherche (erreur). */
  retry?: Href;
  className?: string;
}

/** Offres disponibles pour le séjour recherché. */
export function OfferList({ status = "ready", offers, days, selectedId, onSelect, pending, summary, changeDates, retry, className }: OfferListProps) {
  if (status === "loading") {
    return (
      <div className={cx("ap-root ap-offers", className)} aria-busy="true">
        <BookingLoading label="Recherche des places disponibles…" />
        <div className="ap-offers__grid" aria-hidden>
          {[0, 1].map((i) => (
            <div key={i} className="ap-offer ap-offer--skeleton">
              <span className="ap-skeleton ap-skeleton--title" />
              <span className="ap-skeleton ap-skeleton--line" />
              <span className="ap-skeleton ap-skeleton--line" />
              <span className="ap-skeleton ap-skeleton--short" />
              <span className="ap-skeleton ap-skeleton--button" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (status === "error") {
    return <BookingNotice kind="error" className={cx("ap-offers", className)} action={retry} secondaryAction={changeDates} />;
  }
  const available = offers.filter((o) => o.available !== false);
  if (!available.length) {
    return <BookingNotice kind="no-availability" className={cx("ap-offers", className)} action={changeDates} />;
  }
  return (
    <div className={cx("ap-root ap-offers", className)}>
      {summary ? <p className="ap-offers__summary">{summary}</p> : null}
      <p className="ap-sr" role="status">
        {`${available.length} ${available.length > 1 ? "offres disponibles" : "offre disponible"}`}
      </p>
      <ul className="ap-offers__grid">
        {offers.map((o) => (
          <li key={o.id}>
            <OfferCard offer={o} days={days} selected={o.id === selectedId} onSelect={onSelect} pending={pending} />
          </li>
        ))}
      </ul>
    </div>
  );
}
