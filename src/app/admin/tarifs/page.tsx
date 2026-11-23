import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/layout/PageHeader";
import { DataTable } from "@/components/ui/data/DataTable";
import { Badge } from "@/components/ui/feedback/Badge";
import { Card } from "@/components/ui/layout/Card";
import { formatCents } from "@/components/ui/lib/format";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { routes } from "@/config/site";
import { db } from "@/server/db/client";
import { adminActor } from "@/modules/admin/page-guard";
import { param, type SearchParams } from "@/modules/admin/list";
import { simulatePrice } from "@/modules/admin/parkings";
import { FilterBar } from "@/components/ui/forms/FilterBar";
import { Select } from "@/components/ui/forms/Select";
import { TextField } from "@/components/ui/forms/TextField";

export const metadata: Metadata = { title: "Tarifs" };

const day = (d: Date | null) => (d ? d.toISOString().slice(0, 10).split("-").reverse().join("/") : "sans fin");

/* Overview of every rate, and a simulator using the booking engine. Rates are added on each site's page. */
export default async function AdminPricing({ searchParams }: PageProps<"/admin/tarifs">) {
  const actor = await adminActor("PARKING_READ");
  if (!actor) return <AccessDenied />;
  const sp = (await searchParams) as SearchParams;
  const offers = await db().parkingOffer.findMany({
    where: { archivedAt: null, parking: { archivedAt: null } },
    orderBy: [{ parking: { name: "asc" } }, { sortOrder: "asc" }],
    include: { parking: { select: { name: true, slug: true } }, prices: { where: { isActive: true }, orderBy: [{ priority: "desc" }, { validFrom: "desc" }] } },
  });
  const sim = { offer: param(sp, "formule"), date: param(sp, "arrivee"), days: Number.parseInt(param(sp, "jours"), 10) };
  const result = sim.offer && /^\d{4}-\d{2}-\d{2}$/.test(sim.date) && sim.days > 0 && sim.days <= 365 ? await simulatePrice(actor, sim.offer, sim.date, sim.days) : undefined;

  return (
    <>
      <PageHeader title="Tarifs" description="Tarifs actifs par formule. Ajout et désactivation depuis la fiche de chaque site." breadcrumbs={[{ label: "Back-office", href: routes.admin }, { label: "Tarifs" }]} />
      <Card title="Simulateur de prix" titleAs="h2" className="mb-6">
        <FilterBar action={`${routes.admin}/tarifs`} submitLabel="Calculer" label="Simuler un prix">
          <Select label="Formule" name="formule" defaultValue={sim.offer} placeholder="Choisir" options={offers.map((o) => ({ value: o.id, label: `${o.parking.name} — ${o.name}` }))} />
          <TextField label="Date d’arrivée" name="arrivee" type="date" defaultValue={sim.date} />
          <TextField label="Jours facturés" name="jours" type="number" defaultValue={Number.isFinite(sim.days) ? String(sim.days) : ""} />
        </FilterBar>
        {result === null ? <p className="m-0" role="status">Aucun tarif ne s’applique : le séjour ne peut pas être réservé en ligne.</p> : null}
        {result ? <p className="m-0" role="status">{`Prix : ${formatCents(result.totalCents)} (tarif « ${result.label ?? "sans libellé"} »${result.breakdown.extraDays ? `, dont ${result.breakdown.extraDays} jour(s) supplémentaire(s)` : ""}).`}</p> : null}
      </Card>
      {offers.map((o) => (
        <Card key={o.id} title={`${o.parking.name} — ${o.name}`} titleAs="h2" className="mb-6" actions={<Link className="text-primary underline" href={`${routes.admin}/parkings/${o.parking.slug}`}>Gérer</Link>}>
          <DataTable
            caption={`Tarifs actifs ${o.parking.name} ${o.name}`}
            rows={o.prices}
            rowKey={(x) => x.id}
            empty={<p className="m-0 text-text-secondary">Aucun tarif actif.</p>}
            columns={[
              { key: "label", header: "Libellé", cell: (x) => x.label ?? "—" },
              { key: "valid", header: "Arrivées", nowrap: true, cell: (x) => `${day(x.validFrom)} → ${day(x.validTo)}` },
              { key: "days", header: "Durée", nowrap: true, cell: (x) => `${x.minDays} à ${x.maxDays ?? "∞"} j` },
              { key: "price", header: "Prix", cell: (x) => `${formatCents(x.amountCents)}${x.mode === "PER_DAY" ? " / jour" : " forfait"}${x.extraDayCents ? ` + ${formatCents(x.extraDayCents)} / jour au-delà` : ""}` },
              { key: "prio", header: "Priorité", align: "end", cell: (x) => <Badge>{String(x.priority)}</Badge> },
            ]}
          />
        </Card>
      ))}
    </>
  );
}
