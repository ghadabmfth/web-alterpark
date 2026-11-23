import "server-only";
import type { Permission } from "@/generated/prisma/enums";
import type { SessionUser } from "@/modules/auth/service";
import { hasPermission } from "@/modules/auth/permissions";

/*
 * Back-office authorisation inside the services (defence in depth): every command re-checks the
 * actor's permission even though pages and actions already did. Domain refusals carry a message
 * for the staff member; they are not errors of the application.
 */

export type Actor = Pick<SessionUser, "id" | "isStaff" | "permissions" | "roleKey" | "firstName" | "lastName">;

export class Forbidden extends Error {
  constructor() {
    super("FORBIDDEN");
  }
}

/** A refusal explained to the user (« Le remboursement dépasse le montant payé »…). */
export class AdminRefusal extends Error {
  constructor(
    message: string,
    readonly field?: string,
  ) {
    super(message);
  }
}

export function ensure(actor: Actor, permission: Permission | readonly Permission[]): void {
  if (!actor.isStaff || !hasPermission(actor.permissions, permission)) throw new Forbidden();
}
