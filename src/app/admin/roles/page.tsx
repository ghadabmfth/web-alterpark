import type { Metadata } from "next";
import { AreaPage } from "@/components/site/AreaPage";
import { RequirePermission } from "@/components/site/AreaGates";
import { routes } from "@/config/site";

export const metadata: Metadata = { title: "Rôles et permissions" };

export default function Page() {
  return (
    <RequirePermission permission="ROLE_MANAGE">
      <AreaPage
        title="Rôles et permissions"
        description="Rôles Client, Administrateur, Super-administrateur et rôles personnalisés."
        crumbs={[{ label: "Back-office", href: routes.admin }, { label: "Rôles et permissions" }]}
        phase="phase 7"
        emptyTitle="Aucun rôle chargé"
        emptyText="Les rôles et leurs permissions seront lus depuis la base de données."
        icon="shield"
      />
    </RequirePermission>
  );
}
