import type { Metadata } from "next";
import { AreaPage } from "@/components/site/AreaPage";
import { routes } from "@/config/site";

export const metadata: Metadata = { title: "Demandes de contact" };

export default function Page() {
  return (
    <AreaPage
      title="Demandes de contact"
      description="Suivi des messages : statut, attribution, notes internes."
      crumbs={[{ label: "Back-office", href: routes.admin }, { label: "Demandes de contact" }]}
      phase="phase 7"
      emptyTitle="Aucune demande"
      emptyText="Les messages du formulaire de contact s’afficheront ici avec leur statut de traitement."
      icon="pin"
    />
  );
}
