import type { Metadata } from "next";
import { AreaPage } from "@/components/site/AreaPage";
import { routes } from "@/config/site";

export const metadata: Metadata = { title: "Mes paiements" };

export default function Page() {
  return (
    <AreaPage
      title="Mes paiements"
      description="Paiements et remboursements liés à vos réservations."
      crumbs={[{ label: "Mon compte", href: routes.account }, { label: "Mes paiements" }]}
      phase="phase 6"
      emptyTitle="Aucun paiement"
      emptyText="Les paiements et remboursements de vos réservations s’afficheront ici."
      icon="bolt"
    />
  );
}
