import type { Metadata } from "next";
import { AreaPage } from "@/components/site/AreaPage";
import { RequirePermission } from "@/components/site/AreaGates";
import { routes } from "@/config/site";

export const metadata: Metadata = { title: "Journal d’audit" };

export default function Page() {
  return (
    <RequirePermission permission="AUDIT_LOG_READ">
      <AreaPage
        title="Journal d’audit"
        description="Historique des actions sensibles."
        crumbs={[{ label: "Back-office", href: routes.admin }, { label: "Journal d’audit" }]}
        phase="phase 7"
        emptyTitle="Journal vide"
        emptyText="Chaque action sensible (remboursement, annulation, changement de tarif ou de rôle) y sera tracée."
        icon="shield"
      />
    </RequirePermission>
  );
}
