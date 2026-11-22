/*
 * Vercel build step (vercel.json → npm run build:vercel): apply pending migrations and run the
 * idempotent seed when a database is configured, then let `next build` run.
 * Without DATABASE_URL the step is skipped with a clear message (the site then serves the
 * client-supplied catalogue; accounts and contact sending stay unavailable).
 * Non-destructive: `migrate deploy` only applies new migrations, never resets.
 */
import { execSync } from "node:child_process";

if (!process.env.DATABASE_URL) {
  console.warn("[deploy] DATABASE_URL is not set: migrations and seed skipped.");
  process.exit(0);
}
const run = (cmd) => execSync(cmd, { stdio: "inherit", env: process.env });
run("npx prisma migrate deploy");
run("npx prisma db seed");
