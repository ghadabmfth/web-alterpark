import { defineConfig } from "prisma/config";

/*
 * Prisma 7 configuration. The connection string lives here, not in schema.prisma.
 * DATABASE_URL: pooled connection used by the application.
 * DIRECT_DATABASE_URL: direct (non-pooled) connection used by migrations; falls back to DATABASE_URL.
 * The CLI does not load env files any more: load the same files as Next.js (.env.local, then .env).
 */
for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // file absent: variables come from the environment (CI, Vercel)
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations", seed: "tsx prisma/seed.ts" },
  datasource: {
    url: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL || "",
  },
});
