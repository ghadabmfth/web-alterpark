import Image from "next/image";
import { Hero } from "@/components/ui/patterns/Hero";
import { Button } from "@/components/ui/actions/Button";
import { SectionHeading } from "@/components/ui/content/SectionHeading";
import { accentTitle } from "@/components/ui/lib/accent-title";
import { assets } from "@/components/ui/lib/assets";
import { pageMetadata } from "@/components/seo/metadata";
import { GoogleReviews } from "@/components/site/pages/ClosingBlocks";
import { routes } from "@/config/site";
import { ABOUT_PAGE, RALLYE_PAGE, TIMELINE } from "@/content/pages-content";

export const metadata = pageMetadata({
  title: "Qui sommes-nous",
  description: "ALTERPARK, parking près de l’aéroport de Nantes depuis 2015 : notre histoire, nos dates clés et notre engagement pour le Rallye du Cœur.",
  path: routes.about,
});

const PHOTOS = { entree: assets.entreePhoto, ombrieres: assets.ombrieresPhoto } as const;

/* Qui sommes-nous — client design (Nov. 2026): timeline of key dates, then the Rallye du Cœur. */
export default function AboutPage() {
  return (
    <>
      <Hero id="about-title" typing={false} image={assets.heroPhoto} title={ABOUT_PAGE.title} intro={ABOUT_PAGE.intro}>
        <Button href={routes.booking}>Réservez ma place !</Button>
      </Hero>
      <div className="ap-page">
        <section className="page-wrap timeline" aria-labelledby="timeline-title">
          <div className="timeline__intro">
            <h2 id="timeline-title" className="h2 ap-h2">{accentTitle(ABOUT_PAGE.timelineTitle)}</h2>
            <p className="ap-body">{ABOUT_PAGE.timelineIntro}</p>
          </div>
          <ol className="timeline__list">
            {TIMELINE.map((e) => (
              <li key={`${e.month}-${e.year}`} className="timeline__item">
                {e.photo ? (
                  <Image className="timeline__photo" src={PHOTOS[e.photo].src} width={PHOTOS[e.photo].width} height={PHOTOS[e.photo].height} alt="" sizes="72px" />
                ) : null}
                <h3 className="timeline__date">
                  <span>{e.month}</span>
                  <span className="timeline__year">{e.year}</span>
                </h3>
                {e.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                {e.bullets ? (
                  <ul>
                    {e.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ol>
        </section>

        <section id="rallye" className="page-wrap rallye" aria-labelledby="rallye-title">
          <Image className="rallye__logo" src={assets.rallyeLogo.src} width={assets.rallyeLogo.width} height={assets.rallyeLogo.height} alt="Le Rallye du Cœur — Donnons des jours à la vie" />
          <SectionHeading title={<span id="rallye-title">{accentTitle(RALLYE_PAGE.title)}</span>} align="center" />
          <div className="rallye__cols">
            <div>
              <h3 className="h3 ap-h3">{accentTitle(RALLYE_PAGE.what.title)}</h3>
              <p>{RALLYE_PAGE.what.intro}</p>
              <ul>
                {RALLYE_PAGE.what.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="h3 ap-h3">{accentTitle(RALLYE_PAGE.context.title)}</h3>
              {RALLYE_PAGE.context.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
          <div className="rallye__commit">
            <h3 className="h3 ap-h3">{RALLYE_PAGE.commitment.title}</h3>
            <p>{RALLYE_PAGE.commitment.text}</p>
          </div>
        </section>

        <GoogleReviews />
      </div>
    </>
  );
}
