import { Hero } from "@/components/ui/patterns/Hero";
import { Banner } from "@/components/ui/patterns/Banner";
import { SectionHeading } from "@/components/ui/content/SectionHeading";
import { ServiceCard } from "@/components/ui/content/ServiceCard";
import { Highlights } from "@/components/ui/content/Highlights";
import { RatingBadge } from "@/components/ui/content/RatingBadge";
import { ReviewCarousel } from "@/components/ui/content/ReviewCarousel";
import { Button } from "@/components/ui/actions/Button";
import { assets } from "@/components/ui/lib/assets";
import { WatchVideo } from "@/components/site/VideoCollage";
import { pageMetadata } from "@/components/seo/metadata";
import { googleRating, routes } from "@/config/site";
import { REVIEWS, SERVICES, SERVICES_HERO, SERVICES_WHY } from "@/content/site-content";

export const metadata = pageMetadata({
  title: "Services Plus",
  description: "Recharge électrique, nettoyage intérieur, lavage, mécanique et carrosserie pendant votre voyage : vous retrouvez un véhicule prêt à rouler.",
  path: routes.services,
});

/*
 * Services Plus — client design « services.html » (Nov. 2026). Services are not part of the online
 * booking yet: each card opens a prefilled request (contact form), never a fake « added » state.
 */
const requestHref = (title: string) => `${routes.contact}?service=${encodeURIComponent(title)}`;
const priceLabel = (p: number | string) => (typeof p === "number" ? `${p} €` : p);

export default function ServicesPage() {
  return (
    <>
      <Hero
        id="hero-services"
        title={SERVICES_HERO.title}
        image={assets.servicesHeroPhoto}
        intro={
          <>
            {SERVICES_HERO.introStart}
            <strong className="hero-num">{SERVICES_HERO.introStrong}</strong>
            {SERVICES_HERO.introEnd}
          </>
        }
      >
        <div className="sp-hero-actions">
          <Button href="#services">Découvrir nos services</Button>
          <WatchVideo title="Les Services Plus ALTERPARK" />
        </div>
        <ul className="sp-quick" aria-label="Accès rapide">
          {SERVICES.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`}>
                <b>{s.title}</b>
                <span>{priceLabel(s.price)}</span>
              </a>
            </li>
          ))}
        </ul>
      </Hero>

      <div className="ap-page">
        <section id="services" className="page-wrap sp-services">
          <SectionHeading title="Nos prestations, pendant que vous voyagez !" align="center" eyebrow="Services Plus">
            Choisissez votre service au moment de réserver ou sur place. Tous nos prix sont TTC, sans acompte : vous réglez à votre retour.
          </SectionHeading>
          <div className="sp-grid">
            {SERVICES.map((s) => (
              <ServiceCard
                key={s.id}
                {...s}
                titleAs="h3"
                cta={{ label: s.id === "sur-demande" ? "Demander un devis" : "Demander ce service", href: requestHref(s.title) }}
              />
            ))}
          </div>
        </section>

        <section className="sp-why" aria-labelledby="sp-why-title">
          <Banner image={assets.servicesWashPhoto} title={<span id="sp-why-title">Prenez soin de votre véhicule avec ALTERPARK, où la qualité rencontre l’innovation !</span>}>
            Pourquoi choisir Alterpark ?
          </Banner>
          <div className="page-wrap sp-why__body">
            <Highlights items={SERVICES_WHY} />
            <div className="center-cta">
              <Button href={routes.booking}>Réservez dès aujourd’hui !</Button>
            </div>
          </div>
        </section>

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
      </div>
    </>
  );
}
