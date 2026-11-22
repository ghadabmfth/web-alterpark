import { defineConfig, devices } from "@playwright/test";

/*
 * End-to-end tests against a production build, a dedicated PostgreSQL database (name must end in
 * _test) and a local Stripe emulator. The values below are TEST-ONLY placeholders for a throwaway
 * local environment — none of them is a real credential.
 *
 *   npm run test:e2e        (E2E_DATABASE_URL overrides the database)
 */
const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;
export const E2E = {
  adminEmail: "admin@e2e.test",
  adminPassword: "e2e admin password only for tests",
  customerPassword: "e2e customer password only for tests",
};

const env: Record<string, string> = {
  DATABASE_URL: process.env.E2E_DATABASE_URL ?? "postgresql://alterpark:alterpark@localhost:5432/alterpark_e2e_test",
  NEXT_PUBLIC_SITE_URL: BASE_URL,
  AUTH_SECRET: "e2e-auth-secret-not-a-real-secret-0123456789",
  IP_HASH_SALT: "e2e-ip-hash-salt-not-a-real-secret-0123456789",
  CRON_SECRET: "e2e-cron-secret-not-a-real-secret-0123456789",
  EMAIL_TRANSPORT: "console",
  EMAIL_FROM: "ALTERPARK <reservation@example.com>",
  ADMIN_NOTIFICATION_EMAIL: "ops@example.com",
  STRIPE_SECRET_KEY: "sk_test_e2e_emulator",
  STRIPE_WEBHOOK_SECRET: "whsec_e2e_emulator_secret",
  STRIPE_API_BASE: "http://localhost:12111",
  APP_URL: BASE_URL,
  SEED_SUPER_ADMIN_EMAIL: E2E.adminEmail,
  SEED_SUPER_ADMIN_PASSWORD: E2E.adminPassword,
  E2E_CUSTOMER_PASSWORD: E2E.customerPassword,
  PATH: process.env.PATH ?? "",
  HOME: process.env.HOME ?? "",
};

export default defineConfig({
  testDir: "e2e",
  // One shared database and per-IP rate limits: tests run one after the other.
  workers: 1,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: { baseURL: BASE_URL, trace: "off", locale: "fr-FR", timezoneId: "Europe/Paris" },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    { name: "chromium", use: { ...devices["Desktop Chrome"] }, dependencies: ["setup"], testIgnore: /auth\.setup\.ts/ },
  ],
  webServer: [
    { command: "node e2e/support/stripe-emulator.mjs", url: "http://localhost:12111/health", env, reuseExistingServer: false, stdout: "pipe" },
    {
      command: `npx tsx e2e/support/prepare-db.ts && npx next build && npx next start -p ${PORT}`,
      url: BASE_URL,
      env,
      timeout: 600_000,
      reuseExistingServer: false,
      stdout: "pipe",
    },
  ],
});
