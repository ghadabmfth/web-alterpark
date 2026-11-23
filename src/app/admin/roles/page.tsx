import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/layout/PageHeader";
import { Card } from "@/components/ui/layout/Card";
import { Badge } from "@/components/ui/feedback/Badge";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { AdminForm, FormCheckbox, FormText } from "@/components/admin/AdminForm";
import { routes } from "@/config/site";
import { adminActor } from "@/modules/admin/page-guard";
import { listRoles } from "@/modules/admin/staff";
import { createRoleAction, deleteRoleAction, updateRoleAction } from "@/modules/admin/actions/administration";
import { ALL_PERMISSIONS, PERMISSION_LABELS } from "@/modules/auth/permissions";

export const metadata: Metadata = { title: "Rôles et permissions" };

function PermissionBoxes({ granted, disabled }: { granted: string[]; disabled?: boolean }) {
  return (
    <fieldset className="m-0 border-0 p-0">
      <legend className="mb-4 font-bold">Permissions</legend>
      <div className="grid gap-3 md:grid-cols-2">
        {ALL_PERMISSIONS.map((p) => (
          <FormCheckbox key={p} name="permissions[]" value={p} label={PERMISSION_LABELS[p]} defaultChecked={granted.includes(p)} disabled={disabled} />
        ))}
      </div>
    </fieldset>
  );
}

export default async function AdminRoles() {
  const actor = await adminActor("ROLE_MANAGE");
  if (!actor) return <AccessDenied />;
  const roles = await listRoles(actor);
  return (
    <>
      <PageHeader title="Rôles et permissions" description="Ce que chaque rôle peut voir et faire. Les changements s’appliquent dès la page suivante de chaque membre." breadcrumbs={[{ label: "Back-office", href: routes.admin }, { label: "Rôles et permissions" }]} />
      {roles.map((r) => {
        const granted = r.permissions.map((p) => p.permission as string);
        const locked = r.key === "SUPER_ADMIN" || !r.isStaff;
        return (
          <Card key={r.id} title={r.name} subtitle={`${r._count.users} membre(s)${r.isSystem ? " · rôle système" : ""}`} titleAs="h2" className="mb-6" actions={r.isStaff ? <Badge tone="info">Équipe</Badge> : <Badge>Clients</Badge>}>
            {locked ? (
              <p className="m-0 text-text-secondary">{r.key === "SUPER_ADMIN" ? "Tous les droits, non modifiable." : "Accès à son propre espace client uniquement, aucun accès au back-office."}</p>
            ) : (
              <div className="flex flex-col gap-6">
                <AdminForm action={updateRoleAction} hidden={{ id: r.id }} submitLabel="Enregistrer le rôle" label={`Rôle ${r.name}`}>
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormText label="Nom" name="name" required defaultValue={r.name} />
                    <FormText label="Description" name="description" defaultValue={r.description ?? ""} />
                  </div>
                  <PermissionBoxes granted={granted} />
                </AdminForm>
                {!r.isSystem ? (
                  <AdminForm action={deleteRoleAction} hidden={{ id: r.id }} submitLabel="Supprimer ce rôle" variant="secondary" label={`Supprimer ${r.name}`} confirm={{ title: "Supprimer le rôle", body: `Le rôle « ${r.name} » sera supprimé. Il ne doit plus être attribué.`, confirmLabel: "Supprimer" }} />
                ) : null}
              </div>
            )}
          </Card>
        );
      })}
      <Card title="Nouveau rôle" titleAs="h2">
        <AdminForm action={createRoleAction} submitLabel="Créer le rôle" label="Nouveau rôle">
          <div className="grid gap-6 md:grid-cols-2">
            <FormText label="Nom" name="name" required help="Exemple : Agent d’accueil" />
            <FormText label="Description" name="description" />
          </div>
          <PermissionBoxes granted={["DASHBOARD_VIEW", "RESERVATION_READ"]} />
        </AdminForm>
      </Card>
    </>
  );
}
