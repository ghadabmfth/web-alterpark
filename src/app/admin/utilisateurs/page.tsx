import type { Metadata } from "next";
import { AreaPage } from "@/components/site/AreaPage";
import { routes } from "@/config/site";

export const metadata: Metadata = { title: "Utilisateurs" };

export default function Page() {
  return (
    <AreaPage
      title="Utilisateurs"
      description="Comptes du personnel et rôles attribués."
      crumbs={[{ label: "Back-office", href: routes.admin }, { label: "Utilisateurs" }]}
      phase="phase 7"
      emptyTitle="Aucun utilisateur"
      emptyText="La gestion des comptes administrateurs sera réservée au super-administrateur."
      icon="shield"
    />
  );
}
