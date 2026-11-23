/*
 * Idempotent seed: system roles and permissions, the parking catalogue, and optionally the first
 * super administrator. Safe to run on every deployment (`npm run db:seed`).
 *
 * - Parkings: client-supplied facts only. All sites are DRAFT (approved rule Q3): they become
 *   bookable once capacities, addresses and rates are entered and the site is activated.
 *   Existing rows are never overwritten (edits made in the back office win).
 * - Super administrator: created only when SEED_SUPER_ADMIN_EMAIL and SEED_SUPER_ADMIN_PASSWORD
 *   are set; never hard-coded. The password must be changed after the first login.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "@node-rs/argon2";
import { PrismaClient } from "../src/generated/prisma/client";
import { SYSTEM_ROLES, type SystemRoleKey } from "../src/modules/auth/permissions";
import { STATIC_PARKINGS } from "../src/modules/parkings/catalog";
import { ARGON2_OPTIONS } from "../src/modules/auth/password-options";

const url = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not configured");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

async function seedRoles() {
  for (const [key, role] of Object.entries(SYSTEM_ROLES) as [SystemRoleKey, (typeof SYSTEM_ROLES)[SystemRoleKey]][]) {
    const row = await prisma.role.upsert({
      where: { key },
      create: { key, name: role.name, description: role.description, isSystem: true, isStaff: role.isStaff },
      update: { name: role.name, description: role.description, isSystem: true, isStaff: role.isStaff },
    });
    // System roles always carry exactly their default permissions.
    await prisma.$transaction([
      prisma.rolePermission.deleteMany({ where: { roleId: row.id, permission: { notIn: [...role.permissions] } } }),
      prisma.rolePermission.createMany({ data: role.permissions.map((permission) => ({ roleId: row.id, permission })), skipDuplicates: true }),
    ]);
  }
}

async function seedParkings() {
  for (const p of STATIC_PARKINGS) {
    const exists = await prisma.parking.findUnique({ where: { slug: p.slug }, select: { id: true } });
    if (exists) continue;
    await prisma.parking.create({
      data: {
        slug: p.slug,
        name: p.name,
        airportCode: p.airportCode,
        airportName: p.airportName,
        addressLine: p.address?.line ?? "",
        postalCode: p.address?.postalCode ?? "",
        city: p.address?.city ?? p.city,
        country: p.address?.country ?? "FR",
        timeZone: p.timeZone,
        phone: p.phone,
        email: p.email,
        description: p.description,
        practicalInfo: p.practicalInfo.join("\n") || null,
        openingHours: p.openingHours ? { label: p.openingHours } : undefined,
        status: "DRAFT",
        minLeadMinutes: p.minLeadMinutes,
        offers: {
          create: p.offers.map((o, i) => ({
            code: o.code,
            name: o.name,
            tagline: o.tagline,
            features: o.features,
            shuttleIncluded: o.shuttleIncluded,
            walkMinutes: o.walkMinutes,
            // Unknown until the client provides it: 0 keeps the offer unbookable.
            capacity: 0,
            isHighlighted: o.highlighted,
            sortOrder: i,
          })),
        },
      },
    });
  }
}

async function seedSuperAdmin() {
  const email = process.env.SEED_SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD;
  if (!email || !password) {
    console.log("seed: no SEED_SUPER_ADMIN_EMAIL / SEED_SUPER_ADMIN_PASSWORD, super administrator not created");
    return;
  }
  if (password.length < 12) throw new Error("SEED_SUPER_ADMIN_PASSWORD must be at least 12 characters");
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    console.log("seed: super administrator already exists, left unchanged");
    return;
  }
  const role = await prisma.role.findUniqueOrThrow({ where: { key: "SUPER_ADMIN" } });
  await prisma.user.create({
    data: {
      email,
      firstName: "Super",
      lastName: "Administrateur",
      passwordHash: await hash(password, ARGON2_OPTIONS),
      emailVerifiedAt: new Date(),
      roleId: role.id,
    },
  });
  console.log(`seed: super administrator ${email} created`);
}

async function main() {
  await seedRoles();
  await seedParkings();
  await seedSuperAdmin();
  console.log("seed: done");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
