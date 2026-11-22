import { Suspense } from "react";
import type { Metadata } from "next";
import { AppShell } from "@/components/ui/layout/AppShell";
import { LoadingRegion, Skeleton } from "@/components/ui/feedback/Skeleton";
import { StaffGate, UserMenu } from "@/components/site/AreaGates";
import { ToastProvider } from "@/components/ui/feedback/Toast";
import { routes } from "@/config/site";

export const metadata: Metadata = { title: { default: "Back-office", template: "%s | Back-office ALTERPARK" }, robots: { index: false, follow: false } };

const a = (p: string) => `${routes.admin}/${p}`;

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <ToastProvider>
      <AppShell
        context="Back-office"
        navLabel="Navigation du back-office"
        rootHref={routes.admin}
        homeHref={routes.admin}
        nav={[
          { items: [{ label: "Tableau de bord", href: routes.admin }] },
          {
            title: "Activité",
            items: [
              { label: "Réservations", href: a("reservations") },
              { label: "Paiements", href: a("paiements") },
              { label: "Clients", href: a("clients") },
              { label: "Demandes de contact", href: a("contacts") },
            ],
          },
          {
            title: "Parkings",
            items: [
              { label: "Sites et offres", href: a("parkings") },
              { label: "Tarifs", href: a("tarifs") },
            ],
          },
          { title: "Pilotage", items: [{ label: "Rapports", href: a("rapports") }] },
          {
            title: "Administration",
            items: [
              { label: "Utilisateurs", href: a("utilisateurs") },
              { label: "Rôles et permissions", href: a("roles") },
              { label: "Paramètres", href: a("parametres") },
              { label: "Journal d’audit", href: a("journal") },
            ],
          },
        ]}
        topbar={
          <Suspense fallback={null}>
            <UserMenu />
          </Suspense>
        }
      >
        <Suspense
          fallback={
            <LoadingRegion label="Chargement du back-office…">
              <Skeleton width="40%" />
              <Skeleton variant="block" />
            </LoadingRegion>
          }
        >
          <StaffGate>{children}</StaffGate>
        </Suspense>
      </AppShell>
    </ToastProvider>
  );
}
