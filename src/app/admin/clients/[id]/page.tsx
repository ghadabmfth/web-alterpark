import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/layout/PageHeader";
import { Card } from "@/components/ui/layout/Card";
import { Badge } from "@/components/ui/feedback/Badge";
import { DescriptionList } from "@/components/ui/data/DescriptionList";
import { DataTable } from "@/components/ui/data/DataTable";
import { formatCents } from "@/components/ui/lib/format";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { AdminForm } from "@/components/admin/AdminForm";
import { shortDateTime } from "@/components/admin/format";
import { routes } from "@/config/site";
import { adminActor } from "@/modules/admin/page-guard";
import { getCustomer } from "@/modules/admin/customers";
import { customerStatusAction } from "@/modules/admin/actions/catalog";
import { anonymiseCustomerAction } from "@/modules/privacy/actions";
import { STATUS_LABELS, STATUS_TONES } from "@/modules/reservations/domain/status";
import { formatDateTime } from "@/modules/reservations/domain/stay";

export const metadata: Metadata = { title: "Client" };

export default async function AdminCustomer({ params }: PageProps<"/admin/clients/[id]">) {
  const actor = await adminActor("CUSTOMER_READ");
  if (!actor) return <AccessDenied />;
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const u = await getCustomer(actor, id);
  if (!u) notFound();
  const active = u.status === "ACTIVE";
  return (
    <>
      <PageHeader
        title={`${u.firstName} ${u.lastName}`}
        description={u.email}
        breadcrumbs={[{ label: "Back-office", href: routes.admin }, { label: "Clients", href: `${routes.admin}/clients` }, { label: `${u.firstName} ${u.lastName}` }]}
        actions={<Badge tone={active ? "success" : "neutral"}>{active ? "Actif" : "Désactivé"}</Badge>}
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Compte" titleAs="h2">
          <DescriptionList
            items={[
              { term: "E-mail", value: `${u.email}${u.emailVerifiedAt ? " (confirmée)" : " (non confirmée)"}` },
              { term: "Téléphone", value: u.phone ?? "—" },
              { term: "Inscrit le", value: shortDateTime(u.createdAt) },
              { term: "Dernière connexion", value: u.lastLoginAt ? shortDateTime(u.lastLoginAt) : "—" },
              { term: "Véhicules", value: u.vehicles.map((v) => v.plate).join(", ") || "—" },
            ]}
          />
        </Card>
        {actor.can("CUSTOMER_MANAGE") ? (
          <Card title="Accès" titleAs="h2">
            <AdminForm
              action={customerStatusAction}
              hidden={{ id: u.id, status: active ? "DISABLED" : "ACTIVE" }}
              submitLabel={active ? "Désactiver le compte" : "Réactiver le compte"}
              variant="secondary"
              confirm={active ? { title: "Désactiver le compte", body: "Le client est déconnecté immédiatement et ne peut plus se connecter. Ses réservations restent valables.", confirmLabel: "Désactiver" } : undefined}
            >
              <p className="m-0 text-text-secondary">{active ? "Un compte désactivé ne peut plus se connecter ; ses réservations restent valables." : "Le client pourra de nouveau se connecter."}</p>
            </AdminForm>
            {u.deletedAt ? null : (
              <div className="mt-8">
                <AdminForm
                  action={anonymiseCustomerAction}
                  hidden={{ id: u.id }}
                  submitLabel="Anonymiser (demande RGPD)"
                  variant="secondary"
                  label="Anonymiser le client"
                  confirm={{ title: "Anonymiser le client", body: "Identité, coordonnées, véhicules et messages sont effacés définitivement ; les réservations passées restent pour la comptabilité. À faire uniquement sur demande écrite du client.", confirmLabel: "Anonymiser" }}
                />
              </div>
            )}
          </Card>
        ) : null}
      </div>
      <Card title="Réservations" titleAs="h2" className="mt-6">
        <DataTable
          caption="Réservations du client"
          rows={u.reservations}
          rowKey={(r) => r.id}
          empty={<p className="m-0 text-text-secondary">Aucune réservation.</p>}
          columns={[
            { key: "ref", header: "Référence", nowrap: true, cell: (r) => (actor.can("RESERVATION_READ") ? <Link className="text-primary underline" href={`${routes.admin}/reservations/${r.reference}`}>{r.reference}</Link> : r.reference) },
            { key: "parking", header: "Parking", cell: (r) => r.parking.name },
            { key: "start", header: "Dépôt", cell: (r) => formatDateTime(r.startsAt.getTime(), r.parking.timeZone) },
            { key: "status", header: "Statut", nowrap: true, cell: (r) => <Badge tone={STATUS_TONES[r.status]}>{STATUS_LABELS[r.status]}</Badge> },
            { key: "total", header: "Montant", align: "end", nowrap: true, cell: (r) => formatCents(r.totalCents) },
          ]}
        />
      </Card>
      {u.contactMessages.length ? (
        <Card title="Demandes de contact" titleAs="h2" className="mt-6">
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {u.contactMessages.map((m) => (
              <li key={m.id}>
                {actor.can("CONTACT_READ") ? <Link className="text-primary underline" href={`${routes.admin}/contacts/${m.id}`}>{shortDateTime(m.createdAt)}</Link> : shortDateTime(m.createdAt)}
                {` — ${m.message.slice(0, 120)}${m.message.length > 120 ? "…" : ""}`}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </>
  );
}
