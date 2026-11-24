import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/components/ui/actions/Button";
import { Badge } from "@/components/ui/feedback/Badge";
import { LoadingRegion, Skeleton } from "@/components/ui/feedback/Skeleton";
import { accentTitle } from "@/components/ui/lib/accent-title";
import { assets } from "@/components/ui/lib/assets";
import { formatCents } from "@/components/ui/lib/format";
import { LineIcon, type LineIconName } from "@/components/site/pages/LineIcon";
import { routes } from "@/config/site";
import { logoutAction } from "@/modules/auth/actions";
import { customerReservationStats, listUpcomingCustomerReservations } from "@/modules/reservations/service";
import { STATUS_LABELS, STATUS_TONES } from "@/modules/reservations/domain/status";
import { formatDateTime } from "@/modules/reservations/domain/stay";
import { requireUser } from "@/server/auth/session";
import { hasDatabase } from "@/server/db/client";

export const metadata: Metadata = { title: "Mon espace client", robots: { index: false, follow: false } };

/*
 * Espace client — dashboard in the site chrome: compact welcome band, counters, the next booking
 * highlighted, then shortcut tiles. Detailed pages keep the account shell.
 */
const account = routes.account;

type Tile = { icon: LineIconName; title: string; text: string; href?: string; soon?: boolean };

const TILES: Tile[] = [
  { icon: "calendar", title: "Mes réservations", text: "Historique, détail et annulation", href: `${account}/reservations` },
  { icon: "card", title: "Mes paiements", text: "Paiements et remboursements", href: `${account}/paiements` },
  { icon: "user", title: "Mon profil", text: "Coordonnées et mot de passe", href: `${account}/profil` },
  { icon: "map", title: "Plan d’accès", text: "Itinéraires jusqu’au parking", href: routes.access },
  { icon: "bus", title: "Comment ça marche", text: "Dépôt, navette et retour", href: routes.howItWorks },
  { icon: "help", title: "Aide et contact", text: "Une question ? Écrivez-nous", href: `${account}/support` },
  { icon: "file", title: "Conditions générales", text: "CGV ALTERPARK", href: routes.terms },
  // Loyalty programme announced as « Bientôt » on the home page: shown, never faked.
  { icon: "star", title: "Points de fidélité", text: "Bientôt disponible", soon: true },
];

function TileCard({ t }: { t: Tile }) {
  const inner = (
    <>
      <span className="acc-tile__ico"><LineIcon name={t.icon} /></span>
      <span className="acc-tile__body">
        <b>{t.title}</b>
        <span>{t.text}</span>
      </span>
      {t.href ? <LineIcon name="arrow" className="acc-tile__arrow" /> : null}
    </>
  );
  return <li>{t.href ? <a className="acc-tile" href={t.href}>{inner}</a> : <div className="acc-tile acc-tile--soon" aria-disabled="true">{inner}</div>}</li>;
}

async function Dashboard() {
  const user = await requireUser(routes.account);
  const [upcoming, stats] = hasDatabase()
    ? await Promise.all([listUpcomingCustomerReservations(user.id, 3), customerReservationStats(user.id)])
    : [[], { total: 0, upcoming: 0 }];
  const [next, ...later] = upcoming;
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  return (
    <>
      <section className="ap-root acc-band" aria-labelledby="account-title">
        <div className="acc-band__bg" aria-hidden>
          <Image src={assets.heroPhoto.src} width={assets.heroPhoto.width} height={assets.heroPhoto.height} alt="" sizes="100vw" quality={50} preload />
        </div>
        <div className="page-wrap acc-band__inner">
          <div className="acc-id">
            <span className="acc-id__avatar" aria-hidden>{initials}</span>
            <div className="acc-id__text">
              <p className="acc-id__hello">Espace client</p>
              <h1 id="account-title" className="h2 ap-h2">{accentTitle(`Bonjour ${user.firstName} !`)}</h1>
              <p className="acc-id__mail">{user.email}</p>
            </div>
          </div>
          <div className="acc-band__actions">
            <Button href={routes.booking}>Nouvelle réservation</Button>
            <form action={logoutAction}>
              <button type="submit" className="acc-logout">
                <LineIcon name="logout" />
                Se déconnecter
              </button>
            </form>
          </div>
        </div>
      </section>

      <div className="page-wrap acc-dash">
        {!user.emailVerified ? (
          <div className="acc-notice" role="status">
            <LineIcon name="mail" className="acc-notice__ico" />
            <p>
              <b>Confirmez votre adresse e-mail.</b> Un lien a été envoyé à <span className="break-all">{user.email}</span> pour sécuriser votre compte.
            </p>
          </div>
        ) : null}

        <ul className="acc-stats" aria-label="En bref">
          <li>
            <span className="acc-stats__num">{stats.upcoming}</span>
            <span>{stats.upcoming > 1 ? "réservations à venir" : "réservation à venir"}</span>
          </li>
          <li>
            <span className="acc-stats__num">{stats.total}</span>
            <span>{stats.total > 1 ? "réservations au total" : "réservation au total"}</span>
          </li>
          <li>
            <LineIcon name="shield" className="acc-stats__ico" />
            <span>{user.emailVerified ? "Compte vérifié" : "E-mail à confirmer"}</span>
          </li>
        </ul>

        <section className="acc-next" aria-labelledby="next-title">
          <h2 id="next-title" className="acc-section-title">Prochaine réservation</h2>
          {next ? (
            <article className="acc-booking">
              <header className="acc-booking__head">
                <div>
                  <p className="acc-booking__ref">{next.reference}</p>
                  <h3>{next.parking.name}</h3>
                  <p className="acc-booking__offer">{next.offer.name}</p>
                </div>
                <Badge tone={STATUS_TONES[next.status]}>{STATUS_LABELS[next.status]}</Badge>
              </header>
              <dl className="acc-booking__dates">
                <div>
                  <dt>Dépôt du véhicule</dt>
                  <dd>{formatDateTime(next.startsAt.getTime(), next.parking.timeZone)}</dd>
                </div>
                <div>
                  <dt>Récupération</dt>
                  <dd>{formatDateTime(next.endsAt.getTime(), next.parking.timeZone)}</dd>
                </div>
                <div>
                  <dt>{next.paymentMethod === "ON_SITE" ? "À régler sur place" : "Montant"}</dt>
                  <dd>{formatCents(next.totalCents)}</dd>
                </div>
              </dl>
              <footer className="acc-booking__actions">
                <Button href={`${account}/reservations/${next.reference}`} size="sm">Voir le détail</Button>
                <Button href={`${routes.access}/${next.parking.slug}`} size="sm" variant="outline">Plan d’accès</Button>
              </footer>
            </article>
          ) : (
            <div className="acc-empty">
              <LineIcon name="calendar" className="acc-empty__ico" />
              <div>
                <h3>Aucune réservation à venir</h3>
                <p>Réservez votre place en quelques clics : paiement en ligne ou sur place à votre retour.</p>
              </div>
              <Button href={routes.booking} size="sm">Réserver une place</Button>
            </div>
          )}
          {later.length ? (
            <ul className="acc-later">
              {later.map((r) => (
                <li key={r.id}>
                  <a href={`${account}/reservations/${r.reference}`}>
                    <span className="acc-later__ref">{r.reference}</span>
                    <span>{formatDateTime(r.startsAt.getTime(), r.parking.timeZone)}</span>
                    <Badge tone={STATUS_TONES[r.status]}>{STATUS_LABELS[r.status]}</Badge>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <nav className="acc-shortcuts" aria-labelledby="shortcuts-title">
          <h2 id="shortcuts-title" className="acc-section-title">Accès rapides</h2>
          <ul className="acc-tiles">
            {TILES.map((t) => (
              <TileCard key={t.title} t={t} />
            ))}
          </ul>
        </nav>

        <p className="acc-foot">
          Vous souhaitez fermer votre compte ? <a href={`${account}/profil#suppression`}>Supprimer mon compte</a>
        </p>
      </div>
    </>
  );
}

export default function AccountDashboardPage() {
  return (
    <Suspense
      fallback={
        <LoadingRegion label="Chargement de votre espace…">
          <div className="page-wrap py-16">
            <Skeleton width="40%" />
            <Skeleton variant="block" />
          </div>
        </LoadingRegion>
      }
    >
      <Dashboard />
    </Suspense>
  );
}
