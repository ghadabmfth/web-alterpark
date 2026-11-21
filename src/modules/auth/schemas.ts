import { z } from "zod";

/*
 * Authentication schemas, shared by the forms and the server actions (Phase 4: Auth.js,
 * Argon2id, rate limiting). Password policy follows NIST SP 800-63B: length over composition
 * rules, 12 to 128 characters; Phase 4 also rejects passwords found in breach lists.
 */

export const PASSWORD_MIN = 12;
export const PASSWORD_MAX = 128;

const email = z.string().trim().min(1, "Indiquez votre adresse e-mail.").max(190, "190 caractères au maximum.").pipe(z.email("Adresse e-mail invalide. Exemple : nom@domaine.fr"));

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Indiquez votre mot de passe.").max(PASSWORD_MAX),
});

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, "Indiquez votre prénom.").max(100, "100 caractères au maximum."),
    lastName: z.string().trim().min(1, "Indiquez votre nom.").max(100, "100 caractères au maximum."),
    email,
    phone: z
      .string()
      .trim()
      .refine((v) => v === "" || (/^\+?[0-9 .()-]+$/.test(v) && /^(\D*\d){8,15}\D*$/.test(v)), "Numéro invalide. Exemple : 06 12 34 56 78"),
    password: z.string().min(PASSWORD_MIN, `${PASSWORD_MIN} caractères au minimum.`).max(PASSWORD_MAX, `${PASSWORD_MAX} caractères au maximum.`),
    passwordConfirm: z.string(),
    acceptTerms: z.literal(true, { error: "Acceptez les conditions générales de vente pour continuer." }),
  })
  .refine((d) => d.password === d.passwordConfirm, { path: ["passwordConfirm"], message: "Les deux mots de passe ne correspondent pas." });

export const forgotPasswordSchema = z.object({ email });

export type LoginInput = z.input<typeof loginSchema>;
export type RegisterInput = z.input<typeof registerSchema>;
export type ForgotPasswordInput = z.input<typeof forgotPasswordSchema>;
