import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/layout/PageHeader";
import { FilterBar } from "@/components/ui/forms/FilterBar";
import { TextField } from "@/components/ui/forms/TextField";
import { Select } from "@/components/ui/forms/Select";
import { DataTable } from "@/components/ui/data/DataTable";
import { Card } from "@/components/ui/layout/Card";
import { Button } from "@/components/ui/actions/Button";
import { formatCents } from "@/components/ui/lib/format";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { routes } from "@/config/site";
import { db } from "@/server/db/client";
import { adminActor } from "@/modules/admin/page-guard";
import { currentYear, monthlyReport } from "@/modules/admin/insights";
import { param, type SearchParams } from "@/modules/admin/list";

export const metadata: Metadata = { title: "Rapports" };

const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

export default async function AdminReports({ searchParams }: PageProps<"/admin/rapports">) {
  const actor = await adminActor("REPORT_VIEW");
  if (!actor) return <AccessDenied />;
  const sp = (await searchParams) as SearchParams;
  const thisYear = currentYear();
  const y = Number.parseInt(param(sp, "annee"), 10);
  const year = y >= 2020 && y <= thisYear + 1 ? y : thisYear;
  const parking = param(sp, "parking");
  const [rows, parkings] = await Promise.all([monthlyReport(actor, year, parking), db().parking.findMany({ where: { archivedAt: null }, select: { slug: true, name: true }, orderBy: { name: "asc" } })]);
  const total = rows.reduce((t, r) => ({ confirmed: t.confirmed + r.confirmed, billedDays: t.billedDays + r.billedDays, paidCents: t.paidCents + r.paidCents, refundedCents: t.refundedCents + r.refundedCents }), { confirmed: 0, billedDays: 0, paidCents: 0, refundedCents: 0 });
  return (
    <>
      <PageHeader title="Rapports" description="Chiffres mensuels (calendrier de Paris) et exports." breadcrumbs={[{ label: "Back-office", href: routes.admin }, { label: "Rapports" }]} />
      <FilterBar action={`${routes.admin}/rapports`} resetHref={`${routes.admin}/rapports`} label="Année et parking" submitLabel="Afficher">
        <TextField label="Année" name="annee" type="number" defaultValue={String(year)} />
        <Select label="Parking" name="parking" defaultValue={parking} placeholder="Tous" options={parkings.map((p) => ({ value: p.slug, label: p.name }))} />
      </FilterBar>
      <DataTable
        caption={`Activité ${year}`}
        captionHidden={false}
        rows={[...rows.map((r, i) => ({ ...r, label: MONTHS[i]! })), { ...total, month: "total", label: "Total" }]}
        rowKey={(r) => r.month}
        columns={[
          { key: "m", header: "Mois", cell: (r) => (r.month === "total" ? <strong>{r.label}</strong> : r.label) },
          { key: "c", header: "Réservations confirmées", align: "end", cell: (r) => String(r.confirmed) },
          { key: "d", header: "Jours facturés", align: "end", cell: (r) => String(r.billedDays) },
          { key: "p", header: "Encaissé", align: "end", nowrap: true, cell: (r) => formatCents(r.paidCents) },
          { key: "r", header: "Remboursé", align: "end", nowrap: true, cell: (r) => formatCents(r.refundedCents) },
          { key: "n", header: "Net", align: "end", nowrap: true, cell: (r) => formatCents(r.paidCents - r.refundedCents) },
        ]}
      />
      {actor.can("RESERVATION_READ") ? (
        <Card title="Exports" titleAs="h2" className="mt-8">
          <p className="mt-0">Export CSV des réservations (séparateur point-virgule, compatible Excel). Utilisez les filtres de la page Réservations pour restreindre l’export ; chaque export est tracé dans le journal d’audit.</p>
          <Button href={`${routes.admin}/rapports/export${parking ? `?parking=${parking}` : ""}`} size="sm" variant="secondary" download>Exporter toutes les réservations</Button>
        </Card>
      ) : null}
    </>
  );
}
