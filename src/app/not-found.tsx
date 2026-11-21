import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/content/SectionHeading";
import { Button } from "@/components/ui/actions/Button";
import { routes } from "@/config/site";

export const metadata: Metadata = { title: "Page introuvable", robots: { index: false, follow: false } };

export default function NotFound() {
  return (
    <main id="contenu" className="ap-container flex min-h-dvh flex-col items-center justify-center gap-8 py-16 text-center">
      <SectionHeading as="h1" title="Page introuvable !" align="center" typing={false}>
        <p>Cette page n’existe pas ou a été déplacée.</p>
      </SectionHeading>
      <div className="flex flex-wrap justify-center gap-4">
        <Button href={routes.home}>Retour à l’accueil</Button>
        <Button href={routes.contact} variant="outline">Nous contacter</Button>
      </div>
    </main>
  );
}
