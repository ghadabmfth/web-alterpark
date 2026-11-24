import { Hero } from "@/components/ui/patterns/Hero";
import { Button } from "@/components/ui/actions/Button";
import { accentTitle } from "@/components/ui/lib/accent-title";
import { assets } from "@/components/ui/lib/assets";
import { pageMetadata } from "@/components/seo/metadata";
import { AccessMap } from "@/components/site/pages/AccessMap";
import { CopyButton } from "@/components/site/pages/CopyButton";
import { LineIcon } from "@/components/site/pages/LineIcon";
import { CompassIcon, RouteIcon } from "@/components/site/pages/PageIcons";
import { GoogleReviews, WhyAlterpark } from "@/components/site/pages/ClosingBlocks";
import { routes, siteContact, telHref } from "@/config/site";
import { ACCESS_PAGE, ACCESS_ROUTES, distanceMetres, formatDistance } from "@/content/pages-content";

export const metadata = pageMetadata({
  title: "Plan d’accès",
  description: "Comment rejoindre le parking ALTERPARK près de l’aéroport de Nantes : adresse, plan et itinéraires depuis la sortie 50 (Porte de Retz) et la sortie 51 (Porte de Grand Lieu).",
  path: routes.access,
});

const dest = encodeURIComponent(ACCESS_PAGE.destination);
const directions = (origin?: string) =>
  `https://www.google.com/maps/dir/?api=1${origin ? `&origin=${encodeURIComponent(origin)}` : ""}&destination=${dest}&travelmode=driving`;
const waze = `https://waze.com/ul?q=${dest}&navigate=yes`;

const LEGEND = [
  { key: "rb", label: "Rond-point" },
  { key: "route", label: "Itinéraire conseillé" },
  { key: "pin", label: "Point de repère" },
  { key: "exit", label: "Sortie du périphérique" },
] as const;

/* Plan accès — client design (Nov. 2026), with the address card, map legend and step timelines. */
export default function AccessPage() {
  return (
    <>
      <Hero id="access-title" typing={false} image={assets.heroPhoto} title={ACCESS_PAGE.title} intro={ACCESS_PAGE.intro}>
        <Button href={routes.booking}>Réservez maintenant</Button>
      </Hero>
      <div className="ap-page">
        <section className="page-wrap access-card" aria-labelledby="address-title">
          <div className="access-card__facts">
            <h2 id="address-title" className="ap-sr">Adresse et contact</h2>
            <p className="access-fact">
              <LineIcon name="pin" />
              <span>
                <b>ALTERPARK Nantes Atlantique</b>
                {siteContact.address.map((l) => (
                  <span key={l} className="block">{l}</span>
                ))}
              </span>
            </p>
            <p className="access-fact">
              <LineIcon name="clock" />
              <span>
                <b>Accueil</b>
                {ACCESS_PAGE.hours}
              </span>
            </p>
            <p className="access-fact">
              <LineIcon name="phone" />
              <span>
                <b>Téléphone</b>
                <a href={telHref(siteContact.phone)}>{siteContact.phone}</a>
              </span>
            </p>
          </div>
          <div className="access-card__actions">
            <a className="access-action access-action--primary" href={directions()}>
              <LineIcon name="route" />
              Itinéraire Google Maps
            </a>
            <a className="access-action" href={waze}>
              <LineIcon name="map" />
              Ouvrir dans Waze
            </a>
            <CopyButton text={ACCESS_PAGE.destination} />
          </div>
        </section>

        <section className="page-wrap access-mapwrap" aria-labelledby="map-title">
          <div className="access-mapwrap__head">
            <h2 id="map-title" className="h2 ap-h2">{accentTitle("Le plan d’accès")}</h2>
            <nav className="access-jump" aria-label="Choisir un itinéraire">
              {ACCESS_ROUTES.map((r) => (
                <a key={r.id} href={`#${r.id}`}>
                  <CompassIcon letter={r.compass} />
                  {r.compass === "S" ? "Depuis le sud" : "Depuis le nord"}
                </a>
              ))}
            </nav>
          </div>
          <div className="access-mapcard">
            <AccessMap />
            <p className="access-mapcard__hint">Plan schématique, non à l’échelle. Sur mobile, faites glisser le plan horizontalement.</p>
            <ul className="amap-legend" aria-label="Légende du plan">
              {LEGEND.map((l) => (
                <li key={l.key}>
                  <span className={`amap-legend__key amap-legend__key--${l.key}`} aria-hidden />
                  {l.label}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="page-wrap access-routes" aria-label="Itinéraires">
          {ACCESS_ROUTES.map((r) => {
            const total = r.steps.reduce((n, s) => n + distanceMetres(s.distance), 0);
            return (
              <div key={r.id} id={r.id} className="access-route">
                <div className="access-route__head">
                  <CompassIcon letter={r.compass} className="access-route__compass" />
                  <div>
                    <h2 className="h2 ap-h2">{accentTitle(r.title)}</h2>
                    <p className="access-route__exit">{r.exit}</p>
                  </div>
                </div>
                <p className="access-route__total">
                  <LineIcon name="route" />
                  {`${r.steps.length} étapes · environ ${formatDistance(total)} depuis la sortie`}
                </p>
                <ol className="access-steps">
                  {r.steps.map((s, i) => (
                    <li key={i}>
                      <span className="access-steps__marker" aria-hidden>
                        <RouteIcon name={s.icon} />
                      </span>
                      <div className="access-steps__body">
                        <h3>
                          <span className="ap-sr">{`Étape ${i + 1} : `}</span>
                          {s.title}
                        </h3>
                        <p>{s.text}</p>
                        <span className="access-steps__dist">
                          <span className="ap-sr">Distance : </span>
                          {s.distance}
                        </span>
                      </div>
                    </li>
                  ))}
                </ol>
                <div>
                  <Button href={directions(r.origin)}>Ouvrir cet itinéraire</Button>
                </div>
              </div>
            );
          })}
        </section>

        <section className="page-wrap access-tips" aria-labelledby="tips-title">
          <h2 id="tips-title" className="h3 ap-h3">Bon à savoir à votre arrivée</h2>
          <ul>
            {ACCESS_PAGE.tips.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>

        <WhyAlterpark />
        <GoogleReviews />
      </div>
    </>
  );
}
