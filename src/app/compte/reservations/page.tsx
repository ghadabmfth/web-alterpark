import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/layout/PageHeader";
import { EmptyState } from "@/components/ui/feedback/EmptyState";
import { Badge } from "@/components/ui/feedback/Badge";
import { Button } from "@/components/ui/actions/Button";
import { DataTable } from "@/components/ui/data/DataTable";
import { formatCents } from "@/components/ui/lib/format";
import { routes } from "@/config/site";
import { requireUser } from "@/server/auth/session";
import { hasDatabase } from "@/server/db/client";
import { listCustomerReservations } from "@/modules/reservations/service";
import { STATUS_LABELS, STATUS_TONES } from "@/modules/reservations/domain/status";
import { formatDateTime } from "@/modules/reservations/domain/stay";

export const metadata: Metadata = { title: "Mes réservations" };

export default async function MyReservations() {
  const user = await requireUser(`${routes.account}/reservations`);
  const rows = hasDatabase() ? await listCustomerReservations(user.id) : [];
  return (
    <>
      <PageHeader
        title="Mes réservations"
        description="Historique et détail de vos réservations, annulations."
        breadcrumbs={[{ label: "Mon compte", href: routes.account }, { label: "Mes réservations" }]}
        actions={<Button href={routes.booking} size="sm">Réserver une place</Button>}
      />
      <DataTable
        caption="Mes réservations"
        rows={rows}
        rowKey={(r) => r.id}
        empty={<EmptyState icon="ticket" title="Aucune réservation" text="Vos réservations apparaîtront ici, avec leur statut et la possibilité de les annuler." />}
        columns={[
          { key: "ref", header: "Référence", nowrap: true, cell: (r) => <Link className="text-primary underline" href={`${routes.account}/reservations/${r.reference}`}>{r.reference}</Link> },
          { key: "parking", header: "Parking", cell: (r) => `${r.parking.name} — ${r.offer.name}` },
          { key: "start", header: "Dépôt", cell: (r) => formatDateTime(r.startsAt.getTime(), r.parking.timeZone) },
          { key: "end", header: "Récupération", cell: (r) => formatDateTime(r.endsAt.getTime(), r.parking.timeZone) },
          { key: "status", header: "Statut", nowrap: true, cell: (r) => <Badge tone={STATUS_TONES[r.status]}>{STATUS_LABELS[r.status]}</Badge> },
          { key: "total", header: "Montant", align: "end", nowrap: true, cell: (r) => formatCents(r.totalCents) },
        ]}
      />
    </>
  );
}
