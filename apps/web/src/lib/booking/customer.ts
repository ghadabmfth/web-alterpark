import { z } from "zod";

/*
 * Coordonnées du client : schéma unique, utilisé par le formulaire (CustomerForm) et, en phase 5,
 * par la Server Action qui crée le blocage (POST apbs/v1/holds). Longueurs alignées sur les
 * colonnes de apbs_customers et apbs_bookings.
 */

/** Plaque : lettres, chiffres, tirets et espaces (formats français et étrangers), normalisée en majuscules. */
export function normalizePlate(v: string): string {
  return v.trim().toUpperCase().replace(/\s+/g, " ");
}

/** Numéro de vol : code compagnie IATA (2 caractères, jamais deux chiffres) + 1 à 4 chiffres + lettre éventuelle. */
export function normalizeFlight(v: string): string {
  return v.trim().toUpperCase().replace(/\s+/g, "");
}

export const MAX_PASSENGERS_DEFAULT = 8;

export function customerSchema(maxPassengers: number = MAX_PASSENGERS_DEFAULT) {
  return z.object({
    firstName: z.string().trim().min(1, "Indiquez votre prénom.").max(100, "100 caractères au maximum."),
    lastName: z.string().trim().min(1, "Indiquez votre nom.").max(100, "100 caractères au maximum."),
    email: z
      .string()
      .trim()
      .min(1, "Indiquez votre adresse e-mail.")
      .max(190, "190 caractères au maximum.")
      .pipe(z.email("Adresse e-mail invalide. Exemple : nom@domaine.fr")),
    phone: z
      .string()
      .trim()
      .min(1, "Indiquez votre numéro de téléphone.")
      .refine((v) => /^\+?[0-9 .()-]+$/.test(v) && /^(\D*\d){8,15}\D*$/.test(v), "Numéro invalide. Exemple : 06 12 34 56 78 ou +33 6 12 34 56 78"),
    plate: z
      .string()
      .transform(normalizePlate)
      .refine((v) => v.length > 0, "Indiquez l’immatriculation de votre véhicule.")
      .refine((v) => v.length === 0 || /^[A-Z0-9][A-Z0-9 -]{0,18}[A-Z0-9]$/.test(v), "Immatriculation invalide. Exemple : AB-123-CD"),
    passengers: z.coerce
      .number({ error: "Indiquez le nombre de passagers." })
      .int("Indiquez un nombre entier.")
      .min(1, "Au moins 1 passager.")
      .max(maxPassengers, `${maxPassengers} passagers au maximum.`),
    flight: z
      .string()
      .transform(normalizeFlight)
      .refine((v) => v === "" || /^(?![0-9]{2})[A-Z0-9]{2}\d{1,4}[A-Z]?$/.test(v), "Numéro de vol invalide. Exemple : AF1234"),
    cgv: z.literal(true, { error: "Acceptez les conditions générales de vente pour continuer." }),
  });
}

export type CustomerDetails = z.output<ReturnType<typeof customerSchema>>;
export type CustomerField = keyof CustomerDetails;

/** Valeurs brutes du formulaire (chaînes et case à cocher). */
export interface CustomerInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  plate: string;
  passengers: string;
  flight: string;
  cgv: boolean;
}

export const EMPTY_CUSTOMER: CustomerInput = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  plate: "",
  passengers: "1",
  flight: "",
  cgv: false,
};

export type CustomerErrors = Partial<Record<CustomerField, string>>;

/** Valide les coordonnées ; renvoie les données normalisées ou une erreur par champ (la première). */
export function validateCustomer(
  input: CustomerInput,
  maxPassengers?: number,
): { ok: true; data: CustomerDetails } | { ok: false; errors: CustomerErrors } {
  const r = customerSchema(maxPassengers).safeParse(input);
  if (r.success) return { ok: true, data: r.data };
  const errors: CustomerErrors = {};
  for (const issue of r.error.issues) {
    const k = issue.path[0] as CustomerField | undefined;
    if (k && !errors[k]) errors[k] = issue.message;
  }
  return { ok: false, errors };
}
