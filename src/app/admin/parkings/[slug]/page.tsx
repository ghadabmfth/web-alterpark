import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/layout/PageHeader";
import { Card } from "@/components/ui/layout/Card";
import { Badge } from "@/components/ui/feedback/Badge";
import { Alert } from "@/components/ui/feedback/Alert";
import { DataTable } from "@/components/ui/data/DataTable";
import { formatCents } from "@/components/ui/lib/format";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { AdminForm, FormCheckbox, FormSelect, FormText } from "@/components/admin/AdminForm";
import { PARKING_STATUS } from "@/components/admin/format";
import { routes } from "@/config/site";
import { adminActor } from "@/modules/admin/page-guard";
import { activationBlockers, getParkingAdmin } from "@/modules/admin/parkings";
import { createPriceAction, saveOfferAction, togglePriceAction, updateParkingAction } from "@/modules/admin/actions/catalog";

export const metadata: Metadata = { title: "Site" };

const day = (d: Date | null) => (d ? d.toISOString().slice(0, 10).split("-").reverse().join("/") : "—");

export default async function AdminParking({ params }: PageProps<"/admin/parkings/[slug]">) {
  const actor = await adminActor("PARKING_READ");
  if (!actor) return <AccessDenied />;
  const { slug } = await params;
  const p = await getParkingAdmin(actor, slug);
  if (!p) notFound();
  const canEdit = actor.can("PARKING_MANAGE");
  const canPrice = actor.can("PRICING_MANAGE");
  const blockers = p.status === "ACTIVE" ? [] : await activationBlockers(p.id, p.addressLine);
  const hours = (p.openingHours as { label?: string } | null)?.label ?? "";

  return (
    <>
      <PageHeader
        title={p.name}
        description={`${p.airportName} (${p.airportCode})`}
        breadcrumbs={[{ label: "Back-office", href: routes.admin }, { label: "Sites et offres", href: `${routes.admin}/parkings` }, { label: p.name }]}
        actions={<Badge tone={PARKING_STATUS[p.status]![1]}>{PARKING_STATUS[p.status]![0]}</Badge>}
      />
      {blockers.length ? (
        <Alert tone="info" title="Avant d’ouvrir ce site à la réservation" className="mb-6">
          <p>{`Il manque : ${blockers.join(", ")}.`}</p>
        </Alert>
      ) : null}

      <Card title="Informations et règles" titleAs="h2" className="mb-6">
        {canEdit ? (
          <AdminForm action={updateParkingAction} hidden={{ slug: p.slug }} submitLabel="Enregistrer le site" label="Informations du site">
            <div className="grid gap-6 md:grid-cols-2">
              <FormText label="Nom" name="name" required defaultValue={p.name} />
              <FormText label="Aéroport desservi" name="airportName" required defaultValue={p.airportName} />
              <FormText label="Adresse" name="addressLine" defaultValue={p.addressLine} />
              <div className="grid grid-cols-2 gap-4">
                <FormText label="Code postal" name="postalCode" defaultValue={p.postalCode} />
                <FormText label="Ville" name="city" required defaultValue={p.city} />
              </div>
              <FormText label="Téléphone" name="phone" type="tel" defaultValue={p.phone ?? ""} />
              <FormText label="E-mail" name="email" type="email" defaultValue={p.email ?? ""} />
              <FormText label="Horaires" name="openingHours" defaultValue={hours} help="Exemple : 24 h/24, 7 j/7" />
              <FormSelect label="Statut" name="status" defaultValue={p.status} options={Object.entries(PARKING_STATUS).map(([value, [label]]) => ({ value, label }))} />
            </div>
            <FormText label="Présentation" name="description" multiline rows={3} defaultValue={p.description ?? ""} />
            <FormText label="Informations pratiques" name="practicalInfo" multiline rows={4} defaultValue={p.practicalInfo ?? ""} help="Une information par ligne." />
            <div className="grid gap-6 md:grid-cols-3">
              <FormText label="Délai minimum avant l’arrivée (min)" name="minLeadMinutes" type="number" defaultValue={String(p.minLeadMinutes)} />
              <FormText label="Durée maximale (jours)" name="maxStayDays" type="number" defaultValue={String(p.maxStayDays)} />
              <FormText label="Réservable jusqu’à (jours)" name="bookingHorizonDays" type="number" defaultValue={String(p.bookingHorizonDays)} />
              <FormText label="Place bloquée pendant le paiement (min)" name="holdTtlMinutes" type="number" defaultValue={String(p.holdTtlMinutes)} />
              <FormText label="Annulation gratuite jusqu’à (h avant)" name="freeCancellationHours" type="number" defaultValue={String(p.freeCancellationHours)} />
            </div>
          </AdminForm>
        ) : (
          <p className="m-0 text-text-secondary">Lecture seule : votre rôle ne permet pas de modifier les sites.</p>
        )}
      </Card>

      {p.offers.map((o) => (
        <Card key={o.id} title={`Formule ${o.name}`} subtitle={`Code ${o.code} · ${o.capacity} places${o.isActive ? "" : " · inactive"}`} titleAs="h2" className="mb-6">
          <div className="flex flex-col gap-8">
            {canEdit ? (
              <AdminForm action={saveOfferAction} hidden={{ slug: p.slug, offerId: o.id, code: o.code }} submitLabel="Enregistrer la formule" label={`Formule ${o.name}`}>
                <div className="grid gap-6 md:grid-cols-3">
                  <FormText label="Nom" name="name" required defaultValue={o.name} />
                  <FormText label="Capacité (places)" name="capacity" type="number" required defaultValue={String(o.capacity)} />
                  <FormText label="Ordre d’affichage" name="sortOrder" type="number" defaultValue={String(o.sortOrder)} />
                  <FormText label="Accroche" name="tagline" defaultValue={o.tagline ?? ""} />
                  <FormText label="Trajet à pied (min)" name="walkMinutes" type="number" defaultValue={o.walkMinutes === null ? "" : String(o.walkMinutes)} />
                </div>
                <FormText label="Description" name="description" multiline rows={2} defaultValue={o.description ?? ""} />
                <FormText label="Avantages" name="features" multiline rows={3} defaultValue={o.features.join("\n")} help="Un avantage par ligne." />
                <div className="flex flex-wrap gap-6">
                  <FormCheckbox name="isActive" label="Active" defaultChecked={o.isActive} />
                  <FormCheckbox name="shuttleIncluded" label="Navette incluse" defaultChecked={o.shuttleIncluded} />
                  <FormCheckbox name="isHighlighted" label="Mise en avant" defaultChecked={o.isHighlighted} />
                </div>
              </AdminForm>
            ) : null}
            <DataTable
              caption={`Tarifs de la formule ${o.name}`}
              captionHidden={false}
              rows={o.prices}
              rowKey={(x) => x.id}
              empty={<p className="m-0 text-text-secondary">Aucun tarif : la formule ne peut pas être réservée.</p>}
              columns={[
                { key: "label", header: "Libellé", cell: (x) => x.label ?? "—" },
                { key: "valid", header: "Arrivées du … au …", nowrap: true, cell: (x) => `${day(x.validFrom)} → ${x.validTo ? day(x.validTo) : "sans fin"}` },
                { key: "days", header: "Durée", nowrap: true, cell: (x) => `${x.minDays} à ${x.maxDays ?? "∞"} j` },
                { key: "price", header: "Prix", nowrap: true, cell: (x) => `${formatCents(x.amountCents)}${x.mode === "PER_DAY" ? " / jour" : " forfait"}${x.extraDayCents ? ` + ${formatCents(x.extraDayCents)} / jour au-delà` : ""}` },
                { key: "prio", header: "Priorité", align: "end", cell: (x) => String(x.priority) },
                {
                  key: "state",
                  header: "État",
                  nowrap: true,
                  cell: (x) =>
                    canPrice ? (
                      <AdminForm action={togglePriceAction} hidden={{ priceId: x.id, active: String(!x.isActive) }} submitLabel={x.isActive ? "Désactiver" : "Réactiver"} variant="secondary" inline label={`${x.isActive ? "Désactiver" : "Réactiver"} le tarif ${x.label ?? "sans libellé"} (${formatCents(x.amountCents)}${x.mode === "PER_DAY" ? " par jour" : " forfait"}, dès le ${day(x.validFrom)})`} />
                    ) : (
                      <Badge tone={x.isActive ? "success" : "neutral"}>{x.isActive ? "Actif" : "Inactif"}</Badge>
                    ),
                },
              ]}
            />
            {canPrice ? (
              <AdminForm action={createPriceAction} hidden={{ offerId: o.id }} submitLabel="Ajouter le tarif" label={`Nouveau tarif ${o.name}`}>
                <h3 className="m-0">Nouveau tarif</h3>
                <div className="grid gap-6 md:grid-cols-3">
                  <FormText label="Libellé" name="label" help="Exemple : Été 2027" />
                  <FormText label="Arrivées à partir du" name="validFrom" type="date" required />
                  <FormText label="jusqu’au (inclus)" name="validTo" type="date" help="Vide : sans fin" />
                  <FormText label="Durée minimale (jours)" name="minDays" type="number" defaultValue="1" required />
                  <FormText label="Durée maximale (jours)" name="maxDays" type="number" help="Vide : illimitée" />
                  <FormSelect label="Calcul" name="mode" defaultValue="PER_DAY" options={[{ value: "PER_DAY", label: "Prix par jour" }, { value: "FLAT", label: "Forfait pour la durée" }]} />
                  <FormText label="Montant (€)" name="amount" inputMode="decimal" required />
                  <FormText label="Jour supplémentaire au-delà du maximum (€)" name="extraDay" inputMode="decimal" help="Vide : pas de prolongation" />
                  <FormText label="Priorité" name="priority" type="number" defaultValue="0" help="Le plus élevé l’emporte" />
                </div>
              </AdminForm>
            ) : null}
          </div>
        </Card>
      ))}

      {canEdit ? (
        <Card title="Nouvelle formule" titleAs="h2">
          <AdminForm action={saveOfferAction} hidden={{ slug: p.slug }} submitLabel="Créer la formule" label="Nouvelle formule">
            <div className="grid gap-6 md:grid-cols-3">
              <FormText label="Code" name="code" required help="Exemple : altereco" />
              <FormText label="Nom" name="name" required />
              <FormText label="Capacité (places)" name="capacity" type="number" required defaultValue="0" />
              <FormText label="Accroche" name="tagline" />
              <FormText label="Trajet à pied (min)" name="walkMinutes" type="number" />
              <FormText label="Ordre d’affichage" name="sortOrder" type="number" defaultValue="0" />
            </div>
            <div className="flex flex-wrap gap-6">
              <FormCheckbox name="isActive" label="Active" defaultChecked />
              <FormCheckbox name="shuttleIncluded" label="Navette incluse" defaultChecked />
            </div>
          </AdminForm>
        </Card>
      ) : null}
    </>
  );
}
