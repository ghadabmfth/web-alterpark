import { execSync } from "node:child_process";

/*
 * Global setup of the integration suite: apply pending migrations to the TEST database and run the
 * idempotent seed (roles, permissions, sites). Non-destructive: nothing is wiped — tests create
 * their own data with unique values, so they never depend on an empty database.
 * Refuses any database whose name does not end in "_test". Explicit variables win over .env.local
 * (process.loadEnvFile never overrides variables that are already set).
 */
export default function setup() {
  const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ?? "";
  const name = new URL(TEST_DATABASE_URL).pathname.replace(/^\//, "");
  if (!name.endsWith("_test")) throw new Error(`Integration tests need a database whose name ends in _test (got "${name}")`);
  const env = { ...process.env, DATABASE_URL: TEST_DATABASE_URL, DIRECT_DATABASE_URL: TEST_DATABASE_URL };
  execSync("npx prisma migrate deploy", { stdio: "pipe", env });
  execSync("npx prisma db seed", { stdio: "pipe", env });
}
