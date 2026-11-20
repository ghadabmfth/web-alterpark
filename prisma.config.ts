import { defineConfig } from "prisma/config";

/*
 * Prisma 7 configuration. The connection string lives here, not in schema.prisma.
 * DATABASE_URL: pooled connection used by the application.
 * DIRECT_DATABASE_URL: direct (non-pooled) connection used by migrations; falls back to DATABASE_URL.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    url: process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL ?? "",
  },
});
