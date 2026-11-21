import type { Metadata } from "next";
import { AreaPage } from "@/components/site/AreaPage";
import { routes } from "@/config/site";

export const metadata: Metadata = { title: "Rapports" };

export default function Page() {
  return (
    <AreaPage
      title="Rapports"
      description="Exports et analyses par période et par parking."
      crumbs={[{ label: "Back-office", href: routes.admin }, { label: "Rapports" }]}
      phase="phase 7"
      emptyTitle="Aucun rapport"
      emptyText="Les rapports et exports CSV seront générés à partir des données réelles."
      icon="bolt"
    />
  );
}
