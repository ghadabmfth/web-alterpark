import "server-only";
import type { Permission } from "@/generated/prisma/enums";
import { getCurrentUser, can } from "@/server/auth/session";
import type { Actor } from "./guard";

/** Back-office page: the signed-in staff member if they hold the permission, else null (« Accès refusé »). */
export async function adminActor(permission: Permission): Promise<(Actor & { can: (p: Permission) => boolean }) | null> {
  const user = await getCurrentUser();
  if (!user || !user.isStaff || !can(user, permission)) return null;
  return { ...user, can: (p: Permission) => can(user, p) };
}
