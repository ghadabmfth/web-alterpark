import { db } from "@/server/db/client";
import { utcToZoned } from "@/modules/reservations/domain/stay";
import type { HoldDetails, StayRequest } from "@/modules/reservations/service";

/* Shared fixtures of the reservation and payment integration tests (unique data, no reset). */

const TZ = "Europe/Paris";
const DAY = 86_400_000;
export const rand = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
export const key = () => `k_${rand()}${rand()}`.slice(0, 40);

export async function fixture({ capacity = 1, status = "ACTIVE" }: { capacity?: number; status?: "ACTIVE" | "DRAFT" } = {}) {
  const slug = `test-${rand()}`;
  const parking = await db().parking.create({
    data: {
      slug, name: `Parking ${slug}`, airportCode: "NTE", airportName: "Nantes Atlantique", addressLine: "1 rue du Test", postalCode: "44000", city: "Nantes", status,
      offers: {
        create: {
          code: "eco", name: "Éco", capacity,
          prices: {
            create: [
              { validFrom: new Date("2020-01-01"), mode: "PER_DAY", amountCents: 1000, minDays: 1, maxDays: 7, extraDayCents: 500 },
              { validFrom: new Date("2020-01-01"), mode: "FLAT", amountCents: 2500, minDays: 1, maxDays: 3, priority: 5 },
            ],
          },
        },
      },
    },
  });
  return { parking, slug };
}

export async function customer() {
  const role = await db().role.findUniqueOrThrow({ where: { key: "CUSTOMER" } });
  return db().user.create({ data: { email: `${rand()}@example.com`, firstName: "Léa", lastName: "Test", passwordHash: "x", roleId: role.id } });
}

/** A stay starting `inDays` days from now at 10:00 local time, lasting `days` × 24 h. */
export function stay(slug: string, inDays: number, days: number): StayRequest {
  const start = utcToZoned(Date.now() + inDays * DAY, TZ).date;
  const end = utcToZoned(Date.now() + (inDays + days) * DAY, TZ).date;
  return { parkingSlug: slug, offerCode: "eco", departure: { date: start, time: "10:00" }, ret: { date: end, time: "10:00" } };
}

export const details: HoldDetails = { plate: "AB-123-CD", passengers: 2, outboundFlight: "AF1234", returnFlight: "", firstName: "Léa", lastName: "Test", email: "lea@example.com", phone: "0612345678" };
