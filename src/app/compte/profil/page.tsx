import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/layout/PageHeader";
import { Card } from "@/components/ui/layout/Card";
import { ChangePasswordForm, ProfileForm } from "@/components/site/AuthForms";
import { DeleteAccount } from "@/components/site/DeleteAccount";
import { routes } from "@/config/site";
import { requireUser } from "@/server/auth/session";

export const metadata: Metadata = { title: "Mon profil" };

export default async function ProfilePage() {
  const user = await requireUser(`${routes.account}/profil`);
  return (
    <>
      <PageHeader title="Mon profil" description="Vos coordonnées et votre mot de passe. Les véhicules enregistrés arrivent avec la réservation en ligne." breadcrumbs={[{ label: "Mon compte", href: routes.account }, { label: "Mon profil" }]} />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Mes coordonnées" titleAs="h2" subtitle={user.email}>
          <ProfileForm defaults={{ firstName: user.firstName, lastName: user.lastName, phone: user.phone ?? "" }} />
        </Card>
        <Card title="Mot de passe" titleAs="h2">
          <ChangePasswordForm />
        </Card>
      </div>
      {user.isStaff ? null : (
        <Card title="Supprimer mon compte" titleAs="h2" className="mt-6">
          <DeleteAccount />
        </Card>
      )}
    </>
  );
}
