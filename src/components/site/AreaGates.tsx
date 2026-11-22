import type { ReactNode } from "react";
import type { Permission } from "@/generated/prisma/enums";
import { can, getCurrentUser, requireStaff, requireUser } from "@/server/auth/session";
import { logoutAction } from "@/modules/auth/actions";
import { Button } from "@/components/ui/actions/Button";
import { EmptyState } from "@/components/ui/feedback/EmptyState";

/*
 * Server-side guards of the protected areas. They read the session, so they render inside a
 * <Suspense> boundary (Cache Components). Every Server Action re-checks on its own.
 */

export async function AccountGate({ path, children }: { path: string; children: ReactNode }) {
  await requireUser(path);
  return <>{children}</>;
}

export async function StaffGate({ children }: { children: ReactNode }) {
  await requireStaff();
  return <>{children}</>;
}

/** Page-level permission inside the back office (the user is already known to be staff). */
export async function RequirePermission({ permission, children }: { permission: Permission; children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user || !can(user, permission)) {
    return <EmptyState icon="shield" title="Accès refusé" text="Votre rôle ne donne pas accès à cette section. Contactez un super-administrateur si nécessaire." />;
  }
  return <>{children}</>;
}

/** Name and sign-out button of the top bar. */
export async function UserMenu() {
  const user = await getCurrentUser();
  if (!user) return null;
  return (
    <>
      <span className="hidden font-bold text-text-secondary md:inline">{`${user.firstName} ${user.lastName}`}</span>
      <form action={logoutAction}>
        <Button type="submit" size="sm" variant="secondary">Se déconnecter</Button>
      </form>
    </>
  );
}
