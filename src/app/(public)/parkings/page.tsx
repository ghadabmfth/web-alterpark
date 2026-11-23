import { PageIntro } from "@/components/site/PageIntro";
import { Section } from "@/components/site/Section";
import { ParkingCard } from "@/components/site/ParkingCard";
import { pageMetadata } from "@/components/seo/metadata";
import { routes } from "@/config/site";
import { listParkings } from "@/modules/parkings/queries";

export const metadata = pageMetadata({
  title: "Nos parkings aéroport",
  description: "Parkings ALTERPARK à proximité des aéroports de Nantes, Marseille et Paris-Roissy : navette, sécurité, réservation en ligne.",
  path: routes.parkings,
});

export default async function ParkingsPage() {
  const parkings = await listParkings();
  return (
    <>
      <PageIntro title="Nos parkings aéroport" subtitle="Nantes, Marseille et Paris-Roissy" crumbs={[{ label: "Accueil", href: "/" }, { label: "Nos parkings", href: routes.parkings }]}>
        <p>Choisissez votre aéroport pour découvrir le parking, ses services et réserver votre place.</p>
      </PageIntro>
      <Section className="pt-0 lg:pt-0 xl:pt-0">
        <div className="grid gap-6 lg:grid-cols-3">
          {parkings.map((p) => (
            <ParkingCard key={p.slug} parking={p} headingLevel="h2" />
          ))}
        </div>
      </Section>
    </>
  );
}
