import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/layout/PageHeader";
import { EmptyState } from "@/components/ui/feedback/EmptyState";
import { Alert } from "@/components/ui/feedback/Alert";
import { Button } from "@/components/ui/actions/Button";
import { Card } from "@/components/ui/layout/Card";
import { DescriptionList } from "@/components/ui/data/DescriptionList";
import { routes } from "@/config/site";
import { requireUser } from "@/server/auth/session";
import { hasDatabase } from "@/server/db/client";
import { Badge } from "@/components/ui/feedback/Badge";
import { listUpcomingCustomerReservations } from "@/modules/reservations/service";
import { STATUS_LABELS, STATUS_TONES } from "@/modules/reservations/domain/status";
import { formatDateTime } from "@/modules/reservations/domain/stay";

export const metadata: Metadata = { title: "Tableau de bord" };

export default async function AccountDashboard() {
  const user = await requireUser(routes.account);
  const upcoming = hasDatabase() ? await listUpcomingCustomerReservations(user.id) : [];
  return (
    <>
      <PageHeader title={`Bonjour ${user.firstName}`} description="Vos réservations et votre compte ALTERPARK." breadcrumbs={[{ label: "Mon compte" }]} actions={<Button href={routes.booking} size="sm">Réserver une place</Button>} />
      {!user.emailVerified ? (
        <Alert tone="warning" title="Adresse e-mail à confirmer" className="mb-8">
          <p>{`Un lien de confirmation a été envoyé à ${user.email}. Confirmez votre adresse pour sécuriser votre compte.`}</p>
        </Alert>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-2">
        {upcoming.length ? (
          <Card title="Prochaines réservations" titleAs="h2" footer={<Button href={`${routes.account}/reservations`} size="sm" variant="secondary">Toutes mes réservations</Button>}>
            <ul className="m-0 flex list-none flex-col gap-4 p-0">
              {upcoming.map((r) => (
                <li key={r.id} className="flex flex-col gap-1">
                  <a className="text-primary underline" href={`${routes.account}/reservations/${r.reference}`}>{`${r.reference} — ${r.parking.name}`}</a>
                  <span>{formatDateTime(r.startsAt.getTime(), r.parking.timeZone)}</span>
                  <span><Badge tone={STATUS_TONES[r.status]}>{STATUS_LABELS[r.status]}</Badge></span>
                </li>
              ))}
            </ul>
          </Card>
        ) : (
          <EmptyState title="Aucune réservation à venir" text="Vos prochaines réservations apparaîtront ici." action={<Button href={`${routes.account}/reservations`} size="sm" variant="secondary">Historique</Button>} />
        )}
        <Card title="Mon compte" titleAs="h2" footer={<Button href={`${routes.account}/profil`} size="sm" variant="secondary">Modifier</Button>}>
          <DescriptionList
            items={[
              { term: "Nom", value: `${user.firstName} ${user.lastName}` },
              { term: "E-mail", value: `${user.email}${user.emailVerified ? "" : " (non confirmée)"}` },
              { term: "Téléphone", value: user.phone ?? "Non renseigné" },
            ]}
          />
        </Card>
      </div>
    </>
  );
}
