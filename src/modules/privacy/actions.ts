"use server";

import { z } from "zod";
import { signOut } from "@/server/auth/auth";
import { requireUser } from "@/server/auth/session";
import { consumeRateLimit, RATE_LIMITS } from "@/server/security/rate-limit";
import { hashToken } from "@/modules/auth/tokens";
import type { ActionState } from "@/lib/action-state";
import { runAdminAction } from "@/modules/admin/run-action";
import { AdminRefusal, ensure } from "@/modules/admin/guard";
import { anonymiseCustomer, deleteOwnAccount } from "./service";

const MESSAGES = {
  WRONG_PASSWORD: "Mot de passe incorrect.",
  ACTIVE_BOOKINGS: "Vous avez une réservation en cours ou à venir : annulez-la ou attendez la fin du séjour avant de supprimer votre compte.",
  NOT_FOUND: "Compte introuvable.",
  STAFF_ACCOUNT: "Un compte de l’équipe se supprime depuis le back-office.",
} as const;

export async function deleteAccountAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser("/compte/profil");
  const parsed = z.object({ password: z.string().min(1, "Saisissez votre mot de passe."), confirm: z.literal("on", { error: "Cochez la case pour confirmer." }) }).safeParse({ password: fd.get("password"), confirm: fd.get("confirm") });
  if (!parsed.success) return { status: "error", fieldErrors: Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])) };
  if (!(await consumeRateLimit(RATE_LIMITS.loginAccount, hashToken(user.email))).allowed) return { status: "error", message: "Trop de tentatives. Réessayez plus tard." };
  const r = await deleteOwnAccount(user.id, parsed.data.password);
  if (!r.ok) return { status: "error", message: MESSAGES[r.reason], ...(r.reason === "WRONG_PASSWORD" ? { fieldErrors: { password: MESSAGES.WRONG_PASSWORD } } : {}) };
  await signOut({ redirectTo: "/?compte=supprime" });
  return { status: "success" };
}

export async function anonymiseCustomerAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return runAdminAction("CUSTOMER_MANAGE", z.object({ id: z.uuid() }), fd, async (d, actor) => {
    ensure(actor, "CUSTOMER_MANAGE");
    const r = await anonymiseCustomer(actor.id, d.id);
    if (!r.ok) throw new AdminRefusal(r.reason === "ACTIVE_BOOKINGS" ? "Ce client a une réservation en cours ou à venir : annulez-la d’abord." : MESSAGES[r.reason]);
    return "Compte anonymisé.";
  });
}
