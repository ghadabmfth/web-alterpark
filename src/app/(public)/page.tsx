import Image from "next/image";
import type { Metadata } from "next";
import { Hero } from "@/components/ui/patterns/Hero";
import { MediaSection } from "@/components/ui/patterns/MediaSection";
import { Banner } from "@/components/ui/patterns/Banner";
import { SectionHeading } from "@/components/ui/content/SectionHeading";
import { FeatureList } from "@/components/ui/content/FeatureList";
import { Accordion } from "@/components/ui/content/Accordion";
import { Button } from "@/components/ui/actions/Button";
import { assets } from "@/components/ui/lib/assets";
import { Section } from "@/components/site/Section";
import { ParkingCard } from "@/components/site/ParkingCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema } from "@/components/seo/schema";
import { routes } from "@/config/site";
import { FAQ, HERO, HOW_IT_WORKS_STEPS, RALLYE } from "@/content/site-content";
import { listParkings } from "@/modules/parkings/queries";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const parkings = await listParkings();
  return (
    <>
      <JsonLd data={organizationSchema()} />
      <Hero title={HERO.title} intro={HERO.intro} steps={HOW_IT_WORKS_STEPS} cta={{ label: "Réservez ma place !", href: routes.booking }} />

      <Section labelledBy="parkings-title">
        <div className="flex flex-col gap-12">
          <div id="parkings-title">
            <SectionHeading title="Nos parkings aéroport" subtitle="Nantes, Marseille et Paris-Roissy" typing={false} />
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {parkings.map((p) => (
              <ParkingCard key={p.slug} parking={p} />
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <MediaSection
          title="Pourquoi choisir ALTERPARK ?"
          subtitle="L’autre parking"
          typing={false}
          media={
            <Image
              src={assets.entreePhoto.src}
              width={assets.entreePhoto.width}
              height={assets.entreePhoto.height}
              alt="Entrée du parking ALTERPARK et son panneau P11"
              sizes="(min-width: 1024px) 45vw, 90vw"
              className="h-auto w-full rounded-xl shadow-photo"
            />
          }
          after={
            <FeatureList
              items={[
                { icon: "bus", title: "Navette gratuite", text: "Sans attente, avec le service standard." },
                { icon: "shield", title: "Parking sécurisé", text: "Vidéosurveillance et gardiennage." },
                { icon: "ticket", title: "Réservation en ligne", text: "7 jours/7 et 24h/24, paiement sécurisé." },
                { icon: "pin", title: "À proximité de l’aéroport", text: "15 minutes jusqu’au terminal." },
              ]}
            />
          }
          cta={{ label: "Comment ça marche ?", href: routes.howItWorks }}
        >
          <p>Déposez votre véhicule à quelques minutes du terminal et partez l’esprit tranquille : la navette vous emmène à l’aéroport et vous ramène à votre retour.</p>
        </MediaSection>
      </Section>

      <Banner title={RALLYE.title} logo={assets.rallyeLogo} logoAlt="Rallye du Cœur" typing={false}>
        <p>{RALLYE.text}</p>
      </Banner>

      <Section labelledBy="faq-title">
        <div className="mx-auto flex max-w-text flex-col gap-8">
          <div id="faq-title">
            <SectionHeading title="Vos questions" align="center" typing={false} />
          </div>
          <Accordion items={FAQ.slice(0, 4)} headingAs="h3" />
          <div className="flex justify-center">
            <Button href={routes.faq} variant="outline">Toutes les questions</Button>
          </div>
        </div>
      </Section>
    </>
  );
}
