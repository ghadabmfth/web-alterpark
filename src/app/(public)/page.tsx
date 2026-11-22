import type { Metadata } from "next";
import { Hero } from "@/components/ui/patterns/Hero";
import { MediaSection } from "@/components/ui/patterns/MediaSection";
import { Banner } from "@/components/ui/patterns/Banner";
import { AppShowcase } from "@/components/ui/patterns/AppShowcase";
import { SectionHeading } from "@/components/ui/content/SectionHeading";
import { FeatureList } from "@/components/ui/content/FeatureList";
import { Steps } from "@/components/ui/content/Steps";
import { RatingBadge } from "@/components/ui/content/RatingBadge";
import { ReviewCarousel } from "@/components/ui/content/ReviewCarousel";
import { StoreBadges } from "@/components/ui/content/StoreBadges";
import { Button } from "@/components/ui/actions/Button";
import { assets } from "@/components/ui/lib/assets";
import { ParkingBookingBar } from "@/components/site/ParkingBookingBar";
import { VideoCollage } from "@/components/site/VideoCollage";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema } from "@/components/seo/schema";
import { appStoreLinks, googleRating, routes } from "@/config/site";
import { APP, HERO, HOW_IT_WORKS_STEPS, LOYALTY, NANTES_NEWS, RALLYE, REVIEWS } from "@/content/site-content";
import { getParking } from "@/modules/parkings/queries";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/* Home page — client design « Accueil » (Nov. 2026), section by section. */
export default async function HomePage() {
  const nantes = await getParking("nantes");
  const hasApp = !!(appStoreLinks.appStore && appStoreLinks.googlePlay);
  return (
    <>
      <Hero
        title={HERO.title}
        intro={
          <>
            Le <strong className="hero-seul">seul</strong> parking qui vous dépose au pied du terminal. Déjà <strong className="hero-num">plus de 500 000 voyageurs</strong> ont choisi la tranquillité : à votre tour d’embarquer l’esprit léger !
          </>
        }
        steps={HOW_IT_WORKS_STEPS}
        booking={nantes ? <div id="reserver"><ParkingBookingBar parkingSlug={nantes.slug} offers={nantes.offers} /></div> : undefined}
      />

      <div className="ap-page">
        <section id="nouveautes" className="page-wrap">
          <MediaSection title={NANTES_NEWS.title} media={<VideoCollage />} cta={{ label: "Découvrez nos services +", href: routes.services }}>
            {NANTES_NEWS.paragraphs.map((t, i) => (
              <p key={i}>{t}</p>
            ))}
          </MediaSection>
        </section>

        <section id="rallye">
          <Banner title={RALLYE.title} logo={assets.rallyeLogo} logoAlt="Le Rallye du Cœur — Donnons des jours à la vie">
            {RALLYE.text}
          </Banner>
        </section>

        <section id="fidelite" className="page-wrap loyalty">
          <SectionHeading title={LOYALTY.title} subtitle={LOYALTY.subtitle} eyebrow="Bientôt" />
          <div className="loyalty__steps">
            <Steps variant="loyalty" items={LOYALTY.steps} titleAs="h3" />
          </div>
          <div className="loyalty__how">
            <h3 className="h3 ap-h3">{LOYALTY.howTitle}</h3>
            <p className="body ap-body">
              {LOYALTY.how}
              <br />
              <strong>{LOYALTY.example}</strong>
              <br />
              {LOYALTY.soon}
            </p>
          </div>
          <div className="end-cta">
            <Button href={routes.booking}>Réservez maintenant</Button>
          </div>
        </section>

        <section id="application" className="page-wrap">
          <MediaSection
            reverse
            eyebrow={hasApp ? "Nouvelle application" : "Bientôt disponible"}
            title={APP.title}
            media={<AppShowcase className="app-visual" />}
            after={
              <>
                <FeatureList items={APP.features} />
                <div className="app-download">
                  {hasApp ? <StoreBadges appStoreHref={appStoreLinks.appStore!} googlePlayHref={appStoreLinks.googlePlay!} /> : null}
                  <p className="app-download__note">{hasApp ? APP.available : APP.soon}</p>
                </div>
              </>
            }
          >
            <p>{APP.text}</p>
          </MediaSection>
        </section>

        <section id="avis" className="page-wrap reviews">
          <div className="reviews__head">
            <SectionHeading title={REVIEWS.title} align="center">
              {REVIEWS.text}
            </SectionHeading>
            <RatingBadge count={googleRating.count} rating={googleRating.rating} />
          </div>
          <ReviewCarousel items={REVIEWS.items} />
          <div className="reviews__cta">
            <Button href="https://www.google.com/maps/search/?api=1&query=ALTERPARK+Saint-Aignan-de-Grandlieu">Voir tous les avis</Button>
          </div>
        </section>
      </div>
      <JsonLd data={organizationSchema()} />
    </>
  );
}
