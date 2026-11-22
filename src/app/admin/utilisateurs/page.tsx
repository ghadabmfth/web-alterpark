import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/layout/PageHeader";
import { Card } from "@/components/ui/layout/Card";
import { DataTable } from "@/components/ui/data/DataTable";
import { Badge } from "@/components/ui/feedback/Badge";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { AdminForm, FormSelect, FormText } from "@/components/admin/AdminForm";
import { shortDateTime } from "@/components/admin/format";
import { routes } from "@/config/site";
import { adminActor } from "@/modules/admin/page-guard";
import { listStaff } from "@/modules/admin/staff";
import { changeStaffRoleAction, inviteStaffAction, staffStatusAction } from "@/modules/admin/actions/administration";

export const metadata: Metadata = { title: "Utilisateurs" };

export default async function AdminStaff() {
  const actor = await adminActor("ADMIN_USER_MANAGE");
  if (!actor) return <AccessDenied />;
  const { users, roles } = await listStaff(actor);
  const roleOptions = roles.filter((r) => r.key !== "SUPER_ADMIN" || actor.roleKey === "SUPER_ADMIN").map((r) => ({ value: r.id, label: r.name }));
  return (
    <>
      <PageHeader title="Utilisateurs" description="Comptes de l’équipe ayant accès au back-office." breadcrumbs={[{ label: "Back-office", href: routes.admin }, { label: "Utilisateurs" }]} />
      <DataTable
        caption="Équipe"
        rows={users}
        rowKey={(u) => u.id}
        columns={[
          { key: "name", header: "Nom", cell: (u) => `${u.firstName} ${u.lastName}${u.id === actor.id ? " (vous)" : ""}` },
          { key: "email", header: "E-mail", cell: (u) => `${u.email}${u.passwordHash ? "" : " — invitation en attente"}` },
          {
            key: "role",
            header: "Rôle",
            cell: (u) =>
              u.id === actor.id ? (
                u.role.name
              ) : (
                <AdminForm action={changeStaffRoleAction} hidden={{ id: u.id }} submitLabel="Changer" variant="secondary" inline label={`Rôle de ${u.firstName} ${u.lastName} (${u.email})`}>
                  <FormSelect label="Rôle" name="roleId" defaultValue={u.roleId} options={roleOptions.some((o) => o.value === u.roleId) ? roleOptions : [{ value: u.roleId, label: u.role.name }, ...roleOptions]} />
                </AdminForm>
              ),
          },
          { key: "login", header: "Dernière connexion", nowrap: true, cell: (u) => (u.lastLoginAt ? shortDateTime(u.lastLoginAt) : "—") },
          {
            key: "status",
            header: "Accès",
            cell: (u) =>
              u.id === actor.id ? (
                <Badge tone="success">Actif</Badge>
              ) : (
                <AdminForm
                  action={staffStatusAction}
                  hidden={{ id: u.id, status: u.status === "ACTIVE" ? "DISABLED" : "ACTIVE" }}
                  submitLabel={u.status === "ACTIVE" ? "Désactiver" : "Réactiver"}
                  variant="secondary"
                  inline
                  label={`Accès de ${u.firstName} ${u.lastName} (${u.email})`}
                  confirm={u.status === "ACTIVE" ? { title: "Désactiver l’accès", body: `${u.firstName} ${u.lastName} est déconnecté immédiatement et ne peut plus se connecter.`, confirmLabel: "Désactiver" } : undefined}
                />
              ),
          },
        ]}
      />
      <Card title="Inviter un membre de l’équipe" titleAs="h2" className="mt-8">
        <AdminForm action={inviteStaffAction} submitLabel="Envoyer l’invitation" label="Inviter un membre">
          <div className="grid gap-6 md:grid-cols-2">
            <FormText label="Prénom" name="firstName" required />
            <FormText label="Nom" name="lastName" required />
            <FormText label="Adresse e-mail" name="email" type="email" required />
            <FormSelect label="Rôle" name="roleId" required placeholder="Choisir un rôle" options={roleOptions} />
          </div>
          <p className="m-0 text-text-secondary">La personne reçoit un lien valable 72 h pour choisir son mot de passe. Aucun mot de passe ne transite par vous.</p>
        </AdminForm>
      </Card>
    </>
  );
}
