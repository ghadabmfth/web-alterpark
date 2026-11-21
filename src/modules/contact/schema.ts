import { z } from "zod";

/*
 * Contact form schema, shared by the form (client) and the Server Action (actions.ts), which also
 * applies spam defences and rate limiting, and stores the message. Lengths match ContactMessage.
 */

export const CONTACT_SUBJECTS = {
  RESERVATION: "Une réservation",
  CANCELLATION: "Une annulation",
  PAYMENT: "Un paiement",
  ACCESS_SHUTTLE: "L’accès et la navette",
  BUSINESS: "Une demande professionnelle",
  OTHER: "Autre",
} as const;

export type ContactSubject = keyof typeof CONTACT_SUBJECTS;

const PHONE = /^\+?[0-9 .()-]{8,20}$/;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Indiquez votre nom.").max(120, "120 caractères au maximum."),
  email: z.string().trim().min(1, "Indiquez votre adresse e-mail.").max(190, "190 caractères au maximum.").pipe(z.email("Adresse e-mail invalide. Exemple : nom@domaine.fr")),
  phone: z
    .string()
    .trim()
    .max(32, "32 caractères au maximum.")
    .refine((v) => v === "" || PHONE.test(v), "Numéro invalide. Exemple : 06 12 34 56 78"),
  subject: z.enum(Object.keys(CONTACT_SUBJECTS) as [ContactSubject, ...ContactSubject[]], { error: "Choisissez un sujet." }),
  parking: z.string().max(60),
  message: z.string().trim().min(10, "Votre message doit contenir au moins 10 caractères.").max(5000, "5 000 caractères au maximum."),
  /** Honeypot: hidden from people, filled by bots. Checked by the action before parsing. */
  website: z.string().max(200).optional(),
  /** Time the form was displayed (ms): very fast submissions are bots. */
  startedAt: z.string().optional(),
});

export type ContactInput = z.input<typeof contactSchema>;
export type ContactData = z.output<typeof contactSchema>;
