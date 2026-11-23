"use server";

import { after } from "next/server";
import { updateTag } from "next/cache";
import { z } from "zod";
import type { ActionState } from "@/lib/action-state";
import { processOutbox } from "@/modules/notifications/outbox";
import { SETTINGS_TAG } from "@/modules/settings/settings";
import { runAdminAction } from "../run-action";
import { changeStaffRole, createRole, deleteRole, inviteStaff, setStaffStatus, updateRole } from "../staff";
import { saveSettings } from "../settings";

/* Server Actions of staff accounts, roles and settings (super-administrator permissions). */

const name = (msg: string) => z.string().trim().min(1, msg).max(100, "100 caractères au maximum.");

export async function inviteStaffAction(_: ActionState, fd: FormData) {
  const schema = z.object({ firstName: name("Indiquez le prénom."), lastName: name("Indiquez le nom."), email: z.string().trim().pipe(z.email("Adresse e-mail invalide.")), roleId: z.uuid("Choisissez un rôle.") });
  return runAdminAction("ADMIN_USER_MANAGE", schema, fd, async (d, actor) => {
    await inviteStaff(actor, d);
    after(() => processOutbox().catch((e) => console.error("outbox", e)));
    return `Invitation envoyée à ${d.email}.`;
  });
}

export async function changeStaffRoleAction(_: ActionState, fd: FormData) {
  return runAdminAction("ADMIN_USER_MANAGE", z.object({ id: z.uuid(), roleId: z.uuid("Choisissez un rôle.") }), fd, async (d, actor) => {
    await changeStaffRole(actor, d.id, d.roleId);
    return "Rôle modifié. La personne doit se reconnecter.";
  });
}

export async function staffStatusAction(_: ActionState, fd: FormData) {
  return runAdminAction("ADMIN_USER_MANAGE", z.object({ id: z.uuid(), status: z.enum(["ACTIVE", "DISABLED"]) }), fd, async (d, actor) => {
    await setStaffStatus(actor, d.id, d.status);
    return d.status === "DISABLED" ? "Accès désactivé." : "Accès réactivé.";
  });
}

const roleSchema = z.object({
  name: name("Indiquez le nom du rôle."),
  description: z.string().trim().max(255, "255 caractères au maximum."),
  "permissions[]": z.array(z.string()).optional().default([]),
});

export async function createRoleAction(_: ActionState, fd: FormData) {
  return runAdminAction("ROLE_MANAGE", roleSchema, fd, async (d, actor) => {
    await createRole(actor, { name: d.name, description: d.description, permissions: d["permissions[]"] });
    return "Rôle créé.";
  });
}

export async function updateRoleAction(_: ActionState, fd: FormData) {
  return runAdminAction("ROLE_MANAGE", roleSchema.extend({ id: z.uuid() }), fd, async (d, actor) => {
    await updateRole(actor, d.id, { name: d.name, description: d.description, permissions: d["permissions[]"] });
    return "Rôle enregistré. Les droits s’appliquent dès la prochaine page consultée par ses membres.";
  });
}

export async function deleteRoleAction(_: ActionState, fd: FormData) {
  return runAdminAction("ROLE_MANAGE", z.object({ id: z.uuid() }), fd, async (d, actor) => {
    await deleteRole(actor, d.id);
    return "Rôle supprimé.";
  });
}

export async function saveSettingsAction(_: ActionState, fd: FormData) {
  const schema = z.object({ bookingEnabled: z.string().optional().transform((v) => v === "on"), bookingNotice: z.string().trim().max(300, "300 caractères au maximum.") });
  return runAdminAction("SETTINGS_MANAGE", schema, fd, async (d, actor) => {
    await saveSettings(actor, { "booking.enabled": d.bookingEnabled, "booking.notice": d.bookingNotice });
    updateTag(SETTINGS_TAG);
    return "Paramètres enregistrés.";
  });
}
