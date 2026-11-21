import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/*
 * Prisma client singleton (Prisma 7 + node-postgres adapter). Created on first use so that
 * modules can be imported where no database is configured (static build before the database is
 * provisioned): callers check `hasDatabase()` first or let `db()` throw an explicit error.
 */

const globalForPrisma = globalThis as unknown as { __alterparkPrisma?: PrismaClient };

export function hasDatabase(): boolean {
  return !!process.env.DATABASE_URL;
}

export function db(): PrismaClient {
  if (globalForPrisma.__alterparkPrisma) return globalForPrisma.__alterparkPrisma;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured");
  const client = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
  // Reuse across hot reloads in development; one instance per serverless instance in production.
  globalForPrisma.__alterparkPrisma = client;
  return client;
}
