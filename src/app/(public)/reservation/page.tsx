import { PageIntro } from "@/components/site/PageIntro";
import { Section } from "@/components/site/Section";
import { BookingFunnel, type FunnelParking } from "@/components/site/BookingFunnel";
import { pageMetadata } from "@/components/seo/metadata";
import { Alert } from "@/components/ui/feedback/Alert";
import { routes } from "@/config/site";
import { isBookable, listParkings } from "@/modules/parkings/queries";
import { paymentsConfigured } from "@/modules/payments/stripe";

export const metadata = pageMetadata({
  title: "Réserver une place",
  description: "Réservez votre place de parking aéroport ALTERPARK : choisissez vos dates, votre formule et payez en ligne.",
  path: routes.booking,
});

export default async function BookingPage() {
  const parkings: FunnelParking[] = (await listParkings()).filter(isBookable).map((p) => ({
    slug: p.slug,
    name: p.name,
    timeZone: p.timeZone,
    minLeadMinutes: p.minLeadMinutes,
    maxStayDays: p.maxStayDays,
    horizonDays: p.bookingHorizonDays,
    offers: p.offers.map((o) => ({ code: o.code, label: `${o.shortName} — ${o.tagline}` })),
  }));
  return (
    <>
      <PageIntro title="Réservez votre place" crumbs={[{ label: "Accueil", href: "/" }, { label: "Réservation", href: routes.booking }]} />
      <Section className="pt-0 lg:pt-0 xl:pt-0">
        <div className="mx-auto max-w-text">
          {parkings.length ? (
            /* Fully server-rendered; the search parameters prefill it after mount. */
            <BookingFunnel parkings={parkings} paymentsEnabled={paymentsConfigured()} />
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
