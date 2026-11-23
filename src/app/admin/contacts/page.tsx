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
import { CONTACT_STATUS, shortDateTime } from "@/components/admin/format";
import { routes } from "@/config/site";
import { adminActor } from "@/modules/admin/page-guard";
import { listContacts } from "@/modules/admin/customers";
import { hrefWith, pageOf, param, totalPages, type SearchParams } from "@/modules/admin/list";
import { CONTACT_SUBJECTS, type ContactSubject } from "@/modules/contact/schema";

export const metadata: Metadata = { title: "Demandes de contact" };
const PATH = `${routes.admin}/contacts`;

export default async function AdminContacts({ searchParams }: PageProps<"/admin/contacts">) {
  const actor = await adminActor("CONTACT_READ");
  if (!actor) return <AccessDenied />;
  const sp = (await searchParams) as SearchParams;
  const f = { q: param(sp, "q"), status: param(sp, "statut"), subject: param(sp, "sujet"), mine: param(sp, "moi") === "1" };
  const { page, skip, take } = pageOf(sp);
  const { rows, count } = await listContacts(actor, { ...f, skip, take });
  return (
    <>
      <PageHeader title="Demandes de contact" description={`${count} demande${count > 1 ? "s" : ""}${f.status ? "" : " à traiter"}`} breadcrumbs={[{ label: "Back-office", href: routes.admin }, { label: "Demandes de contact" }]} />
      <FilterBar action={PATH} resetHref={PATH} label="Filtrer les demandes">
        <TextField label="Recherche" name="q" type="search" defaultValue={f.q} help="Nom, e-mail ou texte" />
        <Select label="Statut" name="statut" defaultValue={f.status} placeholder="À traiter" options={Object.entries(CONTACT_STATUS).map(([value, [label]]) => ({ value, label }))} />
        <Select label="Sujet" name="sujet" defaultValue={f.subject} placeholder="Tous" options={Object.entries(CONTACT_SUBJECTS).map(([value, label]) => ({ value, label }))} />
        <Select label="Assignées" name="moi" defaultValue={f.mine ? "1" : ""} placeholder="À tout le monde" options={[{ value: "1", label: "À moi" }]} />
      </FilterBar>
      <DataTable
        caption="Demandes de contact"
        rows={rows}
        rowKey={(m) => m.id}
        empty={<EmptyState icon="pin" title="Aucune demande" text="Aucune demande ne correspond à ces filtres." />}
        columns={[
          { key: "date", header: "Reçue le", nowrap: true, cell: (m) => <Link className="text-primary underline" href={`${PATH}/${m.id}`}>{shortDateTime(m.createdAt)}</Link> },
          { key: "from", header: "De", cell: (m) => `${m.name} — ${m.email}` },
          { key: "subject", header: "Sujet", cell: (m) => CONTACT_SUBJECTS[m.subject as ContactSubject] ?? m.subject },
          { key: "parking", header: "Parking", cell: (m) => m.parking?.name ?? "—" },
          { key: "assignee", header: "Assignée à", cell: (m) => (m.assignedTo ? `${m.assignedTo.firstName} ${m.assignedTo.lastName}` : "—") },
          { key: "status", header: "Statut", nowrap: true, cell: (m) => <Badge tone={CONTACT_STATUS[m.status]![1]}>{CONTACT_STATUS[m.status]![0]}</Badge> },
        ]}
      />
      <Pagination className="mt-6" page={page} totalPages={totalPages(count)} hrefFor={(p) => hrefWith(PATH, sp, { page: p })} />
    </>
  );
}
