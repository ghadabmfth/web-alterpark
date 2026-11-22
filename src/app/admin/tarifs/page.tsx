import type { Metadata } from "next";
import { AreaPage } from "@/components/site/AreaPage";
import { RequirePermission } from "@/components/site/AreaGates";
import { routes } from "@/config/site";

export const metadata: Metadata = { title: "Tarifs" };

export default function Page() {
  return (
    <RequirePermission permission="PRICING_MANAGE">
      <AreaPage
        title="Tarifs"
        description="Grilles tarifaires par offre et par période."
        crumbs={[{ label: "Back-office", href: routes.admin }, { label: "Tarifs" }]}
        phase="phase 7"
        emptyTitle="Aucune grille tarifaire"
        emptyText="Aucun tarif n’est publié tant que la grille n’a pas été validée et saisie."
        icon="ticket"
      />
    </RequirePermission>
  );
}
