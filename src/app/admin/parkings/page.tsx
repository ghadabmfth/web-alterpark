import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/layout/PageHeader";
import { DataTable } from "@/components/ui/data/DataTable";
import { Badge } from "@/components/ui/feedback/Badge";
import { Alert } from "@/components/ui/feedback/Alert";
import { routes } from "@/config/site";
import { isBookable, listParkings } from "@/modules/parkings/queries";
import type { ParkingSummary } from "@/modules/parkings/types";

export const metadata: Metadata = { title: "Sites et offres" };

/* Read-only view of the parking catalogue (static until Phase 4; editing in Phase 7). */
export default async function AdminParkingsPage() {
  const parkings = await listParkings();
  return (
    <>
      <PageHeader
        title="Sites et offres"
        description="Parkings, aéroports desservis et formules proposées."
        breadcrumbs={[{ label: "Back-office", href: routes.admin }, { label: "Sites et offres" }]}
      />
      <Alert tone="info" title="Lecture seule" className="mb-6">
        <p>Catalogue fourni par le client, affiché tel quel. La saisie des capacités, adresses et tarifs se fera ici en phase 7.</p>
      </Alert>
      <DataTable<ParkingSummary>
        caption="Parkings"
        rows={parkings}
        rowKey={(p) => p.slug}
        columns={[
          { key: "name", header: "Parking", cell: (p) => <a href={routes.parking(p.slug)}>{p.name}</a> },
          { key: "airport", header: "Aéroport", cell: (p) => `${p.airportName} (${p.airportCode})` },
          { key: "offers", header: "Formules", cell: (p) => (p.offers.length ? p.offers.map((o) => o.shortName).join(", ") : "À définir") },
          { key: "lead", header: "Délai minimum", cell: (p) => `${p.minLeadMinutes / 60} h`, align: "end" },
          { key: "status", header: "Statut", cell: (p) => (isBookable(p) ? <Badge tone="success">Ouvert à la réservation</Badge> : <Badge tone="info">Brouillon</Badge>) },
        ]}
      />
    </>
  );
}
