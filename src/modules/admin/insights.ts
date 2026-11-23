import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/server/db/client";
import { utcToZoned } from "@/modules/reservations/domain/stay";
import { ensure, type Actor } from "./guard";
import { dayRange } from "./list";

/*
 * Indicators computed from the database only (no estimates). Revenue = payments that succeeded in
 * the period − refunds that succeeded in the period. Days follow the Paris calendar.
 */

const TZ = "Europe/Paris";
const today = () => utcToZoned(Date.now(), TZ).date;

export interface InsightFilters {
  parking: string;
  from: string;
  to: string;
}

/** Defaults to the current month. */
export function periodOf(f: InsightFilters): { from: string; to: string } {
  const t = today();
  return { from: /^\d{4}-\d{2}-\d{2}$/.test(f.from) ? f.from : `${t.slice(0, 8)}01`, to: /^\d{4}-\d{2}-\d{2}$/.test(f.to) ? f.to : t };
}

export async function dashboard(actor: Actor, f: InsightFilters) {
  ensure(actor, "DASHBOARD_VIEW");
  const period = periodOf(f);
  const range = dayRange(period.from, period.to);
  const day = dayRange(today(), today());
  const now = new Date();
  const site: Prisma.ReservationWhereInput = f.parking ? { parking: { slug: f.parking } } : {};
  const live = { status: { in: ["CONFIRMED", "CHECKED_IN"] as ("CONFIRMED" | "CHECKED_IN")[] } };

  const [arrivals, departures, present, created, confirmed, cancelled, paid, refunded, pendingRequests, newContacts, offers] = await Promise.all([
    db().reservation.count({ where: { ...site, status: "CONFIRMED", startsAt: day } }),
    db().reservation.count({ where: { ...site, status: { in: ["CONFIRMED", "CHECKED_IN"] }, endsAt: day } }),
    db().reservation.count({ where: { ...site, status: "CHECKED_IN" } }),
    db().reservation.count({ where: { ...site, createdAt: range } }),
    db().reservation.findMany({ where: { ...site, confirmedAt: range }, select: { totalCents: true, billedDays: true } }),
    db().reservation.count({ where: { ...site, status: "CANCELLED", cancelledAt: range } }),
    db().payment.aggregate({ where: { status: "SUCCEEDED", succeededAt: range, reservation: site }, _sum: { amountCents: true } }),
    db().refund.aggregate({ where: { status: "SUCCEEDED", updatedAt: range, payment: { reservation: site } }, _sum: { amountCents: true } }),
    db().cancellationRequest.count({ where: { status: "PENDING", reservation: site } }),
    db().contactMessage.count({ where: { status: "NEW", ...(f.parking ? { parking: { slug: f.parking } } : {}) } }),
    db().parkingOffer.findMany({
      where: { isActive: true, archivedAt: null, parking: { status: "ACTIVE", ...(f.parking ? { slug: f.parking } : {}) } },
      include: { parking: { select: { name: true } }, _count: { select: { reservations: { where: { ...live, startsAt: { lte: now }, endsAt: { gt: now } } } } } },
    }),
  ]);
  const revenue = (paid._sum.amountCents ?? 0) - (refunded._sum.amountCents ?? 0);
  return {
    period,
    arrivals,
    departures,
    present,
    created,
    confirmed: confirmed.length,
    cancelled,
    revenue,
    averageCents: confirmed.length ? Math.round(confirmed.reduce((n, r) => n + r.totalCents, 0) / confirmed.length) : 0,
    averageDays: confirmed.length ? Math.round((confirmed.reduce((n, r) => n + r.billedDays, 0) / confirmed.length) * 10) / 10 : 0,
    pendingRequests,
    newContacts,
    occupancy: offers.map((o) => ({ id: o.id, label: `${o.parking.name} — ${o.name}`, used: o._count.reservations, capacity: o.capacity })),
  };
}

/** Current year in Paris (server helper, keeps components pure). */
export function currentYear(): number {
  return Number(today().slice(0, 4));
}

export interface MonthRow {
  month: string;
  confirmed: number;
  billedDays: number;
  paidCents: number;
  refundedCents: number;
}

/** Monthly figures of a year (Paris months), optionally for one site. */
export async function monthlyReport(actor: Actor, year: number, parking: string): Promise<MonthRow[]> {
  ensure(actor, "REPORT_VIEW");
  const from = new Date(Date.UTC(year - 1, 11, 31, 0));
  const to = new Date(Date.UTC(year + 1, 0, 1, 23));
  const slug = parking || null;
  const [bookings, payments, refunds] = await Promise.all([
    db().$queryRaw<{ m: string; n: bigint; days: bigint }[]>`
      SELECT to_char(r."confirmedAt" AT TIME ZONE 'Europe/Paris', 'YYYY-MM') AS m, count(*) AS n, sum(r."billedDays") AS days
      FROM "Reservation" r JOIN "Parking" p ON p.id = r."parkingId"
      WHERE r."confirmedAt" >= ${from} AND r."confirmedAt" < ${to} AND (${slug}::text IS NULL OR p.slug = ${slug})
      GROUP BY 1`,
    db().$queryRaw<{ m: string; cents: bigint }[]>`
      SELECT to_char(pay."succeededAt" AT TIME ZONE 'Europe/Paris', 'YYYY-MM') AS m, sum(pay."amountCents") AS cents
      FROM "Payment" pay JOIN "Reservation" r ON r.id = pay."reservationId" JOIN "Parking" p ON p.id = r."parkingId"
      WHERE pay.status = 'SUCCEEDED' AND pay."succeededAt" >= ${from} AND pay."succeededAt" < ${to} AND (${slug}::text IS NULL OR p.slug = ${slug})
      GROUP BY 1`,
    db().$queryRaw<{ m: string; cents: bigint }[]>`
      SELECT to_char(rf."updatedAt" AT TIME ZONE 'Europe/Paris', 'YYYY-MM') AS m, sum(rf."amountCents") AS cents
      FROM "Refund" rf JOIN "Payment" pay ON pay.id = rf."paymentId" JOIN "Reservation" r ON r.id = pay."reservationId" JOIN "Parking" p ON p.id = r."parkingId"
      WHERE rf.status = 'SUCCEEDED' AND rf."updatedAt" >= ${from} AND rf."updatedAt" < ${to} AND (${slug}::text IS NULL OR p.slug = ${slug})
      GROUP BY 1`,
  ]);
  return Array.from({ length: 12 }, (_, i) => {
    const month = `${year}-${String(i + 1).padStart(2, "0")}`;
    const b = bookings.find((x) => x.m === month);
    return {
      month,
      confirmed: Number(b?.n ?? 0),
      billedDays: Number(b?.days ?? 0),
      paidCents: Number(payments.find((x) => x.m === month)?.cents ?? 0),
      refundedCents: Number(refunds.find((x) => x.m === month)?.cents ?? 0),
    };
  });
}

/* ---------------------------------------------------------------- audit log */

export async function listAudit(actor: Actor, f: { action: string; entity: string; actorEmail: string; from: string; to: string; skip: number; take: number }) {
  ensure(actor, "AUDIT_LOG_READ");
  const where: Prisma.AuditLogWhereInput = {};
  if (f.action) where.action = { startsWith: f.action };
  if (f.entity) where.OR = [{ entityId: f.entity }, { entityType: f.entity }];
  if (f.actorEmail) where.actor = { email: { contains: f.actorEmail.toLowerCase() } };
  const range = dayRange(f.from, f.to);
  if (range.gte || range.lt) where.createdAt = range;
  const [rows, count] = await Promise.all([
    db().auditLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: f.skip, take: f.take, include: { actor: { select: { email: true, firstName: true, lastName: true } } } }),
    db().auditLog.count({ where }),
  ]);
  return { rows, count };
}
