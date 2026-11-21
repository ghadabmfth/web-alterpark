import type { Metadata } from "next";
import { AreaPage } from "@/components/site/AreaPage";
import { routes } from "@/config/site";

export const metadata: Metadata = { title: "Paramètres" };

export default function Page() {
  return (
    <AreaPage
      title="Paramètres"
      description="Coordonnées, règles de réservation et notifications."
      crumbs={[{ label: "Back-office", href: routes.admin }, { label: "Paramètres" }]}
      phase="phase 7"
      emptyTitle="Paramètres non disponibles"
      emptyText="Les paramètres modifiables seront enregistrés en base et tracés dans le journal d’audit."
      icon="gift"
    />
  );
}
