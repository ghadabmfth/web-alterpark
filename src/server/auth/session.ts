import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import type { Permission } from "@/generated/prisma/enums";
import { hasDatabase } from "@/server/db/client";
import { loadSessionUser, type SessionUser } from "@/modules/auth/service";
import { hasPermission } from "@/modules/auth/permissions";
import { isSafeNextPath } from "./safe-path";
import { auth } from "./auth";

/*
 * Data Access Layer for authentication (Next.js guide): the ONLY way pages, layouts, Server
 * Actions and route handlers learn who the user is. Reads the session cookie (so callers sit behind
 * a <Suspense> boundary) and reloads the user, checking status and sessionVersion.
 * proxy.ts only redirects early; it is never the security boundary.
 */

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  if (!hasDatabase()) return null;
  // Request time only: Auth.js draws random values (CSRF) before it reads the cookie, which Cache
  // Components would otherwise report as an unstable value during prerendering.
  await connection();
  const session = await auth();
  const id = session?.user?.id;
  if (!id || session.sv === undefined) return null;
  return loadSessionUser(id, session.sv);
});

/** Internal paths only: prevents open redirects through ?suivant=. */
export function safeNextPath(next: string | null | undefined, fallback = "/compte"): string {
  return isSafeNextPath(next) ? next! : fallback;
}

export async function requireUser(next = "/compte"): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/connexion?suivant=${encodeURIComponent(next)}`);
  return user;
}

/** Back office: anyone not staff gets a 404 (the area is not advertised). */
export async function requireStaff(): Promise<SessionUser> {
  const user = await requireUser("/admin");
  if (!user.isStaff) notFound();
  return user;
}

export function can(user: SessionUser, permission: Permission | readonly Permission[]): boolean {
  return hasPermission(user.permissions, permission);
}

/** For Server Actions: throws instead of rendering, so the action never runs. */
export async function assertPermission(permission: Permission | readonly Permission[]): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user || !user.isStaff || !can(user, permission)) throw new Error("FORBIDDEN");
  return user;
}
