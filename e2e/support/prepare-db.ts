/*
 * Prepares the end-to-end database: migrations, seed (roles, sites, super admin from env), demo
 * capacities and rates, two customers with known passwords, empty rate-limit buckets.
 * Refuses any database whose name does not end in "_test" on a local host.
 */
import { execFileSync } from "node:child_process";
import { hash } from "@node-rs/argon2";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { ARGON2_OPTIONS } from "../../src/modules/auth/password-options";

const url = process.env.DATABASE_URL ?? "";
if (!url) throw new Error("DATABASE_URL is required");
const { hostname, pathname } = new URL(url);
if (!["localhost", "127.0.0.1"].includes(hostname) || !pathname.endsWith("_test")) {
  console.error(`Refusing to prepare ${hostname}${pathname}: local *_test databases only.`);
  process.exit(1);
}
async function main() {
  const run = (cmd: string, args: string[]) => execFileSync(cmd, args, { stdio: "inherit", env: process.env });
  run("npx", ["prisma", "migrate", "deploy"]);
  run("npx", ["prisma", "db", "seed"]);
  run("npx", ["tsx", "scripts/demo-data.ts"]);

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
  const role = await prisma.role.findUniqueOrThrow({ where: { key: "CUSTOMER" } });
  const password = process.env.E2E_CUSTOMER_PASSWORD;
  if (!password || password.length < 12) throw new Error("E2E_CUSTOMER_PASSWORD (12+ characters) is required");
  const passwordHash = await hash(password, ARGON2_OPTIONS);
  for (const [email, firstName] of [["client.a@e2e.test", "Alice"], ["client.b@e2e.test", "Bruno"]] as const) {
    await prisma.user.upsert({ where: { email }, create: { email, firstName, lastName: "E2E", phone: "0611223344", passwordHash, roleId: role.id, emailVerifiedAt: new Date() }, update: { passwordHash, status: "ACTIVE" } });
  }
  await prisma.rateLimitBucket.deleteMany();
  await prisma.appSetting.deleteMany();
  await prisma.$disconnect();
  console.log("e2e database ready");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
