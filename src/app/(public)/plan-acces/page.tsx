import { Hero } from "@/components/ui/patterns/Hero";
import { Button } from "@/components/ui/actions/Button";
import { accentTitle } from "@/components/ui/lib/accent-title";
import { assets } from "@/components/ui/lib/assets";
import { pageMetadata } from "@/components/seo/metadata";
import { AccessMap } from "@/components/site/pages/AccessMap";
import { CompassIcon, RouteIcon } from "@/components/site/pages/PageIcons";
import { GoogleReviews, WhyAlterpark } from "@/components/site/pages/ClosingBlocks";
import { routes } from "@/config/site";
import { ACCESS_PAGE, ACCESS_ROUTES } from "@/content/pages-content";

export const metadata = pageMetadata({
  title: "Plan d’accès",
  description: "Comment rejoindre le parking ALTERPARK près de l’aéroport de Nantes : plan et itinéraires depuis la sortie 50 (Porte de Retz) et la sortie 51 (Porte de Grand Lieu).",
  path: routes.access,
});

const directions = (origin: string) =>
  `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(ACCESS_PAGE.destination)}&travelmode=driving`;

/* Plan accès — client design (Nov. 2026). */
export default function AccessPage() {
  return (
    <>
      <Hero id="access-title" typing={false} image={assets.heroPhoto} title={ACCESS_PAGE.title} intro={ACCESS_PAGE.intro}>
        <Button href={routes.booking}>Réservez maintenant</Button>
      </Hero>
      <div className="ap-page">
        <section className="page-wrap" aria-label="Plan d’accès">
          <AccessMap />
        </section>
        <section className="page-wrap access-routes" aria-label="Itinéraires">
          {ACCESS_ROUTES.map((r) => (
            <div key={r.id} id={r.id} className="access-route">
              <CompassIcon letter={r.compass} className="access-route__compass" />
              <h2 className="h2 ap-h2">{accentTitle(r.title)}</h2>
              <p className="access-route__exit">{r.exit}</p>
              <ol>
                {r.steps.map((s, i) => (
                  <li key={i}>
                    <RouteIcon name={s.icon} />
                    <div>
                      <h3>{s.title}</h3>
                      <p>{s.text}</p>
                    </div>
                    <p className="access-route__dist">
                      <span className="ap-sr">Distance : </span>
                      {s.distance}
                    </p>
                  </li>
                ))}
              </ol>
              <div>
                <Button href={directions(r.origin)}>Ouvrir cet itinéraire</Button>
              </div>
            </div>
          ))}
        </section>
        <WhyAlterpark />
        <GoogleReviews />
      </div>
    </>
  );
}
