import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/layout/PageHeader";
import { Card } from "@/components/ui/layout/Card";
import { Badge } from "@/components/ui/feedback/Badge";
import { Alert } from "@/components/ui/feedback/Alert";
import { DescriptionList } from "@/components/ui/data/DescriptionList";
import { DataTable } from "@/components/ui/data/DataTable";
import { formatCents } from "@/components/ui/lib/format";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { AdminForm, FormText } from "@/components/admin/AdminForm";
import { AUDIT_LABELS, PAYMENT_LABELS, REFUND_LABELS, shortDateTime } from "@/components/admin/format";
import { routes } from "@/config/site";
import { adminActor } from "@/modules/admin/page-guard";
import { getReservation } from "@/modules/admin/reservations";
import { checkInAction, completeAction, refundAction, rejectRequestAction, staffCancelAction } from "@/modules/admin/actions/reservations";
import { refundableCents } from "@/modules/payments/service";
import { STATUS_LABELS, STATUS_TONES, canTransition } from "@/modules/reservations/domain/status";
import { formatDateTime } from "@/modules/reservations/domain/stay";
import { REFERENCE_RE } from "@/modules/reservations/domain/reference";

export const metadata: Metadata = { title: "Réservation" };

const toEuroInput = (cents: number) => (cents / 100).toFixed(2).replace(".", ",");

export default async function AdminReservation({ params }: PageProps<"/admin/reservations/[reference]">) {
  const actor = await adminActor("RESERVATION_READ");
  if (!actor) return <AccessDenied />;
  const { reference } = await params;
  if (!REFERENCE_RE.test(reference)) notFound();
  const r = await getReservation(actor, reference);
  if (!r) notFound();
  const tz = r.parking.timeZone;
  const refundable = await refundableCents(r.id);
  const pending = r.cancellationRequests.find((c) => c.status === "PENDING");
  const cancellable = canTransition(r.status, "CANCELLED");
  const hidden = { id: r.id };

  return (
    <>
      <PageHeader
        title={`Réservation ${r.reference}`}
        description={`${r.parking.name} — ${r.offer.name}`}
        breadcrumbs={[{ label: "Back-office", href: routes.admin }, { label: "Réservations", href: `${routes.admin}/reservations` }, { label: r.reference }]}
        actions={<Badge tone={STATUS_TONES[r.status]}>{STATUS_LABELS[r.status]}</Badge>}
      />
      {pending ? (
        <Alert tone="warning" title="Demande d’annulation en attente" className="mb-6">
          <p>{`Le ${shortDateTime(pending.createdAt)}, ${pending.requestedBy.firstName} ${pending.requestedBy.lastName} : « ${pending.reason} »`}</p>
        </Alert>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Séjour" titleAs="h2">
          <DescriptionList
            items={[
              { term: "Dépôt", value: formatDateTime(r.startsAt.getTime(), tz) },
              { term: "Récupération", value: formatDateTime(r.endsAt.getTime(), tz) },
              { term: "Durée facturée", value: `${r.billedDays} j` },
              { term: "Véhicule", value: r.vehiclePlate },
              { term: "Passagers", value: String(r.passengers) },
              { term: "Vols", value: [r.outboundFlight, r.returnFlight].filter(Boolean).join(" / ") || "—" },
              { term: "Note du client", value: r.customerNote ?? "—" },
              { term: "Créée le", value: shortDateTime(r.createdAt) },
            ]}
          />
        </Card>
        <Card title="Client" titleAs="h2">
          <DescriptionList
            items={[
              { term: "Conducteur", value: `${r.customerFirstName} ${r.customerLastName}` },
              { term: "E-mail", value: r.customerEmail },
              { term: "Téléphone", value: r.customerPhone },
              { term: "Compte", value: `${r.user.firstName} ${r.user.lastName} — ${r.user.email}` },
            ]}
          />
        </Card>
        <Card title="Paiement" titleAs="h2">
          <DescriptionList
            items={[
              { term: "Montant", value: formatCents(r.totalCents) },
              { term: "Remboursé", value: formatCents(r.refundedCents) },
              { term: "Encore remboursable", value: formatCents(refundable) },
            ]}
          />
          <DataTable
            className="mt-6"
            caption="Paiements et remboursements"
            rows={r.payments.flatMap((p) => [
              { key: p.id, date: p.createdAt, what: "Paiement", amount: p.amountCents, badge: PAYMENT_LABELS[p.status], ref: p.providerPaymentId ?? p.providerSessionId ?? "" },
              ...p.refunds.map((x) => ({ key: x.id, date: x.createdAt, what: `Remboursement${x.reason ? ` — ${x.reason}` : ""}`, amount: -x.amountCents, badge: REFUND_LABELS[x.status], ref: x.providerRefundId ?? "" })),
            ])}
            rowKey={(x) => x.key}
            empty={<p className="m-0 text-text-secondary">Aucun paiement.</p>}
            columns={[
              { key: "date", header: "Date", nowrap: true, cell: (x) => shortDateTime(x.date) },
              { key: "what", header: "Opération", cell: (x) => x.what },
              { key: "status", header: "Statut", nowrap: true, cell: (x) => <Badge tone={x.badge[1]}>{x.badge[0]}</Badge> },
              { key: "amount", header: "Montant", align: "end", nowrap: true, cell: (x) => formatCents(x.amount) },
            ]}
          />
        </Card>
        <Card title="Actions" titleAs="h2">
          <div className="flex flex-col gap-8">
            {actor.can("RESERVATION_MANAGE") && r.status === "CONFIRMED" ? (
              <AdminForm action={checkInAction} hidden={hidden} submitLabel="Véhicule déposé" pendingLabel="Enregistrement…" />
            ) : null}
            {actor.can("RESERVATION_MANAGE") && r.status === "CHECKED_IN" ? (
              <AdminForm action={completeAction} hidden={hidden} submitLabel="Véhicule rendu" pendingLabel="Enregistrement…" />
            ) : null}
            {actor.can("RESERVATION_CANCEL") && cancellable ? (
              <AdminForm
                action={staffCancelAction}
                hidden={{ ...hidden, requestId: pending?.id ?? "" }}
                label="Annuler la réservation"
                submitLabel={pending ? "Accepter la demande et annuler" : "Annuler la réservation"}
                variant="secondary"
                confirm={{ title: "Annuler la réservation", body: "La place est libérée et le client prévenu par e-mail. Le remboursement indiqué est envoyé au prestataire de paiement.", confirmLabel: "Annuler la réservation" }}
              >
                <FormText label="Motif" name="reason" required defaultValue={pending?.reason ?? ""} />
                {actor.can("PAYMENT_REFUND") && refundable > 0 ? (
                  <FormText label="Remboursement (€)" name="refund" inputMode="decimal" defaultValue={toEuroInput(refundable)} help={`Jusqu’à ${formatCents(refundable)}. 0 pour ne rien rembourser.`} />
                ) : (
                  <input type="hidden" name="refund" value="" />
                )}
                {pending ? <FormText label="Note au client (facultatif)" name="note" /> : null}
              </AdminForm>
            ) : null}
            {actor.can("RESERVATION_CANCEL") && pending ? (
              <AdminForm action={rejectRequestAction} hidden={{ requestId: pending.id }} label="Refuser la demande d’annulation" submitLabel="Refuser la demande" variant="secondary">
                <FormText label="Réponse au client" name="note" required multiline rows={3} />
              </AdminForm>
            ) : null}
            {actor.can("PAYMENT_REFUND") && refundable > 0 && !cancellable ? (
              <AdminForm
                action={refundAction}
                hidden={hidden}
                label="Rembourser"
                submitLabel="Rembourser"
                variant="secondary"
                confirm={{ title: "Rembourser le client", body: "Le montant indiqué est remboursé sur le moyen de paiement du client. Cette action est définitive.", confirmLabel: "Rembourser" }}
              >
                <FormText label="Montant (€)" name="amount" required inputMode="decimal" help={`Jusqu’à ${formatCents(refundable)}`} />
                <FormText label="Motif" name="reason" required />
              </AdminForm>
            ) : null}
            {!cancellable && refundable === 0 && r.status !== "CONFIRMED" && r.status !== "CHECKED_IN" ? <p className="m-0 text-text-secondary">Aucune action disponible pour ce statut.</p> : null}
          </div>
        </Card>
      </div>
      <Card title="Historique" titleAs="h2" className="mt-6">
        <DataTable
          caption="Historique de la réservation"
          rows={r.timeline}
          rowKey={(e) => e.id}
          empty={<p className="m-0 text-text-secondary">Aucun événement.</p>}
          columns={[
            { key: "date", header: "Date", nowrap: true, cell: (e) => shortDateTime(e.createdAt) },
            { key: "what", header: "Événement", cell: (e) => AUDIT_LABELS[e.action] ?? e.action },
            { key: "who", header: "Par", cell: (e) => (e.actor ? `${e.actor.firstName} ${e.actor.lastName}` : e.actorType === "WEBHOOK" ? "Prestataire de paiement" : "Système") },
          ]}
        />
      </Card>
    </>
  );
}
