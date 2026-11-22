import { Suspense } from "react";
import type { Metadata } from "next";
import { Button } from "@/components/ui/actions/Button";
import { Alert } from "@/components/ui/feedback/Alert";
import { Badge } from "@/components/ui/feedback/Badge";
import { LoadingRegion, Skeleton } from "@/components/ui/feedback/Skeleton";
import { accentTitle } from "@/components/ui/lib/accent-title";
import { assets } from "@/components/ui/lib/assets";
import Image from "next/image";
import { routes } from "@/config/site";
import { logoutAction } from "@/modules/auth/actions";
import { listUpcomingCustomerReservations } from "@/modules/reservations/service";
import { STATUS_LABELS, STATUS_TONES } from "@/modules/reservations/domain/status";
import { formatDateTime } from "@/modules/reservations/domain/stay";
import { requireUser } from "@/server/auth/session";
import { hasDatabase } from "@/server/db/client";

export const metadata: Metadata = { title: "Mon espace client", robots: { index: false, follow: false } };

/*
 * Espace client — client design (Nov. 2026): the dashboard sits in the public site chrome (hero
 * with the customer's initials, three link columns). The detailed pages keep the account shell.
 */
type Item = { label: string; href?: string; note?: string };

const account = routes.account;
const COLUMNS: { title: string; items: Item[] }[] = [
  {
    title: "Vos informations",
    items: [
      { label: "Consultez et mettez à jour vos coordonnées", href: `${account}/profil` },
      // Loyalty programme announced as « Bientôt » on the home page: no fake balance.
      { label: "Mes points de fidélité", note: "bientôt disponible" },
      { label: "Informations utiles pour votre voyage", href: routes.howItWorks },
      { label: "Plan d’accès au parking", href: routes.access },
      { label: "Désactiver votre compte", href: `${account}/profil#suppression` },
    ],
  },
  {
    title: "Vos réservations",
    items: [
      { label: "Accédez à l’historique de vos réservations", href: `${account}/reservations` },
      { label: "Annulez une réservation", href: `${account}/reservations` },
      { label: "Ajouter une nouvelle réservation", href: routes.booking },
      { label: "Mes paiements", href: `${account}/paiements` },
    ],
  },
  {
    title: "Assistance & support",
    items: [
      { label: "Contactez notre service client", href: `${account}/support` },
      { label: "Lire les CGV ALTERPARK", href: routes.terms },
    ],
  },
];

function Initials({ firstName, lastName }: { firstName: string; lastName: string }) {
  return <span className="acc-hero__avatar" aria-hidden>{`${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()}</span>;
}

async function Dashboard() {
  const user = await requireUser(routes.account);
  const upcoming = hasDatabase() ? await listUpcomingCustomerReservations(user.id) : [];
  return (
    <>
      <section className="ap-root ap-hero acc-hero" aria-labelledby="account-title">
        <div className="ap-hero__bg" aria-hidden>
          <Image src={assets.heroPhoto.src} width={assets.heroPhoto.width} height={assets.heroPhoto.height} alt="" sizes="100vw" quality={60} preload />
        </div>
        <div className="ap-hero__content">
          <div className="acc-hero__id">
            <Initials firstName={user.firstName} lastName={user.lastName} />
            <form action={logoutAction}>
              <button type="submit" className="acc-hero__logout" aria-label="Se déconnecter" title="Se déconnecter">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false">
                  <path d="M10 17l5-5-5-5M15 12H3M14 4h5a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-5" />
                </svg>
              </button>
            </form>
          </div>
          <p className="acc-hero__email">{user.email}</p>
          <h1 id="account-title" className="display ap-display">{accentTitle(`Bonjour ${user.firstName} ${user.lastName} !`)}</h1>
          <p className="body ap-body">Bienvenue dans votre espace client Alterpark ! Ici, vous pouvez gérer facilement vos réservations et retrouver toutes les informations liées à votre stationnement.</p>
          <Button href={routes.booking}>Nouvelle réservation</Button>
        </div>
      </section>
      <div className="ap-page">
        {!user.emailVerified ? (
          <div className="page-wrap">
            <Alert tone="warning" title="Adresse e-mail à confirmer">
              <p>
                Un lien de confirmation a été envoyé à <span className="break-all">{user.email}</span>. Confirmez votre adresse pour sécuriser votre compte.
              </p>
            </Alert>
          </div>
        ) : null}
        {upcoming.length ? (
          <section className="page-wrap acc-upcoming" aria-labelledby="upcoming-title">
            <h2 id="upcoming-title" className="h2 ap-h2">{accentTitle("Vos prochaines réservations")}</h2>
            <ul>
              {upcoming.map((r) => (
                <li key={r.id}>
                  <a className="font-bold text-primary underline" href={`${account}/reservations/${r.reference}`}>{`${r.reference} — ${r.parking.name}`}</a>
                  <span>{formatDateTime(r.startsAt.getTime(), r.parking.timeZone)}</span>
                  <Badge tone={STATUS_TONES[r.status]}>{STATUS_LABELS[r.status]}</Badge>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        <nav className="page-wrap acc-cols" aria-label="Votre espace client">
          {COLUMNS.map((c) => (
            <div key={c.title}>
              <h2 className="h2 ap-h2">{accentTitle(c.title)}</h2>
              <ul>
                {c.items.map((it) => (
                  <li key={it.label}>
                    {it.href ? <a href={it.href}>{it.label}</a> : <span>{it.label} <em>({it.note})</em></span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
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
