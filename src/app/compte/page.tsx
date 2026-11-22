import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/layout/PageHeader";
import { EmptyState } from "@/components/ui/feedback/EmptyState";
import { Alert } from "@/components/ui/feedback/Alert";
import { Button } from "@/components/ui/actions/Button";
import { Card } from "@/components/ui/layout/Card";
import { DescriptionList } from "@/components/ui/data/DescriptionList";
import { routes } from "@/config/site";
import { requireUser } from "@/server/auth/session";

export const metadata: Metadata = { title: "Tableau de bord" };

export default async function AccountDashboard() {
  const user = await requireUser(routes.account);
  return (
    <>
      <PageHeader title={`Bonjour ${user.firstName}`} description="Vos réservations et votre compte ALTERPARK." breadcrumbs={[{ label: "Mon compte" }]} actions={<Button href={routes.booking} size="sm">Réserver une place</Button>} />
      {!user.emailVerified ? (
        <Alert tone="warning" title="Adresse e-mail à confirmer" className="mb-8">
          <p>{`Un lien de confirmation a été envoyé à ${user.email}. Confirmez votre adresse pour sécuriser votre compte.`}</p>
        </Alert>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-2">
        <EmptyState title="Aucune réservation à venir" text="Vos réservations apparaîtront ici. La réservation en ligne ouvre prochainement." />
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
