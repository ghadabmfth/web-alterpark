import { Banner } from "@/components/ui/patterns/Banner";
import { SectionHeading } from "@/components/ui/content/SectionHeading";
import { Highlights } from "@/components/ui/content/Highlights";
import { RatingBadge } from "@/components/ui/content/RatingBadge";
import { ReviewCarousel } from "@/components/ui/content/ReviewCarousel";
import { Button } from "@/components/ui/actions/Button";
import { assets } from "@/components/ui/lib/assets";
import { googleRating, routes } from "@/config/site";
import { REVIEWS, SERVICES_WHY } from "@/content/site-content";

/*
 * Blocks that close several client page designs (Services Plus, Comment ça marche, Plan accès):
 * « Prenez soin de votre véhicule… » with the four reasons, then the Google reviews.
 */
export function WhyAlterpark({ cta = { label: "Découvrez nos services +", href: routes.services } }: { cta?: { label: string; href: string } }) {
  return (
    <section className="sp-why" aria-labelledby="sp-why-title">
      <Banner image={assets.servicesWashPhoto} title={<span id="sp-why-title">Prenez soin de votre véhicule avec ALTERPARK, où la qualité rencontre l’innovation !</span>}>
        Pourquoi choisir Alterpark ?
      </Banner>
      <div className="page-wrap sp-why__body">
        <Highlights items={SERVICES_WHY} />
        <div className="center-cta">
          <Button href={cta.href}>{cta.label}</Button>
        </div>
      </div>
    </section>
  );
}

export function GoogleReviews() {
  return (
    <section id="avis" className="page-wrap reviews">
      <div className="reviews__head">
        <SectionHeading title={REVIEWS.title} align="center">
          Un grand merci à vous pour vos avis et votre confiance ! Vos retours nous motivent chaque jour à vous offrir un service de qualité.
        </SectionHeading>
        <RatingBadge count={googleRating.count} rating={googleRating.rating} />
      </div>
      <ReviewCarousel items={REVIEWS.items} />
      <div className="reviews__cta">
        <Button href="https://www.google.com/maps/search/?api=1&query=ALTERPARK+Saint-Aignan-de-Grandlieu">Voir tous les avis</Button>
      </div>
    </section>
  );
}
