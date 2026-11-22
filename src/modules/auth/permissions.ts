import type { Permission } from "@/generated/prisma/enums";

/*
 * Permission catalogue and default grants of the system roles. Single source of truth for the
 * seed and for authorisation checks. Custom staff roles can be created in the back office
 * (Phase 7) with any subset of ALL_PERMISSIONS.
 */

export const ALL_PERMISSIONS = [
  "DASHBOARD_VIEW",
  "RESERVATION_READ",
  "RESERVATION_MANAGE",
  "RESERVATION_CANCEL",
  "PAYMENT_READ",
  "PAYMENT_REFUND",
  "PARKING_READ",
  "PARKING_MANAGE",
  "PRICING_MANAGE",
  "CUSTOMER_READ",
  "CUSTOMER_MANAGE",
  "CONTACT_READ",
  "CONTACT_MANAGE",
  "REPORT_VIEW",
  "ADMIN_USER_MANAGE",
  "ROLE_MANAGE",
  "SETTINGS_MANAGE",
  "AUDIT_LOG_READ",
] as const satisfies readonly Permission[];

/** Reserved to the super administrator: managing staff, roles and global settings. */
export const SUPER_ADMIN_ONLY: readonly Permission[] = ["ADMIN_USER_MANAGE", "ROLE_MANAGE", "SETTINGS_MANAGE"];

export type SystemRoleKey = "CUSTOMER" | "ADMIN" | "SUPER_ADMIN";

export const SYSTEM_ROLES: Record<SystemRoleKey, { name: string; description: string; isStaff: boolean; permissions: readonly Permission[] }> = {
  CUSTOMER: { name: "Client", description: "Accès à son propre espace client uniquement.", isStaff: false, permissions: [] },
  ADMIN: {
    name: "Administrateur",
    description: "Gestion des réservations, paiements, parkings, tarifs, clients et demandes de contact.",
    isStaff: true,
    permissions: ALL_PERMISSIONS.filter((p) => !SUPER_ADMIN_ONLY.includes(p)),
  },
  SUPER_ADMIN: { name: "Super-administrateur", description: "Tous les droits, dont la gestion des administrateurs et des rôles.", isStaff: true, permissions: ALL_PERMISSIONS },
};

export function hasPermission(granted: readonly Permission[], required: Permission | readonly Permission[]): boolean {
  const needed = Array.isArray(required) ? required : [required];
  return needed.every((p) => granted.includes(p));
}
