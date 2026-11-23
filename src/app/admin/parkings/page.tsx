import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/layout/PageHeader";
import { DataTable } from "@/components/ui/data/DataTable";
import { Badge } from "@/components/ui/feedback/Badge";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { PARKING_STATUS } from "@/components/admin/format";
import { routes } from "@/config/site";
import { adminActor } from "@/modules/admin/page-guard";
import { listParkingsAdmin } from "@/modules/admin/parkings";

export const metadata: Metadata = { title: "Sites et offres" };

export default async function AdminParkings() {
  const actor = await adminActor("PARKING_READ");
  if (!actor) return <AccessDenied />;
  const parkings = await listParkingsAdmin(actor);
  return (
    <>
      <PageHeader title="Sites et offres" description="Parkings, règles de réservation, formules, capacités et tarifs." breadcrumbs={[{ label: "Back-office", href: routes.admin }, { label: "Sites et offres" }]} />
      <DataTable
        caption="Parkings"
        rows={parkings}
        rowKey={(p) => p.id}
        columns={[
          { key: "name", header: "Parking", cell: (p) => <Link className="text-primary underline" href={`${routes.admin}/parkings/${p.slug}`}>{p.name}</Link> },
          { key: "airport", header: "Aéroport", cell: (p) => `${p.airportName} (${p.airportCode})` },
          { key: "offers", header: "Formules", cell: (p) => (p.offers.length ? p.offers.map((o) => `${o.name} : ${o.capacity} pl.${o.isActive ? "" : " (inactive)"}${o._count.prices ? "" : " — sans tarif"}`).join(" · ") : "Aucune") },
          { key: "status", header: "Statut", nowrap: true, cell: (p) => <Badge tone={PARKING_STATUS[p.status]![1]}>{PARKING_STATUS[p.status]![0]}</Badge> },
        ]}
      />
    </>
  );
}
