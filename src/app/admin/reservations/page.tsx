import type { Metadata } from "next";
import { AreaPage } from "@/components/site/AreaPage";
import { RequirePermission } from "@/components/site/AreaGates";
import { routes } from "@/config/site";

export const metadata: Metadata = { title: "Réservations" };

export default function Page() {
  return (
    <RequirePermission permission="RESERVATION_READ">
      <AreaPage
        title="Réservations"
        description="Recherche, filtres, détail, annulation et remboursement."
        crumbs={[{ label: "Back-office", href: routes.admin }, { label: "Réservations" }]}
        phase="phase 7"
        emptyTitle="Aucune réservation"
        emptyText="La liste des réservations, avec filtres par parking, statut et période, sera reliée à la base de données."
        icon="ticket"
      />
    </RequirePermission>
  );
}
