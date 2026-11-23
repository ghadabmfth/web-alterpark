import { describe, expect, it } from "vitest";
import { db } from "@/server/db/client";
import { customer, details, fixture, key, rand, stay } from "@/test/booking-fixtures";
import { createHold } from "@/modules/reservations/service";
import { registerCustomer, verifyCredentials } from "@/modules/auth/service";
import { ALL_PERMISSIONS } from "@/modules/auth/permissions";
import type { Permission } from "@/generated/prisma/enums";
import { AdminRefusal, Forbidden, type Actor } from "./guard";
import { activationBlockers, createPrice, saveOffer, setPriceActive, simulatePrice, updateParking, type ParkingInput } from "./parkings";
import { addContactNote, listContacts, setCustomerStatus, updateContact } from "./customers";

async function staff(permissions: readonly Permission[] = ALL_PERMISSIONS): Promise<Actor> {
  const role = await db().role.findUniqueOrThrow({ where: { key: "ADMIN" } });
  const u = await db().user.create({ data: { email: `${rand()}@staff.test`, firstName: "Ada", lastName: "Admin", passwordHash: "x", roleId: role.id } });
  return { id: u.id, isStaff: true, permissions: [...permissions], roleKey: "ADMIN", firstName: "Ada", lastName: "Admin" };
}

const parkingInput = (o: Partial<ParkingInput> = {}): ParkingInput => ({
  name: "P", airportName: "A", addressLine: "1 rue", postalCode: "44000", city: "Nantes", phone: "", email: "", description: "", practicalInfo: "", openingHours: "",
  minLeadMinutes: 120, maxStayDays: 60, bookingHorizonDays: 365, holdTtlMinutes: 30, freeCancellationHours: 24, status: "DRAFT", ...o,
});

describe("sites", () => {
  it("cannot be opened while incomplete; opening and edits are audited", async () => {
    const admin = await staff();
    const draft = await db().parking.create({ data: { slug: `s-${rand()}`, name: "P", airportCode: "NTE", airportName: "A", addressLine: "", postalCode: "", city: "Nantes" } });
    expect(await activationBlockers(draft.id, "")).toHaveLength(2);
    await expect(updateParking(admin, draft.slug, parkingInput({ addressLine: "", status: "ACTIVE" }))).rejects.toThrow(/il manque l’adresse du site, au moins une formule/);

    const { parking } = await fixture({ status: "DRAFT" });
    await updateParking(admin, parking.slug, parkingInput({ status: "ACTIVE", minLeadMinutes: 60 }));
    expect(await db().parking.findUniqueOrThrow({ where: { id: parking.id } })).toMatchObject({ status: "ACTIVE", minLeadMinutes: 60 });
    expect(await db().auditLog.count({ where: { entityId: parking.id, action: "parking.status.active", actorId: admin.id } })).toBe(1);
    await expect(updateParking(await staff(["PARKING_READ"]), parking.slug, parkingInput())).rejects.toBeInstanceOf(Forbidden);
  });
});

describe("offers", () => {
  it("capacity cannot go below the vehicles already booked at the same time", async () => {
    const admin = await staff();
    const { parking, slug } = await fixture({ capacity: 3 });
    const offer = await db().parkingOffer.findFirstOrThrow({ where: { parkingId: parking.id } });
    for (let i = 0; i < 2; i++) {
      const u = await customer();
      expect((await createHold({ userId: u.id, request: stay(slug, 10, 2), details, idempotencyKey: key() })).ok).toBe(true);
    }
    const input = { code: offer.code, name: offer.name, tagline: "", description: "", features: [], shuttleIncluded: true, walkMinutes: null, isActive: true, isHighlighted: false, sortOrder: 0 };
    await expect(saveOffer(admin, slug, offer.id, { ...input, capacity: 1 })).rejects.toThrow(/2 véhicules sont déjà réservés/);
    await saveOffer(admin, slug, offer.id, { ...input, capacity: 2 });
    expect((await db().parkingOffer.findUniqueOrThrow({ where: { id: offer.id } })).capacity).toBe(2);
    await expect(saveOffer(admin, slug, null, { ...input, capacity: 5 })).rejects.toThrow(/existe déjà/);
    await saveOffer(admin, slug, null, { ...input, code: "premium", name: "Premium", capacity: 5 });
    expect(await db().parkingOffer.count({ where: { parkingId: parking.id } })).toBe(2);
  });
});

describe("rates", () => {
  it("are added and deactivated, never edited; the last rate of an open site stays", async () => {
    const admin = await staff();
    const { parking } = await fixture(); // ACTIVE with two rates
    const offer = await db().parkingOffer.findFirstOrThrow({ where: { parkingId: parking.id } });
    await expect(createPrice(admin, { offerId: offer.id, label: "x", validFrom: "2027-02-01", validTo: "2027-01-01", minDays: 1, maxDays: null, mode: "PER_DAY", amountCents: 100, extraDayCents: 0, priority: 0 })).rejects.toBeInstanceOf(AdminRefusal);
    await createPrice(admin, { offerId: offer.id, label: "Été", validFrom: "2027-07-01", validTo: "2027-08-31", minDays: 1, maxDays: null, mode: "PER_DAY", amountCents: 1800, extraDayCents: 0, priority: 10 });
    expect(await simulatePrice(admin, offer.id, "2027-07-14", 3)).toMatchObject({ totalCents: 5400, label: "Été" });
    expect(await simulatePrice(admin, offer.id, "2027-09-14", 3)).toMatchObject({ totalCents: 2500 });

    const rates = await db().parkingPrice.findMany({ where: { offerId: offer.id } });
    for (const r of rates.slice(0, -1)) await setPriceActive(admin, r.id, false);
    await expect(setPriceActive(admin, rates.at(-1)!.id, false)).rejects.toThrow(/dernier tarif actif/);
    await expect(setPriceActive(await staff(["PARKING_READ", "PARKING_MANAGE"]), rates[0]!.id, true)).rejects.toBeInstanceOf(Forbidden);
  });
});

describe("customers and contacts", () => {
  it("disabling a customer revokes their sessions and logins; staff accounts are out of reach", async () => {
    const admin = await staff();
    const email = `${rand()}@example.com`;
    const reg = await registerCustomer({ firstName: "Léa", lastName: "Client", email, phone: "", password: "correct horse battery staple" });
    if (!reg.ok) throw new Error();
    const u = await db().user.findUniqueOrThrow({ where: { email } });
    expect(await verifyCredentials(email, "correct horse battery staple")).not.toBeNull();
    await setCustomerStatus(admin, u.id, "DISABLED");
    const after = await db().user.findUniqueOrThrow({ where: { id: u.id } });
    expect(after).toMatchObject({ status: "DISABLED", sessionVersion: u.sessionVersion + 1 });
    expect(await verifyCredentials(email, "correct horse battery staple")).toBeNull();
    await expect(setCustomerStatus(admin, u.id, "DISABLED")).rejects.toBeInstanceOf(AdminRefusal);
    await expect(setCustomerStatus(admin, admin.id, "DISABLED")).rejects.toBeInstanceOf(AdminRefusal); // a staff account
  });

  it("contacts: a note takes the request in charge; status and assignment are audited", async () => {
    const admin = await staff();
    const m = await db().contactMessage.create({ data: { name: "Paul", email: `${rand()}@example.com`, subject: "OTHER", message: "Bonjour" } });
    await addContactNote(admin, m.id, "Rappelé, attend un devis.");
    expect(await db().contactMessage.findUniqueOrThrow({ where: { id: m.id } })).toMatchObject({ status: "IN_PROGRESS", assignedToId: admin.id });
    const mine = await listContacts(admin, { q: "", status: "", subject: "", mine: true, skip: 0, take: 50 });
    expect(mine.rows.map((r) => r.id)).toContain(m.id);
    const customerUser = await customer();
    await expect(updateContact(admin, m.id, { status: "RESOLVED", assignedToId: customerUser.id })).rejects.toBeInstanceOf(AdminRefusal);
    await updateContact(admin, m.id, { status: "RESOLVED", assignedToId: admin.id });
    expect((await db().contactMessage.findUniqueOrThrow({ where: { id: m.id } })).resolvedAt).not.toBeNull();
    expect(await db().auditLog.count({ where: { entityId: m.id } })).toBe(2);
    await expect(addContactNote(await staff(["CONTACT_READ"]), m.id, "x")).rejects.toBeInstanceOf(Forbidden);
  });
});
