import { Suspense } from "react";
import type { Metadata } from "next";
import { AppShell } from "@/components/ui/layout/AppShell";
import { LoadingRegion, Skeleton } from "@/components/ui/feedback/Skeleton";
import { AccountGate, UserMenu } from "@/components/site/AreaGates";
import { routes } from "@/config/site";

export const metadata: Metadata = { title: { default: "Mon compte", template: "%s | Mon compte ALTERPARK" }, robots: { index: false, follow: false } };

export default function AccountLayout({ children }: LayoutProps<"/compte">) {
  return (
    <AppShell
      context="Espace client"
      navLabel="Navigation de l’espace client"
      rootHref={routes.account}
      nav={[
        {
          items: [
            { label: "Tableau de bord", href: routes.account },
            { label: "Mes réservations", href: `${routes.account}/reservations` },
            { label: "Mes paiements", href: `${routes.account}/paiements` },
            { label: "Mon profil", href: `${routes.account}/profil` },
            { label: "Aide et contact", href: `${routes.account}/support` },
          ],
        },
        { title: "Site", items: [{ label: "Réserver une place", href: routes.booking }, { label: "Retour au site", href: routes.home }] },
      ]}
      topbar={
        <Suspense fallback={null}>
          <UserMenu />
        </Suspense>
      }
    >
      <Suspense
        fallback={
          <LoadingRegion label="Chargement de votre espace…">
            <Skeleton width="40%" />
            <Skeleton variant="block" />
          </LoadingRegion>
        }
      >
        <AccountGate path={routes.account}>{children}</AccountGate>
      </Suspense>
    </AppShell>
  );
}
