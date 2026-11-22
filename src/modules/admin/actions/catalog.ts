"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import type { ActionState } from "@/lib/action-state";
import { PARKINGS_TAG } from "@/modules/parkings/queries";
import { runAdminAction } from "../run-action";
import { createPrice, saveOffer, setPriceActive, updateParking } from "../parkings";
import { addContactNote, setCustomerStatus, updateContact } from "../customers";

/* Server Actions of sites, offers, rates, customers and contacts. */

const int = (min: number, max: number, msg: string) => z.coerce.number({ error: msg }).int(msg).min(min, msg).max(max, msg);
const text = (max: number) => z.string().trim().max(max, `${max} caractères au maximum.`);
const required = (max: number, msg: string) => text(max).min(1, msg);
const checkbox = z.string().optional().transform((v) => v === "on");
const euros = z
  .string()
  .trim()
  .refine((v) => /^\d+([.,]\d{1,2})?$/.test(v.replace(/\s/g, "")), "Montant invalide. Exemple : 12,50")
  .transform((v) => Math.round(Number(v.replace(/\s/g, "").replace(",", ".")) * 100));
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide.");

const parkingSchema = z.object({
  slug: z.string().min(1),
  name: required(120, "Indiquez le nom."),
  airportName: required(120, "Indiquez l’aéroport."),
  addressLine: text(255),
  postalCode: text(12),
  city: required(120, "Indiquez la ville."),
  phone: text(32),
  email: z.union([z.literal(""), z.email("Adresse e-mail invalide.")]),
  description: text(2000),
  practicalInfo: text(4000),
  openingHours: text(200),
  minLeadMinutes: int(0, 7 * 24 * 60, "Entre 0 et 10 080 minutes."),
  maxStayDays: int(1, 365, "Entre 1 et 365 jours."),
  bookingHorizonDays: int(1, 730, "Entre 1 et 730 jours."),
  // Stripe Checkout sessions live at least 30 minutes.
  holdTtlMinutes: int(30, 120, "Entre 30 et 120 minutes (30 minimum imposé par le paiement en ligne)."),
  freeCancellationHours: int(0, 720, "Entre 0 et 720 heures."),
  status: z.enum(["DRAFT", "ACTIVE", "SUSPENDED"]),
});

export async function updateParkingAction(_: ActionState, fd: FormData) {
  return runAdminAction("PARKING_MANAGE", parkingSchema, fd, async ({ slug, ...d }, actor) => {
    await updateParking(actor, slug, d);
    updateTag(PARKINGS_TAG); // public pages show the change at once
    return "Site enregistré.";
  });
}

const offerSchema = z.object({
  slug: z.string().min(1),
  offerId: z.string().optional().transform((v) => v || null),
  code: z.string().trim().toLowerCase().regex(/^[a-z0-9-]{2,40}$/, "2 à 40 caractères : lettres minuscules, chiffres, tirets."),
  name: required(120, "Indiquez le nom."),
  tagline: text(160),
  description: text(2000),
  features: z.string().optional().transform((v) => (v ?? "").split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 20)),
  shuttleIncluded: checkbox,
  walkMinutes: z.string().trim().transform((v, ctx) => {
    if (!v) return null;
    const n = Number(v);
    if (!Number.isInteger(n) || n < 0 || n > 120) {
      ctx.addIssue({ code: "custom", message: "Entre 0 et 120 minutes." });
      return z.NEVER;
    }
    return n;
  }),
  capacity: int(0, 100_000, "Nombre entier de places."),
  isActive: checkbox,
  isHighlighted: checkbox,
  sortOrder: int(0, 1000, "Entre 0 et 1000."),
});

export async function saveOfferAction(_: ActionState, fd: FormData) {
  return runAdminAction("PARKING_MANAGE", offerSchema, fd, async ({ slug, offerId, ...d }, actor) => {
    await saveOffer(actor, slug, offerId, d);
    updateTag(PARKINGS_TAG);
    return offerId ? "Formule enregistrée." : "Formule créée.";
  });
}

const priceSchema = z.object({
  offerId: z.uuid(),
  label: text(120),
  validFrom: date,
  validTo: z.union([z.literal(""), date]),
  minDays: int(1, 365, "Entre 1 et 365."),
  maxDays: z.string().trim().transform((v, ctx) => {
    if (!v) return null;
    const n = Number(v);
    if (!Number.isInteger(n) || n < 1 || n > 365) {
      ctx.addIssue({ code: "custom", message: "Entre 1 et 365, ou vide." });
      return z.NEVER;
    }
    return n;
  }),
  mode: z.enum(["FLAT", "PER_DAY"]),
  amount: euros.refine((n) => n > 0 && n <= 10_000_00, "Entre 0,01 et 10 000 €."),
  extraDay: z.string().trim().transform((v) => v || "0").pipe(euros),
  priority: int(0, 100, "Entre 0 et 100."),
});

export async function createPriceAction(_: ActionState, fd: FormData) {
  return runAdminAction("PRICING_MANAGE", priceSchema, fd, async ({ amount, extraDay, ...d }, actor) => {
    await createPrice(actor, { ...d, amountCents: amount, extraDayCents: extraDay });
    updateTag(PARKINGS_TAG);
    return "Tarif ajouté.";
  });
}

export async function togglePriceAction(_: ActionState, fd: FormData) {
  const schema = z.object({ priceId: z.uuid(), active: z.enum(["true", "false"]) });
  return runAdminAction("PRICING_MANAGE", schema, fd, async (d, actor) => {
    await setPriceActive(actor, d.priceId, d.active === "true");
    updateTag(PARKINGS_TAG);
    return d.active === "true" ? "Tarif réactivé." : "Tarif désactivé.";
  });
}

export async function customerStatusAction(_: ActionState, fd: FormData) {
  const schema = z.object({ id: z.uuid(), status: z.enum(["ACTIVE", "DISABLED"]) });
  return runAdminAction("CUSTOMER_MANAGE", schema, fd, async (d, actor) => {
    await setCustomerStatus(actor, d.id, d.status);
    return d.status === "DISABLED" ? "Compte désactivé : le client est déconnecté." : "Compte réactivé.";
  });
}

export async function updateContactAction(_: ActionState, fd: FormData) {
  const schema = z.object({ id: z.uuid(), status: z.enum(["NEW", "IN_PROGRESS", "RESOLVED", "SPAM", "ARCHIVED"]), assignedToId: z.string().transform((v) => v || null) });
  return runAdminAction("CONTACT_MANAGE", schema, fd, async ({ id, ...d }, actor) => {
    await updateContact(actor, id, d);
    return "Demande mise à jour.";
  });
}

export async function addContactNoteAction(_: ActionState, fd: FormData) {
  const schema = z.object({ id: z.uuid(), body: required(5000, "Écrivez la note.") });
  return runAdminAction("CONTACT_MANAGE", schema, fd, async (d, actor) => {
    await addContactNote(actor, d.id, d.body);
    return "Note ajoutée.";
  });
}
