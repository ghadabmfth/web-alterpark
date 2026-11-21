import type { Metadata } from "next";
import { AreaPage } from "@/components/site/AreaPage";
import { routes } from "@/config/site";

export const metadata: Metadata = { title: "Clients" };

export default function Page() {
  return (
    <AreaPage
      title="Clients"
      description="Comptes clients, véhicules et historique."
      crumbs={[{ label: "Back-office", href: routes.admin }, { label: "Clients" }]}
      phase="phase 7"
      emptyTitle="Aucun client"
      emptyText="Les comptes clients et leur historique de réservations s’afficheront ici."
      icon="shield"
    />
  );
}
