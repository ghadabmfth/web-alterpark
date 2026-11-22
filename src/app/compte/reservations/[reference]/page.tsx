import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/layout/PageHeader";
import { Card } from "@/components/ui/layout/Card";
import { Badge } from "@/components/ui/feedback/Badge";
import { Alert } from "@/components/ui/feedback/Alert";
import { DescriptionList } from "@/components/ui/data/DescriptionList";
import { formatCents } from "@/components/ui/lib/format";
import { CancelReservation } from "@/components/site/CancelReservation";
import { routes } from "@/config/site";
import { requireUser } from "@/server/auth/session";
import { hasDatabase } from "@/server/db/client";
import { getCustomerReservation } from "@/modules/reservations/service";
import { STATUS_LABELS, STATUS_TONES } from "@/modules/reservations/domain/status";
import { cancellationOption } from "@/modules/reservations/domain/cancellation";
import { formatDateTime } from "@/modules/reservations/domain/stay";
import { REFERENCE_RE } from "@/modules/reservations/domain/reference";

export const metadata: Metadata = { title: "Ma réservation" };

export default async function MyReservation({ params }: PageProps<"/compte/reservations/[reference]">) {
  const { reference } = await params;
  const user = await requireUser(`${routes.account}/reservations/${reference}`);
  if (!REFERENCE_RE.test(reference) || !hasDatabase()) notFound();
  // Scoped by owner in the query: another customer's reference is simply not found.
  const r = await getCustomerReservation(user.id, reference);
  if (!r) notFound();

  const tz = r.parking.timeZone;
  const now = new Date();
  const holdActive = r.status === "PENDING_PAYMENT" && r.holdExpiresAt !== null && r.holdExpiresAt > now;
  const option = cancellationOption(r, r.parking.freeCancellationHours, now);
  const pendingRequest = r.cancellationRequests.find((c) => c.status === "PENDING");
  const lastRequest = r.cancellationRequests[0];
  const deadline = formatDateTime(r.startsAt.getTime() - r.parking.freeCancellationHours * 3_600_000, tz);

  return (
    <>
      <PageHeader
        title={`Réservation ${r.reference}`}
        description={`${r.parking.name} — ${r.offer.name}`}
        breadcrumbs={[{ label: "Mon compte", href: routes.account }, { label: "Mes réservations", href: `${routes.account}/reservations` }, { label: r.reference }]}
        actions={<Badge tone={STATUS_TONES[r.status]}>{STATUS_LABELS[r.status]}</Badge>}
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Détail" titleAs="h2">
          <DescriptionList
            items={[
              { term: "Parking", value: `${r.parking.name} (${r.parking.airportName})` },
              { term: "Formule", value: r.offer.name },
              { term: "Dépôt du véhicule", value: formatDateTime(r.startsAt.getTime(), tz) },
              { term: "Récupération", value: formatDateTime(r.endsAt.getTime(), tz) },
              { term: "Durée facturée", value: `${r.billedDays} ${r.billedDays > 1 ? "jours" : "jour"}` },
              { term: "Véhicule", value: r.vehiclePlate },
              { term: "Passagers", value: String(r.passengers) },
              ...(r.outboundFlight ? [{ term: "Vol aller", value: r.outboundFlight }] : []),
              ...(r.returnFlight ? [{ term: "Vol retour", value: r.returnFlight }] : []),
              { term: "Montant TTC", value: formatCents(r.totalCents) },
              ...(r.refundedCents > 0 ? [{ term: "Remboursé", value: formatCents(r.refundedCents) }] : []),
            ]}
          />
        </Card>
        <Card title="Annulation" titleAs="h2">
          {r.status === "CANCELLED" ? (
            <p className="m-0">{`Réservation annulée${r.cancelledAt ? ` le ${formatDateTime(r.cancelledAt.getTime(), tz)}` : ""}.`}</p>
          ) : holdActive ? (
            <CancelReservation reference={r.reference} mode="abandon" />
          ) : pendingRequest ? (
            <Alert tone="info" title="Demande d’annulation en cours">
              <p>{`Envoyée le ${formatDateTime(pendingRequest.createdAt.getTime(), tz)}. Nous vous répondrons rapidement.`}</p>
            </Alert>
          ) : option === "FREE" ? (
            <CancelReservation reference={r.reference} mode="free" deadline={deadline} />
          ) : option === "REQUEST" ? (
            <>
              {lastRequest?.status === "REJECTED" ? (
                <Alert tone="warning" title="Demande précédente refusée" className="mb-6">
                  <p>{lastRequest.decisionNote ?? "Contactez-nous pour en savoir plus."}</p>
                </Alert>
              ) : null}
              <CancelReservation reference={r.reference} mode="request" />
            </>
          ) : (
            <p className="m-0">Cette réservation ne peut pas être annulée en ligne. Pour toute question, contactez-nous.</p>
          )}
        </Card>
      </div>
    </>
  );
}
