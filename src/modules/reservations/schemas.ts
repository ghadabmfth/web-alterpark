import { z } from "zod";

/*
 * Booking form schemas, shared by the funnel (client) and the reservation service (server, Phase 5).
 * Lengths match Reservation / Vehicle in prisma/schema.prisma. Stay dates are validated by
 * domain/stay.ts (time-zone aware), not here.
 */

/** Upper case, single spaces: "ab-123 cd" → "AB-123 CD". */
export function normalizePlate(v: string): string {
  return v.trim().toUpperCase().replace(/\s+/g, " ");
}

/** "af 1234" → "AF1234" */
export function normalizeFlight(v: string): string {
  return v.trim().toUpperCase().replace(/\s+/g, "");
}

export const MAX_PASSENGERS = 8;

const flight = z
  .string()
  .transform(normalizeFlight)
  .refine((v) => v === "" || /^(?![0-9]{2})[A-Z0-9]{2}\d{1,4}[A-Z]?$/.test(v), "Numéro de vol invalide. Exemple : AF1234");

export const vehicleSchema = z.object({
  plate: z
    .string()
    .transform(normalizePlate)
    .refine((v) => v.length > 0, "Indiquez l’immatriculation de votre véhicule.")
    .refine((v) => v.length === 0 || /^[A-Z0-9][A-Z0-9 -]{0,18}[A-Z0-9]$/.test(v), "Immatriculation invalide. Exemple : AB-123-CD"),
  passengers: z.coerce
    .number({ error: "Indiquez le nombre de passagers." })
    .int("Indiquez un nombre entier.")
    .min(1, "Au moins 1 passager.")
    .max(MAX_PASSENGERS, `${MAX_PASSENGERS} passagers au maximum.`),
  outboundFlight: flight,
  returnFlight: flight,
});

export const customerSchema = z.object({
  firstName: z.string().trim().min(1, "Indiquez votre prénom.").max(100, "100 caractères au maximum."),
  lastName: z.string().trim().min(1, "Indiquez votre nom.").max(100, "100 caractères au maximum."),
  email: z.string().trim().min(1, "Indiquez votre adresse e-mail.").max(190, "190 caractères au maximum.").pipe(z.email("Adresse e-mail invalide. Exemple : nom@domaine.fr")),
  phone: z
    .string()
    .trim()
    .min(1, "Indiquez votre numéro de téléphone.")
    .refine((v) => /^\+?[0-9 .()-]+$/.test(v) && /^(\D*\d){8,15}\D*$/.test(v), "Numéro invalide. Exemple : 06 12 34 56 78 ou +33 6 12 34 56 78"),
  acceptTerms: z.literal(true, { error: "Acceptez les conditions générales de vente pour continuer." }),
});

export const searchSchema = z.object({
  parking: z.string().min(1, "Choisissez un parking."),
  offer: z.string().min(1, "Choisissez une formule."),
  departureDate: z.string(),
  departureTime: z.string(),
  returnDate: z.string(),
  returnTime: z.string(),
});

export const bookingFormSchema = searchSchema.and(vehicleSchema).and(customerSchema);

export type BookingFormInput = z.input<typeof bookingFormSchema>;
export type BookingFormData = z.output<typeof bookingFormSchema>;
