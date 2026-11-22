import type { Metadata } from "next";
import { AreaPage } from "@/components/site/AreaPage";
import { RequirePermission } from "@/components/site/AreaGates";
import { routes } from "@/config/site";

export const metadata: Metadata = { title: "Utilisateurs" };

export default function Page() {
  return (
    <RequirePermission permission="ADMIN_USER_MANAGE">
      <AreaPage
        title="Utilisateurs"
        description="Comptes du personnel et rôles attribués."
        crumbs={[{ label: "Back-office", href: routes.admin }, { label: "Utilisateurs" }]}
        phase="phase 7"
        emptyTitle="Aucun utilisateur"
        emptyText="La gestion des comptes administrateurs sera réservée au super-administrateur."
        icon="shield"
      />
    </RequirePermission>
  );
}
