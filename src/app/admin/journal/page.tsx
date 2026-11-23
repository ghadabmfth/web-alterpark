import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/layout/PageHeader";
import { FilterBar } from "@/components/ui/forms/FilterBar";
import { TextField } from "@/components/ui/forms/TextField";
import { DataTable } from "@/components/ui/data/DataTable";
import { Pagination } from "@/components/ui/data/Pagination";
import { EmptyState } from "@/components/ui/feedback/EmptyState";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { AUDIT_LABELS, shortDateTime } from "@/components/admin/format";
import { routes } from "@/config/site";
import { adminActor } from "@/modules/admin/page-guard";
import { listAudit } from "@/modules/admin/insights";
import { hrefWith, pageOf, param, totalPages, type SearchParams } from "@/modules/admin/list";

export const metadata: Metadata = { title: "Journal d’audit" };
const PATH = `${routes.admin}/journal`;

export default async function AdminAudit({ searchParams }: PageProps<"/admin/journal">) {
  const actor = await adminActor("AUDIT_LOG_READ");
  if (!actor) return <AccessDenied />;
  const sp = (await searchParams) as SearchParams;
  const f = { action: param(sp, "action"), entity: param(sp, "objet"), actorEmail: param(sp, "auteur"), from: param(sp, "du"), to: param(sp, "au") };
  const { page, skip, take } = pageOf(sp);
  const { rows, count } = await listAudit(actor, { ...f, skip, take });
  return (
    <>
      <PageHeader title="Journal d’audit" description="Toutes les actions sensibles, par qui et quand. Le journal ne peut pas être modifié." breadcrumbs={[{ label: "Back-office", href: routes.admin }, { label: "Journal d’audit" }]} />
      <FilterBar action={PATH} resetHref={PATH} label="Filtrer le journal">
        <TextField label="Action" name="action" defaultValue={f.action} help="Début du code, ex. reservation. ou staff." />
        <TextField label="Objet" name="objet" defaultValue={f.entity} help="Type (Reservation…) ou identifiant" />
        <TextField label="Auteur (e-mail)" name="auteur" defaultValue={f.actorEmail} />
        <TextField label="Du" name="du" type="date" defaultValue={f.from} />
        <TextField label="au" name="au" type="date" defaultValue={f.to} />
      </FilterBar>
      <DataTable
        caption="Journal d’audit"
        rows={rows}
        rowKey={(e) => e.id}
        empty={<EmptyState icon="shield" title="Aucune entrée" text="Aucune entrée ne correspond à ces filtres." />}
        columns={[
          { key: "date", header: "Date", nowrap: true, cell: (e) => shortDateTime(e.createdAt) },
          { key: "who", header: "Auteur", cell: (e) => (e.actor ? `${e.actor.firstName} ${e.actor.lastName} (${e.actor.email})` : e.actorType === "WEBHOOK" ? "Prestataire de paiement" : "Système") },
          { key: "action", header: "Action", cell: (e) => <span title={e.action}>{AUDIT_LABELS[e.action] ?? e.action}</span> },
          { key: "entity", header: "Objet", cell: (e) => `${e.entityType}${e.entityId ? ` ${e.entityId.slice(0, 8)}…` : ""}` },
          { key: "meta", header: "Détails", cell: (e) => (e.metadata ? <code className="break-all">{JSON.stringify(e.metadata).slice(0, 200)}</code> : "—") },
        ]}
      />
      <Pagination className="mt-6" page={page} totalPages={totalPages(count)} hrefFor={(p) => hrefWith(PATH, sp, { page: p })} />
    </>
  );
}
