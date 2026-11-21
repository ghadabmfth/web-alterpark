import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageIntro } from "@/components/site/PageIntro";
import { Section } from "@/components/site/Section";
import { ParkingBookingBar } from "@/components/site/ParkingBookingBar";
import { JsonLd } from "@/components/seo/JsonLd";
import { parkingSchema } from "@/components/seo/schema";
import { pageMetadata } from "@/components/seo/metadata";
import { MediaSection } from "@/components/ui/patterns/MediaSection";
import { SectionHeading } from "@/components/ui/content/SectionHeading";
import { FeatureList } from "@/components/ui/content/FeatureList";
import { Alert } from "@/components/ui/feedback/Alert";
import { Button } from "@/components/ui/actions/Button";
import { Card } from "@/components/ui/layout/Card";
import { DescriptionList } from "@/components/ui/data/DescriptionList";
import { assets } from "@/components/ui/lib/assets";
import { routes, telHref } from "@/config/site";
import { NANTES_NEWS } from "@/content/site-content";
import { getParking, isBookable, listParkings } from "@/modules/parkings/queries";

export async function generateStaticParams() {
  return (await listParkings()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/parkings/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getParking(slug);
  if (!p) return {};
  return pageMetadata({
    title: `Parking ${p.airportName}`,
    description: isBookable(p)
      ? `${p.name} : parking sécurisé à proximité de l’${p.airportName.charAt(0).toLowerCase()}${p.airportName.slice(1)}, navette gratuite, réservation et paiement en ligne.`
      : p.description,
    path: routes.parking(p.slug),
  });
}

export default async function ParkingPage({ params }: PageProps<"/parkings/[slug]">) {
  const { slug } = await params;
  const p = await getParking(slug);
  if (!p) notFound();
  const bookable = isBookable(p);

  return (
    <>
      <JsonLd data={parkingSchema(p)} />
      <PageIntro
        title={p.name}
        subtitle={p.airportName}
        crumbs={[{ label: "Accueil", href: "/" }, { label: "Nos parkings", href: routes.parkings }, { label: p.city === "Roissy-en-France" ? "Paris-Roissy" : p.city, href: routes.parking(p.slug) }]}
      >
        <p>{p.description}</p>
      </PageIntro>

      {bookable ? (
        <Section className="pt-0 lg:pt-0 xl:pt-0" labelledBy="booking-title">
          <h2 id="booking-title" className="ap-sr">Rechercher une place</h2>
          <ParkingBookingBar parkingSlug={p.slug} offers={p.offers} />
        </Section>
      ) : (
        <Section className="pt-0 lg:pt-0 xl:pt-0">
          <Alert tone="info" title="Réservations bientôt disponibles">
            <p>
              La réservation en ligne de ce parking ouvrira prochainement. Pour toute question, <a className="text-primary underline" href={routes.contact}>contactez-nous</a>.
            </p>
          </Alert>
        </Section>
      )}

      {bookable ? (
        <Section labelledBy="infos-title">
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="flex flex-col gap-8">
              <div id="infos-title">
                <SectionHeading title="Infos pratiques" typing={false} />
              </div>
              <FeatureList columns={1} items={p.practicalInfo.map((t) => ({ icon: "pin" as const, title: t }))} />
            </div>
            <Card title="Accès et contact" titleAs="h3">
              <DescriptionList
                items={[
                  ...(p.address ? [{ term: "Adresse", value: `${p.address.line}, ${p.address.postalCode} ${p.address.city}` }] : []),
                  ...(p.openingHours ? [{ term: "Ouverture", value: p.openingHours }] : []),
                  ...(p.phone ? [{ term: "Téléphone", value: <a className="text-primary" href={telHref(p.phone)}>{p.phone}</a> }] : []),
                  ...(p.email ? [{ term: "E-mail", value: <a className="text-primary" href={`mailto:${p.email}`}>{p.email}</a> }] : []),
                ]}
              />
            </Card>
          </div>
        </Section>
      ) : null}

      {p.slug === "nantes" ? (
        <Section>
          <MediaSection
            title={NANTES_NEWS.title}
            typing={false}
            media={
              <Image
                src={assets.ombrieresPhoto.src}
                width={assets.ombrieresPhoto.width}
                height={assets.ombrieresPhoto.height}
                alt="Parking ALTERPARK sous ombrières photovoltaïques"
                sizes="(min-width: 1024px) 45vw, 90vw"
                className="h-auto w-full rounded-xl shadow-photo"
              />
            }
          >
            {NANTES_NEWS.paragraphs.map((t, i) => (
              <p key={i}>{t}</p>
            ))}
          </MediaSection>
        </Section>
      ) : null}

      {bookable ? (
        <Section className="text-center">
          <Button href={`${routes.booking}?parking=${p.slug}`}>Réservez ma place !</Button>
        </Section>
      ) : null}
    </>
  );
}
