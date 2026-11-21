import type { Metadata } from "next";
import { AreaPage } from "@/components/site/AreaPage";
import { routes } from "@/config/site";

export const metadata: Metadata = { title: "Mes réservations" };

export default function Page() {
  return (
    <AreaPage
      title="Mes réservations"
      description="Historique et détail de vos réservations, demandes d’annulation."
      crumbs={[{ label: "Mon compte", href: routes.account }, { label: "Mes réservations" }]}
      phase="phase 5"
      emptyTitle="Aucune réservation"
      emptyText="Vous retrouverez ici chaque réservation, son statut et la possibilité de demander une annulation."
      icon="ticket"
    />
  );
}
