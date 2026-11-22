import { Suspense, type ReactNode } from "react";
import type { Metadata } from "next";
import type { Permission } from "@/generated/prisma/enums";
import { AppShell, type ShellNavGroup } from "@/components/ui/layout/AppShell";
import { LoadingRegion, Skeleton } from "@/components/ui/feedback/Skeleton";
import { UserMenu } from "@/components/site/AreaGates";
import { ToastProvider } from "@/components/ui/feedback/Toast";
import { routes } from "@/config/site";
import { can, requireStaff } from "@/server/auth/session";

export const metadata: Metadata = { title: { default: "Back-office", template: "%s | Back-office ALTERPARK" }, robots: { index: false, follow: false } };

const a = (p: string) => `${routes.admin}/${p}`;

/* Each entry is shown only to roles holding its permission (pages check again on their own). */
const NAV: { title?: string; items: { label: string; href: string; permission: Permission }[] }[] = [
  { items: [{ label: "Tableau de bord", href: routes.admin, permission: "DASHBOARD_VIEW" }] },
  {
    title: "Activité",
    items: [
      { label: "Réservations", href: a("reservations"), permission: "RESERVATION_READ" },
      { label: "Paiements", href: a("paiements"), permission: "PAYMENT_READ" },
      { label: "Clients", href: a("clients"), permission: "CUSTOMER_READ" },
      { label: "Demandes de contact", href: a("contacts"), permission: "CONTACT_READ" },
    ],
  },
  { title: "Parkings", items: [{ label: "Sites et offres", href: a("parkings"), permission: "PARKING_READ" }, { label: "Tarifs", href: a("tarifs"), permission: "PARKING_READ" }] },
  { title: "Pilotage", items: [{ label: "Rapports", href: a("rapports"), permission: "REPORT_VIEW" }] },
  {
    title: "Administration",
    items: [
      { label: "Utilisateurs", href: a("utilisateurs"), permission: "ADMIN_USER_MANAGE" },
      { label: "Rôles et permissions", href: a("roles"), permission: "ROLE_MANAGE" },
      { label: "Paramètres", href: a("parametres"), permission: "SETTINGS_MANAGE" },
      { label: "Journal d’audit", href: a("journal"), permission: "AUDIT_LOG_READ" },
    ],
  },
];

const shell = { context: "Back-office", navLabel: "Navigation du back-office", rootHref: routes.admin, homeHref: routes.admin };

/** Reads the session (customers get 404), then renders the shell with the member's menu. */
async function StaffShell({ children }: { children: ReactNode }) {
  const user = await requireStaff();
  const nav: ShellNavGroup[] = NAV.map((g) => ({ title: g.title, items: g.items.filter((i) => can(user, i.permission)).map(({ label, href }) => ({ label, href })) })).filter((g) => g.items.length);
  return (
    <AppShell {...shell} nav={nav} topbar={<UserMenu />}>
      {children}
    </AppShell>
  );
}

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <ToastProvider>
      {/* Prerendered shell: no menu entries until the role is known (never shows a forbidden one). */}
      <Suspense
        fallback={
          <AppShell {...shell} nav={[]}>
            <LoadingRegion label="Chargement du back-office…">
              <Skeleton width="40%" />
              <Skeleton variant="block" />
            </LoadingRegion>
          </AppShell>
        }
      >
        <StaffShell>{children}</StaffShell>
      </Suspense>
    </ToastProvider>
  );
}
