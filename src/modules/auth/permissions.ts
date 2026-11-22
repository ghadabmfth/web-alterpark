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

/** French labels of the permissions (roles editor). */
export const PERMISSION_LABELS: Record<Permission, string> = {
  DASHBOARD_VIEW: "Voir le tableau de bord",
  RESERVATION_READ: "Consulter les réservations",
  RESERVATION_MANAGE: "Gérer arrivées et départs",
  RESERVATION_CANCEL: "Annuler des réservations, traiter les demandes",
  PAYMENT_READ: "Consulter les paiements",
  PAYMENT_REFUND: "Rembourser",
  PARKING_READ: "Consulter sites, formules et tarifs",
  PARKING_MANAGE: "Modifier sites et formules (capacités, ouverture)",
  PRICING_MANAGE: "Gérer les tarifs",
  CUSTOMER_READ: "Consulter les clients",
  CUSTOMER_MANAGE: "Désactiver / réactiver des clients",
  CONTACT_READ: "Consulter les demandes de contact",
  CONTACT_MANAGE: "Traiter les demandes de contact",
  REPORT_VIEW: "Rapports et exports CSV",
  ADMIN_USER_MANAGE: "Gérer les comptes de l’équipe",
  ROLE_MANAGE: "Gérer les rôles et permissions",
  SETTINGS_MANAGE: "Modifier les paramètres",
  AUDIT_LOG_READ: "Consulter le journal d’audit",
};
