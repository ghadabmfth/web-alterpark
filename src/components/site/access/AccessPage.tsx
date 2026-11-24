import Image from "next/image";
import { Hero } from "@/components/ui/patterns/Hero";
import { Button } from "@/components/ui/actions/Button";
import { accentTitle } from "@/components/ui/lib/accent-title";
import { AccessMap } from "@/components/site/pages/AccessMap";
import { CopyButton } from "@/components/site/pages/CopyButton";
import { LineIcon } from "@/components/site/pages/LineIcon";
import { CompassIcon, RouteIcon } from "@/components/site/pages/PageIcons";
import { GoogleReviews, WhyAlterpark } from "@/components/site/pages/ClosingBlocks";
import { routes, telHref } from "@/config/site";
import { ACCESS_SITES, type AccessSite } from "@/content/access-sites";
import { distanceMetres, formatDistance } from "@/content/pages-content";

const LEGEND = [
  { key: "rb", label: "Rond-point" },
  { key: "route", label: "Itinéraire conseillé" },
  { key: "pin", label: "Point de repère" },
  { key: "exit", label: "Sortie / échangeur" },
] as const;

/* « Plan accès » of one site: switcher, address card, map or meeting point, itineraries, tips. */
export function AccessPage({ site }: { site: AccessSite }) {
  const dest = encodeURIComponent(site.destination);
  const directions = (origin?: string) =>
    `https://www.google.com/maps/dir/?api=1${origin ? `&origin=${encodeURIComponent(origin)}` : ""}&destination=${dest}&travelmode=driving`;
  return (
    <>
      <Hero id="access-title" typing={false} image={site.heroImage} title={site.title} intro={site.intro}>
        <Button href={routes.booking}>Réservez maintenant</Button>
      </Hero>
      <div className="ap-page">
        <nav className="page-wrap access-sites" aria-label="Choisir un parking">
          {ACCESS_SITES.map((s) => (
            <a key={s.slug} href={`${routes.access}/${s.slug}`} aria-current={s.slug === site.slug ? "page" : undefined}>
              <LineIcon name="pin" />
              {s.label}
            </a>
          ))}
        </nav>

        <section className="page-wrap access-card" aria-labelledby="address-title">
          <h2 id="address-title" className="ap-sr">Adresse et contact</h2>
          <div className="access-card__facts">
            <p className="access-fact">
              <LineIcon name="pin" />
              <span>
                <b>{site.name}</b>
                {site.addressLines.map((l) => (
                  <span key={l} className="block">{l}</span>
                ))}
              </span>
            </p>
            {site.hours ? (
              <p className="access-fact">
                <LineIcon name="clock" />
                <span>
                  <b>Accueil</b>
                  {site.hours}
                </span>
              </p>
            ) : null}
            {site.phone ? (
              <p className="access-fact">
                <LineIcon name="phone" />
                <span>
                  <b>Téléphone</b>
                  <a href={telHref(site.phone)}>{site.phone}</a>
                </span>
              </p>
            ) : null}
          </div>
          <div className="access-card__actions">
            <a className="access-action access-action--primary" href={directions()}>
              <LineIcon name="route" />
              Itinéraire Google Maps
            </a>
            <a className="access-action" href={`https://waze.com/ul?q=${dest}&navigate=yes`}>
              <LineIcon name="map" />
              Ouvrir dans Waze
            </a>
            <CopyButton text={site.destination} />
          </div>
        </section>

        {site.meetingPoint ? (
          <section className="page-wrap access-meet" aria-labelledby="meet-title">
            <div className="access-meet__text">
              <h2 id="meet-title" className="h2 ap-h2">{accentTitle(site.meetingPoint.title)}</h2>
              <p>{site.meetingPoint.text}</p>
              <ol>
                {site.meetingPoint.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </div>
            <figure className="access-meet__figure">
              <Image src={site.meetingPoint.image.src} width={site.meetingPoint.image.width} height={site.meetingPoint.image.height} alt={site.meetingPoint.alt} sizes="(min-width: 1024px) 60vw, 100vw" />
            </figure>
          </section>
        ) : null}

        {site.map ? (
          <section className="page-wrap access-mapwrap" aria-labelledby="map-title">
            <div className="access-mapwrap__head">
              <h2 id="map-title" className="h2 ap-h2">{accentTitle("Le plan d’accès")}</h2>
              {site.routes.length ? (
                <nav className="access-jump" aria-label="Choisir un itinéraire">
                  {site.routes.map((r) => (
                    <a key={r.id} href={`#${r.id}`}>
                      <CompassIcon letter={r.compass} />
                      {r.compass === "S" ? "Depuis le sud" : "Depuis le nord"}
                    </a>
                  ))}
                </nav>
              ) : null}
            </div>
            <div className="access-mapcard">
              <AccessMap map={site.map} />
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
        ) : null}

        {site.routes.length ? (
          <section className="page-wrap access-routes" aria-label="Itinéraires">
            {site.routes.map((r) => {
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
        ) : null}

        {site.tips.length ? (
          <section className="page-wrap access-tips" aria-labelledby="tips-title">
            <h2 id="tips-title" className="h3 ap-h3">Bon à savoir à votre arrivée</h2>
            <ul>
              {site.tips.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <WhyAlterpark />
        <GoogleReviews />
      </div>
    </>
  );
}
