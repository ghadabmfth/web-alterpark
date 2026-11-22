import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/server/db/client";
import { writeAudit } from "@/server/audit";
import { peakOccupancy } from "@/modules/availability/domain/occupancy";
import { priceStay, type RateRow } from "@/modules/pricing/domain/price";
import { AdminRefusal, ensure, type Actor } from "./guard";

/*
 * Sites, offers and rates. A site can be opened (ACTIVE) only when it is complete: address, at least
 * one active offer with capacity and an active rate. Capacity cannot drop below the bookings already
 * taken. Rates are never edited in place: they are added and deactivated, so every price ever charged
 * stays explainable (reservations also keep a snapshot).
 */

export async function listParkingsAdmin(actor: Actor) {
  ensure(actor, "PARKING_READ");
  return db().parking.findMany({
    where: { archivedAt: null },
    orderBy: { createdAt: "asc" },
    include: { offers: { where: { archivedAt: null }, orderBy: { sortOrder: "asc" }, include: { _count: { select: { prices: { where: { isActive: true } } } } } } },
  });
}

export async function getParkingAdmin(actor: Actor, slug: string) {
  ensure(actor, "PARKING_READ");
  return db().parking.findUnique({
    where: { slug },
    include: { offers: { where: { archivedAt: null }, orderBy: { sortOrder: "asc" }, include: { prices: { orderBy: [{ isActive: "desc" }, { priority: "desc" }, { validFrom: "desc" }] } } } },
  });
}

export interface ParkingInput {
  name: string;
  airportName: string;
  addressLine: string;
  postalCode: string;
  city: string;
  phone: string;
  email: string;
  description: string;
  practicalInfo: string;
  openingHours: string;
  minLeadMinutes: number;
  maxStayDays: number;
  bookingHorizonDays: number;
  holdTtlMinutes: number;
  freeCancellationHours: number;
  status: "DRAFT" | "ACTIVE" | "SUSPENDED";
}

/** What prevents a site from being opened, in plain words (empty = ready). */
export async function activationBlockers(parkingId: string, addressLine: string): Promise<string[]> {
  const offers = await db().parkingOffer.findMany({ where: { parkingId, isActive: true, archivedAt: null, capacity: { gt: 0 } }, include: { _count: { select: { prices: { where: { isActive: true } } } } } });
  const out: string[] = [];
  if (!addressLine.trim()) out.push("l’adresse du site");
  if (!offers.length) out.push("au moins une formule active avec une capacité");
  else if (!offers.some((o) => o._count.prices > 0)) out.push("au moins un tarif actif sur une formule ouverte");
  return out;
}

export async function updateParking(actor: Actor, slug: string, input: ParkingInput) {
  ensure(actor, "PARKING_MANAGE");
  const before = await db().parking.findUnique({ where: { slug } });
  if (!before) throw new AdminRefusal("Parking introuvable.");
  if (input.status === "ACTIVE") {
    const missing = await activationBlockers(before.id, input.addressLine);
    if (missing.length) throw new AdminRefusal(`Impossible d’ouvrir le site à la réservation : il manque ${missing.join(", ")}.`, "status");
  }
  const data = {
    name: input.name,
    airportName: input.airportName,
    addressLine: input.addressLine,
    postalCode: input.postalCode,
    city: input.city,
    phone: input.phone || null,
    email: input.email || null,
    description: input.description || null,
    practicalInfo: input.practicalInfo || null,
    openingHours: input.openingHours ? { label: input.openingHours } : undefined,
    minLeadMinutes: input.minLeadMinutes,
    maxStayDays: input.maxStayDays,
    bookingHorizonDays: input.bookingHorizonDays,
    holdTtlMinutes: input.holdTtlMinutes,
    freeCancellationHours: input.freeCancellationHours,
    status: input.status,
  } satisfies Prisma.ParkingUpdateInput;
  await db().$transaction(async (tx) => {
    await tx.parking.update({ where: { id: before.id }, data });
    const changed = Object.fromEntries(Object.entries(data).filter(([k, v]) => JSON.stringify(v ?? null) !== JSON.stringify((before as Record<string, unknown>)[k] ?? null)));
    await writeAudit({ actorType: "USER", actorId: actor.id, action: before.status !== input.status ? `parking.status.${input.status.toLowerCase()}` : "parking.update", entityType: "Parking", entityId: before.id, metadata: { changed: Object.keys(changed), status: { from: before.status, to: input.status } } }, tx);
  });
}

export interface OfferInput {
  code: string;
  name: string;
  tagline: string;
  description: string;
  features: string[];
  shuttleIncluded: boolean;
  walkMinutes: number | null;
  capacity: number;
  isActive: boolean;
  isHighlighted: boolean;
  sortOrder: number;
}

/** Highest number of vehicles already booked at the same time from now on. */
export async function bookedPeak(offerId: string, now = new Date()): Promise<number> {
  const rows = await db().reservation.findMany({
    where: { offerId, endsAt: { gt: now }, OR: [{ status: { in: ["CONFIRMED", "CHECKED_IN"] } }, { status: "PENDING_PAYMENT", holdExpiresAt: { gt: now } }] },
    select: { startsAt: true, endsAt: true },
  });
  if (!rows.length) return 0;
  const intervals = rows.map((r) => ({ start: r.startsAt.getTime(), end: r.endsAt.getTime() }));
  return peakOccupancy(intervals, now.getTime(), Math.max(...intervals.map((i) => i.end)));
}

export async function saveOffer(actor: Actor, parkingSlug: string, offerId: string | null, input: OfferInput) {
  ensure(actor, "PARKING_MANAGE");
  const parking = await db().parking.findUnique({ where: { slug: parkingSlug } });
  if (!parking) throw new AdminRefusal("Parking introuvable.");
  const data = {
    name: input.name,
    tagline: input.tagline || null,
    description: input.description || null,
    features: input.features,
    shuttleIncluded: input.shuttleIncluded,
    walkMinutes: input.walkMinutes,
    capacity: input.capacity,
    isActive: input.isActive,
    isHighlighted: input.isHighlighted,
    sortOrder: input.sortOrder,
  };
  await db().$transaction(async (tx) => {
    if (offerId) {
      // Serialised with bookings (same lock as createHold): capacity checked against what is booked.
      await tx.$queryRaw`SELECT "id" FROM "ParkingOffer" WHERE "id" = ${offerId}::uuid FOR UPDATE`;
      const before = await tx.parkingOffer.findFirst({ where: { id: offerId, parkingId: parking.id } });
      if (!before) throw new AdminRefusal("Formule introuvable.");
      if (input.capacity < before.capacity) {
        const peak = await bookedPeak(offerId);
        if (input.capacity < peak) throw new AdminRefusal(`${peak} véhicules sont déjà réservés en même temps sur cette formule : la capacité ne peut pas descendre en dessous.`, "capacity");
      }
      await tx.parkingOffer.update({ where: { id: offerId }, data });
      await writeAudit({ actorType: "USER", actorId: actor.id, action: "offer.update", entityType: "ParkingOffer", entityId: offerId, metadata: { capacity: { from: before.capacity, to: input.capacity }, isActive: input.isActive } }, tx);
    } else {
      const exists = await tx.parkingOffer.findUnique({ where: { parkingId_code: { parkingId: parking.id, code: input.code } } });
      if (exists) throw new AdminRefusal("Ce code de formule existe déjà sur ce site.", "code");
      const o = await tx.parkingOffer.create({ data: { ...data, code: input.code, parkingId: parking.id } });
      await writeAudit({ actorType: "USER", actorId: actor.id, action: "offer.create", entityType: "ParkingOffer", entityId: o.id, metadata: { parking: parking.slug, code: input.code, capacity: input.capacity } }, tx);
    }
  });
}

export interface PriceInput {
  offerId: string;
  label: string;
  validFrom: string;
  validTo: string;
  minDays: number;
  maxDays: number | null;
  mode: "FLAT" | "PER_DAY";
  amountCents: number;
  extraDayCents: number;
  priority: number;
}

export async function createPrice(actor: Actor, input: PriceInput) {
  ensure(actor, "PRICING_MANAGE");
  if (input.validTo && input.validTo < input.validFrom) throw new AdminRefusal("La fin de validité précède le début.", "validTo");
  if (input.maxDays !== null && input.maxDays < input.minDays) throw new AdminRefusal("La durée maximale est inférieure à la durée minimale.", "maxDays");
  const offer = await db().parkingOffer.findUnique({ where: { id: input.offerId } });
  if (!offer) throw new AdminRefusal("Formule introuvable.");
  await db().$transaction(async (tx) => {
    const p = await tx.parkingPrice.create({
      data: {
        offerId: input.offerId,
        label: input.label || null,
        validFrom: new Date(`${input.validFrom}T00:00:00Z`),
        validTo: input.validTo ? new Date(`${input.validTo}T00:00:00Z`) : null,
        minDays: input.minDays,
        maxDays: input.maxDays,
        mode: input.mode,
        amountCents: input.amountCents,
        extraDayCents: input.extraDayCents,
        priority: input.priority,
      },
    });
    await writeAudit({ actorType: "USER", actorId: actor.id, action: "price.create", entityType: "ParkingPrice", entityId: p.id, metadata: { ...input } as unknown as Prisma.InputJsonValue }, tx);
  });
}

export async function setPriceActive(actor: Actor, priceId: string, isActive: boolean) {
  ensure(actor, "PRICING_MANAGE");
  await db().$transaction(async (tx) => {
    const { count } = await tx.parkingPrice.updateMany({ where: { id: priceId, isActive: !isActive }, data: { isActive } });
    if (!count) throw new AdminRefusal("Ce tarif a déjà été modifié. Rechargez la page.");
    // A site must not stay open without any rate.
    const price = await tx.parkingPrice.findUniqueOrThrow({ where: { id: priceId }, include: { offer: { include: { parking: true } } } });
    if (!isActive && price.offer.parking.status === "ACTIVE") {
      const left = await tx.parkingPrice.count({ where: { isActive: true, offer: { parkingId: price.offer.parkingId, isActive: true, capacity: { gt: 0 } } } });
      if (!left) throw new AdminRefusal("C’est le dernier tarif actif d’un site ouvert : fermez d’abord le site ou ajoutez un autre tarif.");
    }
    await writeAudit({ actorType: "USER", actorId: actor.id, action: isActive ? "price.activate" : "price.deactivate", entityType: "ParkingPrice", entityId: priceId }, tx);
  });
}

/** Price simulation for staff (same engine as the funnel). */
export async function simulatePrice(actor: Actor, offerId: string, arrivalDate: string, days: number) {
  ensure(actor, "PARKING_READ");
  const prices = await db().parkingPrice.findMany({ where: { offerId, isActive: true } });
  const rows: RateRow[] = prices.map((p) => ({ id: p.id, validFrom: p.validFrom.toISOString().slice(0, 10), validTo: p.validTo ? p.validTo.toISOString().slice(0, 10) : null, minDays: p.minDays, maxDays: p.maxDays, mode: p.mode, amountCents: p.amountCents, extraDayCents: p.extraDayCents, priority: p.priority, currency: p.currency }));
  const res = priceStay(rows, arrivalDate, days);
  return res ? { ...res, label: prices.find((p) => p.id === res.rateId)?.label ?? null } : null;
}
