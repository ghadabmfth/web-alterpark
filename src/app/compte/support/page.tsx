import type { Metadata } from "next";
import { AreaPage } from "@/components/site/AreaPage";
import { routes } from "@/config/site";

export const metadata: Metadata = { title: "Aide et contact" };

export default function Page() {
  return (
    <AreaPage
      title="Aide et contact"
      description="Une question sur une réservation ? Notre équipe vous répond."
      crumbs={[{ label: "Mon compte", href: routes.account }, { label: "Aide et contact" }]}
      phase="phase 4"
      emptyTitle="Messagerie non disponible"
      emptyText="En attendant, utilisez la page Contact du site."
      icon="pin"
    />
  );
}
