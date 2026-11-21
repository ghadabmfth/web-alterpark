import type { Metadata } from "next";
import { AppShell } from "@/components/ui/layout/AppShell";
import { Button } from "@/components/ui/actions/Button";
import { PreviewNotice } from "@/components/site/PreviewNotice";
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
      topbar={<Button href={routes.login} size="sm" variant="secondary">Se connecter</Button>}
    >
      <PreviewNotice area="L’espace client" />
      {children}
    </AppShell>
  );
}
