# ALTERPARK

Airport parking reservation and management platform for Nantes, Marseille and Paris-Roissy —
public website, online booking with secure payment, customer area and administration back office.
Developed by OuiDev.

**Status: Phases 1–8 complete (foundation, design system, front-end, database and authentication, reservation engine, payment, back office, quality). Next: Phase 9, deployment.** Online booking works end to end once Stripe keys are set and a site is opened from the back office (capacities and rates entered). See [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Stack

Next.js 16 (App Router, React 19, TypeScript strict) · Tailwind CSS 4 restricted to the AlterPark
design system · PostgreSQL + Prisma 7 · Auth.js · Zod · React Hook Form · Stripe · Vitest ·
Playwright · Vercel. Exact versions in `package.json`.

## Getting started

Requirements: Node.js 22 (`.nvmrc`), npm 11, PostgreSQL 16.

```bash
npm install -g npm@11.6.2
npm ci                 # also generates the Prisma client
cp .env.example .env.local   # then fill DATABASE_URL, AUTH_SECRET, IP_HASH_SALT, CRON_SECRET…
npm run db:migrate     # apply migrations to your local database
npm run db:seed        # roles, permissions, sites (+ super admin if SEED_SUPER_ADMIN_* are set)
npm run dev            # http://localhost:3000
```

Deployment: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

| Script | Purpose |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm run lint` · `npm run typecheck` · `npm test` | Quality checks (also run in CI) |
| `npm run db:validate` · `npm run db:format` | Prisma schema |
| `npm run db:migrate` · `npm run db:deploy` · `npm run db:seed` | Migrations (dev / deploy) and seed |
| `npm run db:demo` | **Local only**: opens Nantes with fictitious capacities and rates labelled « DÉMO » (`-- --undo` to revert) |
| `npm run test:integration` | Integration tests on PostgreSQL (`TEST_DATABASE_URL`, name ending in `_test`) |
| `npm run test:e2e` | Playwright end-to-end suite: prepares `alterpark_e2e_test`, builds, starts the app and a local Stripe emulator (`E2E_DATABASE_URL` to override) |
| `npm run check` | All checks except the build |

Design-system gallery: `npm run dev`, then open http://localhost:3000/dev/design-system
(and `/dev/design-system/shell` for the back-office layout).

Fonts: Montserrat is included. **Crossroads (headings) is not**: its licence is "personal use"
only. After buying a commercial web licence, place the file at `public/fonts/Crossroads-Regular.ttf`
(git-ignored). Until then headings render in Montserrat.

## Documentation

| Document | Content |
|---|---|
| [`docs/AUDIT.md`](docs/AUDIT.md) | Phase 1 audit: design system, previous project, open questions |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Layers, folder structure, workflows, rendering, deployment |
| [`docs/DATA-MODEL.md`](docs/DATA-MODEL.md) | Entities, relationships, constraints, status machines |
| [`docs/SECURITY.md`](docs/SECURITY.md) | Authentication, authorisation, payments, abuse, secrets |
| [`docs/SECURITY-REVIEW.md`](docs/SECURITY-REVIEW.md) | Pre-launch security review (Phase 8) and recommendations |
| [`docs/DECISIONS.md`](docs/DECISIONS.md) | Architecture decision records |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Phases and exit criteria |
| [`src/design-system/README.md`](src/design-system/README.md) | How to use the design-system layer |
| [`docs/design-system/extensions.md`](docs/design-system/extensions.md) | Extensions to the system and porting notes |
| [`docs/design-system/`](docs/design-system/README.md) | Supplied design system: charter, analysis, responsive rules, component sheets, reference bundle |

## Repository rules

- Branches: `main` (production), `develop` (integration), `feature/*`, `fix/*`; pull requests with green CI.
- Never commit secrets or `.env` files; every variable is documented in `.env.example`.
- The design system is the single source of truth for the interface: no colour, spacing, radius or
  font outside its tokens (enforced by `src/design-system/design-system.test.ts`).
