import { describe, expect, it } from "vitest";
import { ALL_PERMISSIONS, hasPermission, SUPER_ADMIN_ONLY, SYSTEM_ROLES } from "./permissions";

describe("permissions", () => {
  it("gives customers nothing, admins everything but staff management, super admins everything", () => {
    expect(SYSTEM_ROLES.CUSTOMER.permissions).toEqual([]);
    expect(SYSTEM_ROLES.SUPER_ADMIN.permissions).toEqual(ALL_PERMISSIONS);
    for (const p of SUPER_ADMIN_ONLY) expect(SYSTEM_ROLES.ADMIN.permissions).not.toContain(p);
    expect(SYSTEM_ROLES.ADMIN.permissions).toHaveLength(ALL_PERMISSIONS.length - SUPER_ADMIN_ONLY.length);
  });
  it("checks one or several permissions", () => {
    expect(hasPermission(["RESERVATION_READ"], "RESERVATION_READ")).toBe(true);
    expect(hasPermission(["RESERVATION_READ"], ["RESERVATION_READ", "PAYMENT_REFUND"])).toBe(false);
    expect(hasPermission([], "DASHBOARD_VIEW")).toBe(false);
  });
});
