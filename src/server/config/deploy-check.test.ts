import { describe, expect, it } from "vitest";
import { checkDeployEnv } from "./deploy-check";

const secret = "x".repeat(40);
const ready = {
  VERCEL_ENV: "production",
  NEXT_PUBLIC_SITE_URL: "https://www.alterpark.fr",
  DATABASE_URL: "postgres://db",
  DIRECT_DATABASE_URL: "postgres://db-direct",
  AUTH_SECRET: secret,
  IP_HASH_SALT: secret,
  CRON_SECRET: secret,
  EMAIL_TRANSPORT: "resend",
  EMAIL_FROM: "ALTERPARK <reservation@alterpark.fr>",
  ADMIN_NOTIFICATION_EMAIL: "ops@alterpark.fr",
  STRIPE_SECRET_KEY: "rk_live_x",
  STRIPE_WEBHOOK_SECRET: "whsec_x",
  SITE_INDEXABLE: "true",
  ERROR_WEBHOOK_URL: "https://hooks.example/x",
};

describe("deployment configuration check", () => {
  it("a launch-ready production passes without warning", () => {
    expect(checkDeployEnv(ready)).toEqual({ errors: [], warnings: [] });
  });

  it("stops the build on dangerous mistakes", () => {
    expect(checkDeployEnv({ ...ready, STRIPE_API_BASE: "http://localhost:12111" }).errors).toHaveLength(1);
    expect(checkDeployEnv({ ...ready, VERCEL_ENV: "preview" }).errors.join()).toMatch(/SITE_INDEXABLE.*live Stripe key/s);
    expect(checkDeployEnv({ ...ready, AUTH_SECRET: "short" }).errors.join()).toMatch(/AUTH_SECRET/);
    expect(checkDeployEnv({ ...ready, NEXT_PUBLIC_SITE_URL: "http://www.alterpark.fr" }).errors.join()).toMatch(/https/);
    expect(checkDeployEnv({ ...ready, STRIPE_WEBHOOK_SECRET: undefined }).errors.join()).toMatch(/never be confirmed/);
    expect(checkDeployEnv({ ...ready, CRON_SECRET: undefined }).errors.join()).toMatch(/CRON_SECRET/);
  });

  it("warns about what is expected before launch", () => {
    const pre = checkDeployEnv({ ...ready, STRIPE_SECRET_KEY: "sk_test_x", SITE_INDEXABLE: undefined, SEED_SUPER_ADMIN_EMAIL: "a@b.c" });
    expect(pre.errors).toEqual([]);
    expect(pre.warnings.join("\n")).toMatch(/TEST key[\s\S]*SEED_SUPER_ADMIN[\s\S]*SITE_INDEXABLE/);
  });

  it("a preview without database builds with a warning only", () => {
    expect(checkDeployEnv({ VERCEL_ENV: "preview" })).toEqual({ errors: [], warnings: [expect.stringMatching(/DATABASE_URL is not set/)] });
  });
});
