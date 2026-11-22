import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/layout/PageHeader";
import { FilterBar } from "@/components/ui/forms/FilterBar";
import { TextField } from "@/components/ui/forms/TextField";
import { Select } from "@/components/ui/forms/Select";
import { DataTable } from "@/components/ui/data/DataTable";
import { Pagination } from "@/components/ui/data/Pagination";
import { Badge } from "@/components/ui/feedback/Badge";
import { EmptyState } from "@/components/ui/feedback/EmptyState";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { shortDateTime } from "@/components/admin/format";
import { routes } from "@/config/site";
import { adminActor } from "@/modules/admin/page-guard";
import { listCustomers } from "@/modules/admin/customers";
import { hrefWith, pageOf, param, totalPages, type SearchParams } from "@/modules/admin/list";

export const metadata: Metadata = { title: "Clients" };
const PATH = `${routes.admin}/clients`;

export default async function AdminCustomers({ searchParams }: PageProps<"/admin/clients">) {
  const actor = await adminActor("CUSTOMER_READ");
  if (!actor) return <AccessDenied />;
  const sp = (await searchParams) as SearchParams;
  const f = { q: param(sp, "q"), status: param(sp, "statut") };
  const { page, skip, take } = pageOf(sp);
  const { rows, count } = await listCustomers(actor, { ...f, skip, take });
  return (
    <>
      <PageHeader title="Clients" description={`${count} compte${count > 1 ? "s" : ""} client`} breadcrumbs={[{ label: "Back-office", href: routes.admin }, { label: "Clients" }]} />
      <FilterBar action={PATH} resetHref={PATH} label="Filtrer les clients">
        <TextField label="Recherche" name="q" type="search" defaultValue={f.q} help="Nom, e-mail ou téléphone" />
        <Select label="Statut" name="statut" defaultValue={f.status} placeholder="Tous" options={[{ value: "ACTIVE", label: "Actif" }, { value: "DISABLED", label: "Désactivé" }]} />
      </FilterBar>
      <DataTable
        caption="Clients"
        rows={rows}
        rowKey={(u) => u.id}
        empty={<EmptyState icon="shield" title="Aucun client" text="Aucun compte ne correspond à ces filtres." />}
        columns={[
          { key: "name", header: "Nom", cell: (u) => <Link className="text-primary underline" href={`${PATH}/${u.id}`}>{`${u.lastName.toUpperCase()} ${u.firstName}`}</Link> },
          { key: "email", header: "E-mail", cell: (u) => `${u.email}${u.emailVerifiedAt ? "" : " (non confirmée)"}` },
          { key: "phone", header: "Téléphone", nowrap: true, cell: (u) => u.phone ?? "—" },
          { key: "count", header: "Réservations", align: "end", cell: (u) => String(u._count.reservations) },
          { key: "created", header: "Inscrit le", nowrap: true, cell: (u) => shortDateTime(u.createdAt) },
          { key: "status", header: "Statut", nowrap: true, cell: (u) => <Badge tone={u.status === "ACTIVE" ? "success" : "neutral"}>{u.status === "ACTIVE" ? "Actif" : "Désactivé"}</Badge> },
        ]}
      />
      <Pagination className="mt-6" page={page} totalPages={totalPages(count)} hrefFor={(p) => hrefWith(PATH, sp, { page: p })} />
    </>
  );
}
