import type { Metadata } from "next";
import { AreaPage } from "@/components/site/AreaPage";
import { RequirePermission } from "@/components/site/AreaGates";
import { routes } from "@/config/site";

export const metadata: Metadata = { title: "Rapports" };

export default function Page() {
  return (
    <RequirePermission permission="REPORT_VIEW">
      <AreaPage
        title="Rapports"
        description="Exports et analyses par période et par parking."
        crumbs={[{ label: "Back-office", href: routes.admin }, { label: "Rapports" }]}
        phase="phase 7"
        emptyTitle="Aucun rapport"
        emptyText="Les rapports et exports CSV seront générés à partir des données réelles."
        icon="bolt"
      />
    </RequirePermission>
  );
}
