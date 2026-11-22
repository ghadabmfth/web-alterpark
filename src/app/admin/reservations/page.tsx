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
import { Button } from "@/components/ui/actions/Button";
import { formatCents } from "@/components/ui/lib/format";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { routes } from "@/config/site";
import { db } from "@/server/db/client";
import { adminActor } from "@/modules/admin/page-guard";
import { listReservations, pendingCancellationRequests } from "@/modules/admin/reservations";
import { hrefWith, pageOf, param, totalPages, type SearchParams } from "@/modules/admin/list";
import { STATUS_LABELS, STATUS_TONES } from "@/modules/reservations/domain/status";
import { formatDateTime } from "@/modules/reservations/domain/stay";

export const metadata: Metadata = { title: "Réservations" };

const PATH = `${routes.admin}/reservations`;

export default async function AdminReservations({ searchParams }: PageProps<"/admin/reservations">) {
  const actor = await adminActor("RESERVATION_READ");
  if (!actor) return <AccessDenied />;
  const sp = (await searchParams) as SearchParams;
  const f = { q: param(sp, "q"), parking: param(sp, "parking"), status: param(sp, "statut"), from: param(sp, "du"), to: param(sp, "au") };
  const { page, skip, take } = pageOf(sp);
  const [{ rows, count }, parkings, requests] = await Promise.all([
    listReservations(actor, { ...f, skip, take }),
    db().parking.findMany({ where: { archivedAt: null }, select: { slug: true, name: true }, orderBy: { name: "asc" } }),
    pendingCancellationRequests(actor),
  ]);
  const exportHref = hrefWith(`${routes.admin}/rapports/export`, sp, { page: undefined });

  return (
    <>
      <PageHeader
        title="Réservations"
        description={`${count} réservation${count > 1 ? "s" : ""}`}
        breadcrumbs={[{ label: "Back-office", href: routes.admin }, { label: "Réservations" }]}
        actions={actor.can("REPORT_VIEW") ? <Button href={exportHref} size="sm" variant="secondary">Exporter (CSV)</Button> : undefined}
      />
      {requests.length ? (
        <Card title={`Demandes d’annulation à traiter (${requests.length})`} titleAs="h2" className="mb-6">
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {requests.map((q) => (
              <li key={q.id}>
                <Link className="text-primary underline" href={`${PATH}/${q.reservation.reference}`}>{q.reservation.reference}</Link>
                {` — ${q.reservation.customerFirstName} ${q.reservation.customerLastName}, ${q.reservation.parking.name}, arrivée ${formatDateTime(q.reservation.startsAt.getTime(), q.reservation.parking.timeZone)}`}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
      <FilterBar action={PATH} resetHref={PATH} label="Filtrer les réservations">
        <TextField label="Recherche" name="q" type="search" defaultValue={f.q} help="Référence, nom, e-mail ou immatriculation" />
        <Select label="Parking" name="parking" defaultValue={f.parking} placeholder="Tous" options={parkings.map((p) => ({ value: p.slug, label: p.name }))} />
        <Select label="Statut" name="statut" defaultValue={f.status} placeholder="Tous" options={Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))} />
        <TextField label="Arrivée du" name="du" type="date" defaultValue={f.from} />
        <TextField label="au" name="au" type="date" defaultValue={f.to} />
      </FilterBar>
      <DataTable
        caption="Réservations"
        rows={rows}
        rowKey={(r) => r.id}
        empty={<EmptyState icon="ticket" title="Aucune réservation" text="Aucune réservation ne correspond à ces filtres." />}
        columns={[
          { key: "ref", header: "Référence", nowrap: true, cell: (r) => <Link className="text-primary underline" href={`${PATH}/${r.reference}`}>{r.reference}</Link> },
          { key: "client", header: "Client", cell: (r) => `${r.customerFirstName} ${r.customerLastName}` },
          { key: "parking", header: "Parking", cell: (r) => `${r.parking.name} — ${r.offer.name}` },
          { key: "start", header: "Dépôt", cell: (r) => formatDateTime(r.startsAt.getTime(), r.parking.timeZone) },
          { key: "end", header: "Récupération", cell: (r) => formatDateTime(r.endsAt.getTime(), r.parking.timeZone) },
          { key: "plate", header: "Véhicule", nowrap: true, cell: (r) => r.vehiclePlate },
          { key: "status", header: "Statut", nowrap: true, cell: (r) => <Badge tone={STATUS_TONES[r.status]}>{STATUS_LABELS[r.status]}</Badge> },
          { key: "total", header: "Montant", align: "end", nowrap: true, cell: (r) => formatCents(r.totalCents) },
        ]}
      />
      <Pagination className="mt-6" page={page} totalPages={totalPages(count)} hrefFor={(p) => hrefWith(PATH, sp, { page: p })} />
    </>
  );
}
