import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/layout/PageHeader";
import { FilterBar } from "@/components/ui/forms/FilterBar";
import { TextField } from "@/components/ui/forms/TextField";
import { Select } from "@/components/ui/forms/Select";
import { StatTile } from "@/components/ui/data/StatTile";
import { DataTable } from "@/components/ui/data/DataTable";
import { Card } from "@/components/ui/layout/Card";
import { formatCents } from "@/components/ui/lib/format";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { routes } from "@/config/site";
import { db } from "@/server/db/client";
import { adminActor } from "@/modules/admin/page-guard";
import { dashboard } from "@/modules/admin/insights";
import { param, type SearchParams } from "@/modules/admin/list";

export const metadata: Metadata = { title: "Tableau de bord" };

const fr = (d: string) => d.split("-").reverse().join("/");

export default async function AdminDashboard({ searchParams }: PageProps<"/admin">) {
  const actor = await adminActor("DASHBOARD_VIEW");
  if (!actor) return <AccessDenied />;
  const sp = (await searchParams) as SearchParams;
  const f = { parking: param(sp, "parking"), from: param(sp, "du"), to: param(sp, "au") };
  const [k, parkings] = await Promise.all([dashboard(actor, f), db().parking.findMany({ where: { archivedAt: null }, select: { slug: true, name: true }, orderBy: { name: "asc" } })]);
  const link = (href: string, text: string) => <Link className="text-primary underline" href={href}>{text}</Link>;
  return (
    <>
      <PageHeader title="Tableau de bord" description="Indicateurs calculés en direct depuis la base de données." breadcrumbs={[{ label: "Back-office" }]} />
      <h2 className="mt-0">Aujourd’hui</h2>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Arrivées prévues" value={String(k.arrivals)} hint="Réservations confirmées" />
        <StatTile label="Départs prévus" value={String(k.departures)} />
        <StatTile label="Véhicules sur site" value={String(k.present)} />
        <StatTile label="À traiter" value={String(k.pendingRequests + k.newContacts)} hint={<>{link(`${routes.admin}/reservations`, `${k.pendingRequests} annulation(s)`)} · {link(`${routes.admin}/contacts`, `${k.newContacts} contact(s)`)}</>} />
      </div>
      <h2>Période</h2>
      <FilterBar action={routes.admin} resetHref={routes.admin} label="Période et parking" submitLabel="Afficher">
        <Select label="Parking" name="parking" defaultValue={f.parking} placeholder="Tous" options={parkings.map((p) => ({ value: p.slug, label: p.name }))} />
        <TextField label="Du" name="du" type="date" defaultValue={k.period.from} />
        <TextField label="au" name="au" type="date" defaultValue={k.period.to} />
      </FilterBar>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatTile label="Chiffre d’affaires encaissé" value={formatCents(k.revenue)} hint={`Paiements moins remboursements, du ${fr(k.period.from)} au ${fr(k.period.to)}`} />
        <StatTile label="Réservations confirmées" value={String(k.confirmed)} hint={`${k.created} créée(s), ${k.cancelled} annulée(s)`} />
        <StatTile label="Panier moyen" value={k.confirmed ? formatCents(k.averageCents) : "—"} hint={k.confirmed ? `${k.averageDays} jour(s) en moyenne` : "Aucune réservation confirmée"} />
      </div>
      <Card title="Occupation actuelle" titleAs="h2">
        <DataTable
          caption="Occupation actuelle par formule"
          rows={k.occupancy}
          rowKey={(o) => o.id}
          empty={<p className="m-0 text-text-secondary">Aucun site ouvert à la réservation.</p>}
          columns={[
            { key: "offer", header: "Formule", cell: (o) => o.label },
            { key: "used", header: "Places occupées ou réservées maintenant", align: "end", cell: (o) => `${o.used} / ${o.capacity}` },
            { key: "rate", header: "Taux", align: "end", cell: (o) => (o.capacity ? `${Math.round((o.used / o.capacity) * 100)} %` : "—") },
          ]}
        />
      </Card>
    </>
  );
}
