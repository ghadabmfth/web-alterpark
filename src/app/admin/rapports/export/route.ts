import { getCurrentUser, can } from "@/server/auth/session";
import { db } from "@/server/db/client";
import { writeAudit } from "@/server/audit";
import { requestFingerprint } from "@/server/security/request";
import { reservationWhere } from "@/modules/admin/reservations";
import { param, toCsv, type SearchParams } from "@/modules/admin/list";
import { STATUS_LABELS } from "@/modules/reservations/domain/status";
import { formatDateTime } from "@/modules/reservations/domain/stay";

/*
 * CSV export of reservations with the filters of the list page. Requires REPORT_VIEW and
 * RESERVATION_READ; capped at 10 000 rows; every export is audit-logged (it contains personal data).
 */
const MAX_ROWS = 10_000;

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || !user.isStaff || !can(user, ["REPORT_VIEW", "RESERVATION_READ"])) return new Response("Not found", { status: 404 });
  const sp = Object.fromEntries(new URL(request.url).searchParams) as SearchParams;
  const filters = { q: param(sp, "q"), parking: param(sp, "parking"), status: param(sp, "statut"), from: param(sp, "du"), to: param(sp, "au") };
  const rows = await db().reservation.findMany({
    where: reservationWhere(filters),
    orderBy: { startsAt: "asc" },
    take: MAX_ROWS,
    include: { parking: { select: { name: true, timeZone: true } }, offer: { select: { name: true } } },
  });
  const csv = toCsv(
    ["Référence", "Statut", "Parking", "Formule", "Dépôt", "Récupération", "Jours facturés", "Prénom", "Nom", "E-mail", "Téléphone", "Immatriculation", "Passagers", "Vol aller", "Vol retour", "Paiement", "Montant (€)", "Remboursé (€)", "Créée le"],
    rows.map((r) => [
      r.reference,
      STATUS_LABELS[r.status],
      r.parking.name,
      r.offer.name,
      formatDateTime(r.startsAt.getTime(), r.parking.timeZone),
      formatDateTime(r.endsAt.getTime(), r.parking.timeZone),
      r.billedDays,
      r.customerFirstName,
      r.customerLastName,
      r.customerEmail,
      r.customerPhone,
      r.vehiclePlate,
      r.passengers,
      r.outboundFlight,
      r.returnFlight,
      r.paymentMethod === "ON_SITE" ? "Sur place" : "En ligne",
      (r.totalCents / 100).toFixed(2).replace(".", ","),
      (r.refundedCents / 100).toFixed(2).replace(".", ","),
      formatDateTime(r.createdAt.getTime(), "Europe/Paris"),
    ]),
  );
  await writeAudit({ actorType: "USER", actorId: user.id, action: "report.export.reservations", entityType: "Report", metadata: { filters, rows: rows.length }, ...(await requestFingerprint()) });
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="reservations-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
