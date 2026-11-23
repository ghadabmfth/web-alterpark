import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/layout/PageHeader";
import { Card } from "@/components/ui/layout/Card";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { AdminForm, FormCheckbox, FormText } from "@/components/admin/AdminForm";
import { routes } from "@/config/site";
import { adminActor } from "@/modules/admin/page-guard";
import { getSettings } from "@/modules/admin/settings";
import { saveSettingsAction } from "@/modules/admin/actions/administration";

export const metadata: Metadata = { title: "Paramètres" };

export default async function AdminSettings() {
  const actor = await adminActor("SETTINGS_MANAGE");
  if (!actor) return <AccessDenied />;
  const s = await getSettings(actor);
  return (
    <>
      <PageHeader title="Paramètres" description="Réglages généraux. Les règles de chaque site (délais, annulation, capacités) se trouvent sur sa fiche." breadcrumbs={[{ label: "Back-office", href: routes.admin }, { label: "Paramètres" }]} />
      <Card title="Réservation en ligne" titleAs="h2">
        <AdminForm action={saveSettingsAction} submitLabel="Enregistrer" label="Réservation en ligne">
          <FormCheckbox name="bookingEnabled" label="Réservation en ligne ouverte" defaultChecked={s["booking.enabled"]} />
          <p className="m-0 text-text-secondary">Décoché : plus aucun devis ni paiement n’est possible sur tous les sites (incident, fermeture). Les réservations existantes ne changent pas.</p>
          <FormText label="Message affiché au-dessus du formulaire de réservation" name="bookingNotice" multiline rows={2} maxLength={300} defaultValue={s["booking.notice"]} help="Facultatif, 300 caractères au maximum. Exemple : travaux d’accès du 3 au 5 mars." />
        </AdminForm>
      </Card>
    </>
  );
}
