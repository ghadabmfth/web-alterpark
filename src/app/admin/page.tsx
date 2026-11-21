import type { Metadata } from "next";
import { AreaPage } from "@/components/site/AreaPage";

export const metadata: Metadata = { title: "Tableau de bord" };

export default function Page() {
  return (
    <AreaPage
      title="Tableau de bord"
      description="Indicateurs calculés à partir des données réelles : réservations, chiffre d’affaires vérifié, occupation."
      crumbs={[{ label: "Back-office" }]}
      phase="phase 7 (données réelles uniquement)"
      emptyTitle="Aucun indicateur"
      emptyText="Les indicateurs seront calculés par requêtes sur la base de données, filtrables par période et par parking."
      icon="bolt"
    />
  );
}
