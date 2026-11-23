import { Hero } from "@/components/ui/patterns/Hero";
import { Button } from "@/components/ui/actions/Button";
import { accentTitle } from "@/components/ui/lib/accent-title";
import { assets } from "@/components/ui/lib/assets";
import { pageMetadata } from "@/components/seo/metadata";
import { HowStepIcon } from "@/components/site/pages/PageIcons";
import { GoogleReviews, WhyAlterpark } from "@/components/site/pages/ClosingBlocks";
import { routes } from "@/config/site";
import { HOW_PAGE, HOW_STEPS, type RichLine } from "@/content/pages-content";

export const metadata = pageMetadata({
  title: "Comment ça marche",
  description: "Réservez, déposez votre véhicule, prenez la navette jusqu’à l’aéroport et retrouvez votre voiture à votre retour : le parking ALTERPARK en 5 étapes.",
  path: routes.howItWorks,
});

function Lines({ lines }: { lines: RichLine[] }) {
  return (
    <ul className="how-step__list">
      {lines.map((l, i) => (
        <li key={i}>
          {l.strong ? <b>{l.strong} </b> : null}
          {l.text}
        </li>
      ))}
    </ul>
  );
}

/* Comment ça marche — client design (Nov. 2026): five alternating steps, then reasons and reviews. */
export default function HowItWorksPage() {
  return (
    <>
      <Hero id="how-title" typing={false} image={assets.heroPhoto} title={HOW_PAGE.title} intro={HOW_PAGE.intro}>
        <Button href={routes.booking}>Réservez maintenant</Button>
      </Hero>
      <div className="ap-page">
        <ol className="page-wrap how-steps" aria-label="Les 5 étapes">
          {HOW_STEPS.map((s, i) => (
            <li key={s.title} className="how-step">
              <div className="how-step__visual" aria-hidden>
                <HowStepIcon name={s.icon} className="how-step__icon" />
                <span className="how-step__num">{i + 1}</span>
              </div>
              <div className="how-step__body">
                <h2 className="h2 ap-h2 how-step__title">
                  <span className="ap-sr">{`Étape ${i + 1} : `}</span>
                  {accentTitle(s.title)}
                </h2>
                <p>{s.intro}</p>
                {s.lines.length ? <Lines lines={s.lines} /> : null}
                {s.group ? (
                  <>
                    <p className="how-step__group">{s.group.title}</p>
                    <Lines lines={s.group.lines} />
                  </>
                ) : null}
                <p className="how-step__outro">{s.outro}</p>
              </div>
            </li>
          ))}
        </ol>
        <WhyAlterpark />
        <GoogleReviews />
      </div>
    </>
  );
}
