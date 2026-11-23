"use client";

import { useState } from "react";
import { BookingBar, type BookingOffer } from "@/components/ui/patterns/BookingBar";
import { routes } from "@/config/site";
import { BOOKING_PERKS } from "@/content/site-content";
import type { ParkingOfferSummary } from "@/modules/parkings/types";

/*
 * BookingBar of a parking page. The search and the chosen service are carried to the booking
 * funnel in the URL; prices are computed by the reservation engine (Phase 5), so the cards show
 * « Tarif à l’étape suivante » until a validated rate exists.
 */
export function ParkingBookingBar({ parkingSlug, offers }: { parkingSlug: string; offers: ParkingOfferSummary[] }) {
  const barOffers: BookingOffer[] = offers.map((o) => ({
    id: o.code,
    name: o.name,
    short: o.shortName,
    tagline: o.tagline,
    badge: o.highlighted ? "Le plus demandé !" : undefined,
    highlight: o.highlighted,
    features: o.features,
    from: o.fromCents != null ? o.fromCents / 100 : undefined,
  }));
  const [query, setQuery] = useState<Record<string, string>>({ parking: parkingSlug });
  const href = `${routes.booking}?${new URLSearchParams(query).toString()}`;
  return (
    <BookingBar
      offers={barOffers}
      perks={BOOKING_PERKS}
      continueHref={href}
      onSearch={(s) =>
        setQuery({ parking: parkingSlug, offre: s.service, depart: s.departure.date, heureDepart: s.departure.time, retour: s.return.date, heureRetour: s.return.time })
      }
      onSelect={(s) => setQuery((q) => ({ ...q, offre: s.offer.id }))}
    />
  );
}
