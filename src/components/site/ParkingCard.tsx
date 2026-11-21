import { Card } from "@/components/ui/layout/Card";
import { Badge } from "@/components/ui/feedback/Badge";
import { Button } from "@/components/ui/actions/Button";
import { routes } from "@/config/site";
import { isBookable } from "@/modules/parkings/queries";
import type { ParkingSummary } from "@/modules/parkings/types";

/** Summary card of a site: airport, status, services, actions. */
export function ParkingCard({ parking, headingLevel = "h3" }: { parking: ParkingSummary; headingLevel?: "h2" | "h3" }) {
  const bookable = isBookable(parking);
  return (
    <Card
      as="article"
      title={parking.name}
      titleAs={headingLevel}
      subtitle={parking.airportName}
      actions={bookable ? <Badge tone="success">Réservable en ligne</Badge> : <Badge tone="info">Bientôt disponible</Badge>}
      footer={
        <>
          <Button href={routes.parking(parking.slug)} size="sm" variant={bookable ? "secondary" : "primary"}>
            Voir le parking
          </Button>
          {bookable ? (
            <Button href={`${routes.booking}?parking=${parking.slug}`} size="sm">
              Réserver
            </Button>
          ) : null}
        </>
      }
    >
      <p className="m-0 text-text-secondary">{parking.description}</p>
      {parking.offers.length ? (
        <ul className="mt-4 mb-0 flex list-none flex-wrap gap-2 p-0">
          {parking.offers.map((o) => (
            <li key={o.code}>
              <Badge tone={o.highlighted ? "primary" : "neutral"}>{`${o.shortName} · ${o.tagline}`}</Badge>
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}
