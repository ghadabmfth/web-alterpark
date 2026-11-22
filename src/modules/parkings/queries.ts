import { cacheLife, cacheTag } from "next/cache";
import { db, hasDatabase } from "@/server/db/client";
import { STATIC_PARKINGS } from "./catalog";
import type { ParkingSummary } from "./types";
import { priceStay, type RateRow } from "@/modules/pricing/domain/price";

/*
 * Public read queries of the parkings feature. Cached (`use cache`) and tagged so the back office
 * can invalidate them on save (`updateTag(PARKINGS_TAG)`). Without a database (static build before
 * the database is provisioned), the client-supplied catalogue is served instead.
 */

export const PARKINGS_TAG = "parkings";

type ParkingRow = Awaited<ReturnType<typeof loadRows>>[number];

async function loadRows() {
  return db().parking.findMany({
    where: { archivedAt: null },
    orderBy: { createdAt: "asc" },
    include: { offers: { where: { isActive: true, archivedAt: null }, orderBy: { sortOrder: "asc" }, include: { prices: { where: { isActive: true } } } } },
  });
}

/**
 * « dès » price of an offer: what one day costs for an arrival today, with the same engine as the
 * booking (active rates only). No applicable rate → undefined: a price is never guessed.
 */
function fromCents(prices: ParkingRow["offers"][number]["prices"]): number | undefined {
  if (!prices.length) return undefined;
  const today = new Date().toISOString().slice(0, 10);
  const rows: RateRow[] = prices.map((r) => ({ id: r.id, validFrom: r.validFrom.toISOString().slice(0, 10), validTo: r.validTo ? r.validTo.toISOString().slice(0, 10) : null, minDays: r.minDays, maxDays: r.maxDays, mode: r.mode, amountCents: r.amountCents, extraDayCents: r.extraDayCents, priority: r.priority, currency: r.currency }));
  return priceStay(rows, today, 1)?.totalCents;
}

function toSummary(p: ParkingRow): ParkingSummary {
  const hours = p.openingHours as { label?: string } | null;
  return {
    slug: p.slug,
    name: p.name,
    airportCode: p.airportCode,
    airportName: p.airportName,
    city: p.city,
    region: "",
    timeZone: p.timeZone,
    status: p.status,
    address: p.addressLine ? { line: p.addressLine, postalCode: p.postalCode, city: p.city, country: p.country } : undefined,
    geo: p.latitude && p.longitude ? { latitude: Number(p.latitude), longitude: Number(p.longitude) } : undefined,
    phone: p.phone ?? undefined,
    email: p.email ?? undefined,
    description: p.description ?? "",
    practicalInfo: p.practicalInfo ? p.practicalInfo.split("\n").filter(Boolean) : [],
    openingHours: hours?.label,
    minLeadMinutes: p.minLeadMinutes,
    maxStayDays: p.maxStayDays,
    bookingHorizonDays: p.bookingHorizonDays,
    freeCancellationHours: p.freeCancellationHours,
    offers: p.offers.map((o) => ({
      code: o.code,
      name: o.name,
      shortName: o.code.toUpperCase(),
      tagline: o.tagline ?? "",
      features: o.features,
      shuttleIncluded: o.shuttleIncluded,
      walkMinutes: o.walkMinutes ?? undefined,
      highlighted: o.isHighlighted,
      capacity: o.capacity,
      fromCents: fromCents(o.prices),
    })),
  };
}

export async function listParkings(): Promise<ParkingSummary[]> {
  "use cache";
  cacheTag(PARKINGS_TAG);
  cacheLife("hours");
  if (!hasDatabase()) return [...STATIC_PARKINGS];
  return (await loadRows()).map(toSummary);
}

export async function getParking(slug: string): Promise<ParkingSummary | null> {
  return (await listParkings()).find((p) => p.slug === slug) ?? null;
}

/** Bookable: the site is ACTIVE and at least one active offer has capacity. */
export function isBookable(p: ParkingSummary): boolean {
  return p.status === "ACTIVE" && p.offers.some((o) => (o.capacity ?? 0) > 0);
}
