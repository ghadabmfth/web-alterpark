"use server";

import { after } from "next/server";
import { AuthError, CredentialsSignin } from "next-auth";
import { signIn, signOut } from "@/server/auth/auth";
import { requireUser, safeNextPath } from "@/server/auth/session";
import { consumeRateLimit, RATE_LIMITS } from "@/server/security/rate-limit";
import { requestFingerprint } from "@/server/security/request";
import { hashToken } from "./tokens";
import { processOutbox } from "@/modules/notifications/outbox";
import { fieldErrorsOf, formObject, type ActionState } from "@/lib/action-state";
import { changePasswordSchema, forgotPasswordSchema, loginSchema, profileSchema, registerSchema, resetPasswordSchema } from "./schemas";
import { changePassword, registerCustomer, requestPasswordReset, resetPassword, updateProfile, verifyEmail } from "./service";

/*
 * Authentication Server Actions. Each one re-validates input with the shared Zod schema (never
 * trusts the client), applies rate limits, then calls the service. Messages never reveal whether an
 * account exists, except at registration where the user must be told to sign in instead.
 */

const TOO_MANY: ActionState = { status: "error", message: "Trop de tentatives. Réessayez dans quelques minutes." };
const sendEmailsSoon = () => after(() => processOutbox().catch((e) => console.error("outbox", e)));

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const raw = formObject(formData);
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrorsOf(parsed.error) };
  // Rate limiting is applied inside Auth.js `authorize` (covers every sign-in path).
  try {
    await signIn("credentials", { email: parsed.data.email, password: parsed.data.password, redirectTo: safeNextPath(raw.suivant) });
  } catch (e) {
    if (e instanceof CredentialsSignin && e.code === "rate_limited") return TOO_MANY;
    if (e instanceof AuthError) return { status: "error", message: "Adresse e-mail ou mot de passe incorrect." };
    throw e; // the redirect after a successful sign-in
  }
  return { status: "success" };
}

export async function registerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const raw = formObject(formData);
  const parsed = registerSchema.safeParse({ ...raw, acceptTerms: raw.acceptTerms === "on" || raw.acceptTerms === "true" });
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrorsOf(parsed.error) };
  const meta = await requestFingerprint();
  if (!(await consumeRateLimit(RATE_LIMITS.register, meta.ipHash)).allowed) return TOO_MANY;
  const result = await registerCustomer(parsed.data, meta);
  if (!result.ok) {
    return { status: "error", fieldErrors: { email: "Un compte existe déjà avec cette adresse. Connectez-vous ou réinitialisez votre mot de passe." } };
  }
  sendEmailsSoon();
  // Back to where the customer was (e.g. the booking funnel), else the welcome page.
  const next = safeNextPath(raw.suivant, "");
  await signIn("credentials", { email: parsed.data.email, password: parsed.data.password, redirectTo: next || "/compte?bienvenue=1" });
  return { status: "success" };
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}

export async function forgotPasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse(formObject(formData));
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrorsOf(parsed.error) };
  const meta = await requestFingerprint();
  if (!(await consumeRateLimit(RATE_LIMITS.passwordReset, meta.ipHash)).allowed) return TOO_MANY;
  await requestPasswordReset(parsed.data.email, meta);
  sendEmailsSoon();
  return { status: "success", message: "Si un compte existe avec cette adresse, vous allez recevoir un e-mail contenant un lien valable 1 heure." };
}

export async function resetPasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse(formObject(formData));
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrorsOf(parsed.error) };
  const meta = await requestFingerprint();
  if (!(await consumeRateLimit(RATE_LIMITS.passwordReset, meta.ipHash)).allowed) return TOO_MANY;
  const ok = await resetPassword(parsed.data.token, parsed.data.password, meta);
  if (!ok) return { status: "error", message: "Ce lien est invalide, a expiré ou a déjà été utilisé. Demandez un nouveau lien." };
  sendEmailsSoon();
  return { status: "success", message: "Votre mot de passe a été modifié. Vous pouvez vous connecter." };
}

export async function verifyEmailAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const token = String(formData.get("token") ?? "");
  if (token.length < 20 || token.length > 200) return { status: "error", message: "Lien invalide." };
  const ok = await verifyEmail(token, await requestFingerprint());
  return ok ? { status: "success", message: "Votre adresse e-mail est confirmée." } : { status: "error", message: "Ce lien est invalide, a expiré ou a déjà été utilisé." };
}

export async function updateProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser("/compte/profil");
  const parsed = profileSchema.safeParse(formObject(formData));
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrorsOf(parsed.error) };
  await updateProfile(user.id, parsed.data, await requestFingerprint());
  return { status: "success", message: "Vos coordonnées ont été enregistrées." };
}

export async function changePasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser("/compte/profil");
  const parsed = changePasswordSchema.safeParse(formObject(formData));
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrorsOf(parsed.error) };
  const meta = await requestFingerprint();
  if (!(await consumeRateLimit(RATE_LIMITS.loginAccount, hashToken(user.email))).allowed) return TOO_MANY;
  const ok = await changePassword(user.id, parsed.data.currentPassword, parsed.data.password, meta);
  if (!ok) return { status: "error", fieldErrors: { currentPassword: "Mot de passe actuel incorrect." } };
  sendEmailsSoon();
  // Every session was revoked (sessionVersion): sign in again with the new password.
  await signIn("credentials", { email: user.email, password: parsed.data.password, redirectTo: "/compte/profil?motdepasse=1" });
  return { status: "success" };
}
