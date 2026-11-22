import "server-only";
import type { z } from "zod";
import { refresh } from "next/cache";
import type { Permission } from "@/generated/prisma/enums";
import { getCurrentUser } from "@/server/auth/session";
import { can } from "@/server/auth/session";
import { fieldErrorsOf, type ActionState } from "@/lib/action-state";
import { AdminRefusal, Forbidden, type Actor } from "./guard";

/*
 * Shared body of the back-office Server Actions: signed-in staff with the permission, input parsed
 * with Zod (repeated fields become arrays), then the service. Refusals become messages; anything
 * else is a real error and propagates. The page is refreshed after a success.
 */

export function formValues(formData: FormData): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  for (const key of new Set(formData.keys())) {
    if (key.startsWith("$ACTION")) continue;
    const all = formData.getAll(key).filter((v): v is string => typeof v === "string");
    out[key] = key.endsWith("[]") ? all : (all[0] ?? "");
  }
  return out;
}

export async function runAdminAction<S extends z.ZodType>(
  permission: Permission | readonly Permission[],
  schema: S,
  formData: FormData,
  handler: (data: z.output<S>, actor: Actor) => Promise<string | void>,
): Promise<ActionState> {
  const actor = await getCurrentUser();
  if (!actor || !actor.isStaff || !can(actor, permission)) return { status: "error", message: "Action non autorisée pour votre rôle." };
  const parsed = schema.safeParse(formValues(formData));
  if (!parsed.success) return { status: "error", message: "Certains champs sont à corriger.", fieldErrors: fieldErrorsOf(parsed.error) };
  try {
    const message = await handler(parsed.data, actor);
    refresh();
    return { status: "success", message: message ?? "Modification enregistrée." };
  } catch (e) {
    if (e instanceof Forbidden) return { status: "error", message: "Action non autorisée pour votre rôle." };
    if (e instanceof AdminRefusal) return { status: "error", message: e.message, ...(e.field ? { fieldErrors: { [e.field]: e.message } } : {}) };
    throw e;
  }
}
