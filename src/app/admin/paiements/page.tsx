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
import { Card } from "@/components/ui/layout/Card";
import { formatCents } from "@/components/ui/lib/format";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { PAYMENT_LABELS, REFUND_LABELS, shortDateTime } from "@/components/admin/format";
import { routes } from "@/config/site";
import { adminActor } from "@/modules/admin/page-guard";
import { listPayments } from "@/modules/admin/reservations";
import { hrefWith, pageOf, param, totalPages, type SearchParams } from "@/modules/admin/list";

export const metadata: Metadata = { title: "Paiements" };

const PATH = `${routes.admin}/paiements`;
const resLink = (ref: string) => <Link className="text-primary underline" href={`${routes.admin}/reservations/${ref}`}>{ref}</Link>;

export default async function AdminPayments({ searchParams }: PageProps<"/admin/paiements">) {
  const actor = await adminActor("PAYMENT_READ");
  if (!actor) return <AccessDenied />;
  const sp = (await searchParams) as SearchParams;
  const f = { q: param(sp, "q"), status: param(sp, "statut"), from: param(sp, "du"), to: param(sp, "au") };
  const { page, skip, take } = pageOf(sp);
  const { rows, count, refunds } = await listPayments(actor, { ...f, skip, take });
  return (
    <>
      <PageHeader title="Paiements" description="Paiements en ligne et remboursements. Les remboursements se décident depuis la fiche de la réservation." breadcrumbs={[{ label: "Back-office", href: routes.admin }, { label: "Paiements" }]} />
      <FilterBar action={PATH} resetHref={PATH} label="Filtrer les paiements">
        <TextField label="Référence" name="q" type="search" defaultValue={f.q} />
        <Select label="Statut" name="statut" defaultValue={f.status} placeholder="Tous" options={Object.entries(PAYMENT_LABELS).map(([value, [label]]) => ({ value, label }))} />
        <TextField label="Du" name="du" type="date" defaultValue={f.from} />
        <TextField label="au" name="au" type="date" defaultValue={f.to} />
      </FilterBar>
      <DataTable
        caption="Paiements"
        rows={rows}
        rowKey={(p) => p.id}
        empty={<EmptyState icon="ticket" title="Aucun paiement" text="Aucun paiement ne correspond à ces filtres." />}
        columns={[
          { key: "date", header: "Date", nowrap: true, cell: (p) => shortDateTime(p.createdAt) },
          { key: "ref", header: "Réservation", nowrap: true, cell: (p) => resLink(p.reservation.reference) },
          { key: "client", header: "Client", cell: (p) => `${p.reservation.customerFirstName} ${p.reservation.customerLastName}` },
          { key: "status", header: "Statut", nowrap: true, cell: (p) => <Badge tone={PAYMENT_LABELS[p.status][1]}>{PAYMENT_LABELS[p.status][0]}</Badge> },
          { key: "amount", header: "Montant", align: "end", nowrap: true, cell: (p) => formatCents(p.amountCents) },
          { key: "refunded", header: "Remboursé", align: "end", nowrap: true, cell: (p) => (p.refundedCents ? formatCents(p.refundedCents) : "—") },
        ]}
      />
      <Pagination className="mt-6" page={page} totalPages={totalPages(count)} hrefFor={(p) => hrefWith(PATH, sp, { page: p })} />
      <Card title="Derniers remboursements" titleAs="h2" className="mt-8">
        <DataTable
          caption="Derniers remboursements"
          rows={refunds}
          rowKey={(r) => r.id}
          empty={<p className="m-0 text-text-secondary">Aucun remboursement.</p>}
          columns={[
            { key: "date", header: "Date", nowrap: true, cell: (r) => shortDateTime(r.createdAt) },
            { key: "ref", header: "Réservation", nowrap: true, cell: (r) => resLink(r.payment.reservation.reference) },
            { key: "reason", header: "Motif", cell: (r) => r.reason ?? "—" },
            { key: "by", header: "Par", cell: (r) => (r.requestedBy ? `${r.requestedBy.firstName} ${r.requestedBy.lastName}` : "Automatique") },
            { key: "status", header: "Statut", nowrap: true, cell: (r) => <Badge tone={REFUND_LABELS[r.status][1]}>{REFUND_LABELS[r.status][0]}</Badge> },
            { key: "amount", header: "Montant", align: "end", nowrap: true, cell: (r) => formatCents(r.amountCents) },
          ]}
        />
      </Card>
    </>
  );
}
