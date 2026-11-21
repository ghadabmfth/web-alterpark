import type { Metadata } from "next";
import { AreaPage } from "@/components/site/AreaPage";

export const metadata: Metadata = { title: "Tableau de bord" };

export default function Page() {
  return (
    <AreaPage
      title="Tableau de bord"
      description="Vos prochaines réservations et l’état de vos paiements."
      crumbs={[{ label: "Mon compte" }]}
      phase="phase 4 (comptes) et phase 5 (réservations)"
      emptyTitle="Aucune réservation à venir"
      emptyText="Vos réservations apparaîtront ici après votre première réservation."
      icon="ticket"
    />
  );
}
