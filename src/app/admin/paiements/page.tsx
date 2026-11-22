import type { Metadata } from "next";
import { AreaPage } from "@/components/site/AreaPage";
import { RequirePermission } from "@/components/site/AreaGates";
import { routes } from "@/config/site";

export const metadata: Metadata = { title: "Paiements" };

export default function Page() {
  return (
    <RequirePermission permission="PAYMENT_READ">
      <AreaPage
        title="Paiements"
        description="Paiements vérifiés, échecs, remboursements."
        crumbs={[{ label: "Back-office", href: routes.admin }, { label: "Paiements" }]}
        phase="phase 7"
        emptyTitle="Aucun paiement"
        emptyText="Les paiements confirmés par le prestataire et les remboursements s’afficheront ici."
        icon="bolt"
      />
    </RequirePermission>
  );
}
