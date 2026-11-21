import type { Metadata } from "next";
import { AreaPage } from "@/components/site/AreaPage";
import { routes } from "@/config/site";

export const metadata: Metadata = { title: "Mon profil" };

export default function Page() {
  return (
    <AreaPage
      title="Mon profil"
      description="Vos coordonnées, vos véhicules et votre mot de passe."
      crumbs={[{ label: "Mon compte", href: routes.account }, { label: "Mon profil" }]}
      phase="phase 4"
      emptyTitle="Profil non disponible"
      emptyText="La modification de vos coordonnées, de vos véhicules et de votre mot de passe sera disponible une fois connecté."
      icon="shield"
    />
  );
}
