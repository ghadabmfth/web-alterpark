import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/ui/layout/AppShell";
import { PageHeader } from "@/components/ui/layout/PageHeader";
import { DropdownMenu } from "@/components/ui/navigation/DropdownMenu";
import { StatGrid, StatTile } from "@/components/ui/data/StatTile";
import { Card } from "@/components/ui/layout/Card";
import { EmptyState } from "@/components/ui/feedback/EmptyState";
import { Button } from "@/components/ui/actions/Button";
import { galleryEnabled } from "../gallery-gate";
import { formatEuro } from "@/components/ui/lib/format";

/* AppShell demo (back-office layout). Development only; all figures are SAMPLE DATA. */
export const metadata: Metadata = { title: "Design system — AppShell", robots: { index: false, follow: false } };

export default function ShellDemoPage() {
  if (!galleryEnabled()) notFound();
  return (
    <AppShell
      context="Back-office"
      navLabel="Navigation du back-office"
      homeHref="/dev/design-system"
      nav={[
        { items: [{ label: "Tableau de bord", href: "/dev/design-system/shell", current: true }] },
        { title: "Activité", items: [{ label: "Réservations", href: "#r" }, { label: "Paiements", href: "#p" }, { label: "Clients", href: "#c" }, { label: "Demandes de contact", href: "#m" }] },
        { title: "Parkings", items: [{ label: "Sites et offres", href: "#s" }, { label: "Tarifs", href: "#t" }] },
        { title: "Administration", items: [{ label: "Rapports", href: "#rep" }, { label: "Utilisateurs", href: "#u" }, { label: "Rôles", href: "#ro" }, { label: "Paramètres", href: "#set" }, { label: "Journal d’audit", href: "#a" }] },
      ]}
      topbar={<DropdownMenu label="Camille Durand" items={[{ label: "Mon profil", href: "#" }, { type: "separator" }, { label: "Se déconnecter", href: "#" }]} />}
    >
      <PageHeader title="Tableau de bord" description="Exemple de mise en page — chiffres fictifs." actions={<Button size="sm" variant="secondary">Exporter</Button>} />
      <StatGrid>
        <StatTile label="Réservations" value="214" hint="30 derniers jours" />
        <StatTile label="Confirmées" value="188" />
        <StatTile label="Chiffre d’affaires" value={formatEuro(12860)} hint="Paiements vérifiés" />
        <StatTile label="Demandes en attente" value="3" />
      </StatGrid>
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <Card title="Réservations récentes">
          <EmptyState title="Aucune réservation" text="Les réservations apparaîtront ici." />
        </Card>
        <Card title="Demandes de contact">
          <EmptyState icon="pin" title="Aucune demande en attente" />
        </Card>
      </div>
    </AppShell>
  );
}
