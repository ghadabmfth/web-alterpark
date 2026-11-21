import { PageIntro } from "@/components/site/PageIntro";
import { Section } from "@/components/site/Section";
import { BookingFunnel, type FunnelParking } from "@/components/site/BookingFunnel";
import { pageMetadata } from "@/components/seo/metadata";
import { Alert } from "@/components/ui/feedback/Alert";
import { routes } from "@/config/site";
import { isBookable, listParkings } from "@/modules/parkings/queries";

export const metadata = pageMetadata({
  title: "Réserver une place",
  description: "Réservez votre place de parking aéroport ALTERPARK : choisissez vos dates, votre formule et payez en ligne.",
  path: routes.booking,
});

/* Configurable rules not yet in the static catalogue (Parking.maxStayDays / bookingHorizonDays defaults). */
const DEFAULT_MAX_STAY_DAYS = 60;
const DEFAULT_HORIZON_DAYS = 365;

export default async function BookingPage() {
  const parkings: FunnelParking[] = (await listParkings()).filter(isBookable).map((p) => ({
    slug: p.slug,
    name: p.name,
    timeZone: p.timeZone,
    minLeadMinutes: p.minLeadMinutes,
    maxStayDays: DEFAULT_MAX_STAY_DAYS,
    horizonDays: DEFAULT_HORIZON_DAYS,
    offers: p.offers.map((o) => ({ code: o.code, label: `${o.shortName} — ${o.tagline}` })),
  }));
  return (
    <>
      <PageIntro title="Réservez votre place" crumbs={[{ label: "Accueil", href: "/" }, { label: "Réservation", href: routes.booking }]} />
      <Section className="pt-0 lg:pt-0 xl:pt-0">
        <div className="mx-auto max-w-text">
          {parkings.length ? (
            /* Fully server-rendered; the search parameters prefill it after mount. */
            <BookingFunnel parkings={parkings} />
          ) : (
            <Alert tone="info" title="Réservation en ligne bientôt disponible">
              <p>
                Nos parkings ouvriront prochainement à la réservation en ligne. Pour réserver dès maintenant ou pour toute question,{" "}
                <a className="text-primary underline" href={routes.contact}>contactez-nous</a>.
              </p>
            </Alert>
          )}
        </div>
      </Section>
    </>
  );
}
