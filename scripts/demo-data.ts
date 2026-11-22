/*
 * LOCAL DEMO DATA — never for a shared or production database.
 *
 * Opens the Nantes site to bookings with FICTITIOUS capacities and rates so the booking funnel and
 * the customer area can be exercised locally before the client supplies the real figures. Every
 * rate is labelled « DÉMO ». Refuses to run unless the database host is local and the database
 * name does not look like production. Not part of any build or deployment step.
 *
 *   npm run db:demo                              # activate Nantes with demo capacities and rates
 *   DEMO_CUSTOMER_EMAIL=me@example.com npm run db:demo   # + one confirmed demo reservation
 *   npm run db:demo -- --undo                    # back to DRAFT, demo rates disabled
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not configured");
const { hostname, pathname } = new URL(url);
if (!["localhost", "127.0.0.1", "::1", "[::1]"].includes(hostname) || /prod/i.test(pathname)) {
  console.error(`Refusing to write demo data to ${hostname}${pathname}: local databases only.`);
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
const DEMO_LABEL = "DÉMO — tarif fictif";
const DEMO = { alterpark: { capacity: 40, perDay: 1490, flat3: 3900 }, altereco: { capacity: 60, perDay: 990, flat3: 2700 } } as const;

async function main() {
  const parking = await prisma.parking.findUniqueOrThrow({ where: { slug: "nantes" }, include: { offers: true } });

  if (process.argv.includes("--undo")) {
    await prisma.parking.update({ where: { id: parking.id }, data: { status: "DRAFT" } });
    await prisma.parkingPrice.updateMany({ where: { label: DEMO_LABEL }, data: { isActive: false } });
    await prisma.parkingOffer.updateMany({ where: { parkingId: parking.id }, data: { capacity: 0 } });
    console.log("Nantes is DRAFT again; demo rates disabled.");
    return;
  }

  for (const offer of parking.offers) {
    const demo = DEMO[offer.code as keyof typeof DEMO];
    if (!demo) continue;
    await prisma.parkingOffer.update({ where: { id: offer.id }, data: { capacity: demo.capacity } });
    await prisma.parkingPrice.deleteMany({ where: { offerId: offer.id, label: DEMO_LABEL, reservations: { none: {} } } });
    await prisma.parkingPrice.createMany({
      data: [
        { offerId: offer.id, label: DEMO_LABEL, validFrom: new Date("2026-01-01"), mode: "FLAT", minDays: 1, maxDays: 3, amountCents: demo.flat3, priority: 1 },
        { offerId: offer.id, label: DEMO_LABEL, validFrom: new Date("2026-01-01"), mode: "PER_DAY", minDays: 1, maxDays: null, amountCents: demo.perDay },
      ],
    });
  }
  await prisma.parking.update({ where: { id: parking.id }, data: { status: "ACTIVE" } });
  console.log(`Nantes ACTIVE with demo capacities and rates (${DEMO_LABEL}).`);

  const email = process.env.DEMO_CUSTOMER_EMAIL?.trim().toLowerCase();
  if (email) {
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    const offer = parking.offers.find((o) => o.code === "altereco") ?? parking.offers[0];
    if (!offer) throw new Error("No offer");
    const start = new Date(Date.now() + 10 * 86_400_000);
    start.setUTCHours(8, 0, 0, 0);
    const end = new Date(start.getTime() + 3 * 86_400_000);
    const suffix = Math.random().toString(36).slice(2, 8).toUpperCase().replace(/[01IO]/g, "Z");
    const r = await prisma.reservation.create({
      data: {
        reference: `AP-NTE-${suffix}`, userId: user.id, parkingId: parking.id, offerId: offer.id, status: "CONFIRMED", confirmedAt: new Date(),
        startsAt: start, endsAt: end, billedDays: 3, passengers: 2, customerFirstName: user.firstName, customerLastName: user.lastName,
        customerEmail: user.email, customerPhone: user.phone ?? "0000000000", vehiclePlate: "DEMO-000", totalCents: DEMO.altereco.flat3,
        priceSnapshot: { demo: true, label: DEMO_LABEL }, idempotencyKey: `demo_${Date.now()}_${suffix}`, customerNote: "Réservation de démonstration (données locales).",
      },
    });
    console.log(`Demo reservation ${r.reference} for ${email}.`);
  }
}

main().finally(() => prisma.$disconnect());
