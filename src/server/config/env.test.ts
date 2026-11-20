import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { parseEnv, EnvError } = await import("./env");

describe("parseEnv", () => {
  it("normalises the site URL", () => {
    expect(parseEnv("site", { NEXT_PUBLIC_SITE_URL: "https://www.alterpark.fr/" }).NEXT_PUBLIC_SITE_URL).toBe("https://www.alterpark.fr");
  });

  it("names the missing variable and the feature", () => {
    expect(() => parseEnv("auth", {})).toThrow(EnvError);
    expect(() => parseEnv("auth", {})).toThrow(/"auth".*AUTH_SECRET/);
  });

  it("rejects short secrets", () => {
    expect(() => parseEnv("auth", { AUTH_SECRET: "short" })).toThrow(/at least 32/);
  });

  it("accepts Stripe test and restricted keys, rejects a publishable key as secret", () => {
    const ok = { STRIPE_SECRET_KEY: "rk_test_abc", STRIPE_WEBHOOK_SECRET: "whsec_abc", NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_abc" };
    expect(parseEnv("stripe", ok).STRIPE_SECRET_KEY).toBe("rk_test_abc");
    expect(() => parseEnv("stripe", { ...ok, STRIPE_SECRET_KEY: "pk_test_abc" })).toThrow(/STRIPE_SECRET_KEY/);
  });

  it("requires the Resend key only for the resend transport", () => {
    const base = { EMAIL_FROM: "ALTERPARK <reservation@example.com>", ADMIN_NOTIFICATION_EMAIL: "ops@example.com" };
    expect(parseEnv("email", base).EMAIL_TRANSPORT).toBe("console");
    expect(() => parseEnv("email", { ...base, EMAIL_TRANSPORT: "resend" })).toThrow(/RESEND_API_KEY/);
  });

  it("rejects a non-PostgreSQL database URL", () => {
    expect(() => parseEnv("database", { DATABASE_URL: "mysql://x" })).toThrow(/PostgreSQL/);
  });
});
