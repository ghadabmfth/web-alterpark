# ALTERPARK

Airport parking reservation and management platform for Nantes, Marseille and Paris-Roissy —
public website, online booking with secure payment, customer area and administration back office.
Developed by OuiDev.

**Status: Phases 1–3 complete (foundation, design system, front-end pages). Next: Phase 4, database, authentication and permissions.** Pages are in place; bookings, accounts and payments are wired in Phases 4–6 (each screen says so). See [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Stack

Next.js 16 (App Router, React 19, TypeScript strict) · Tailwind CSS 4 restricted to the AlterPark
design system · PostgreSQL + Prisma 7 · Auth.js · Zod · React Hook Form · Stripe · Vitest ·
Playwright · Vercel. Exact versions in `package.json`.

## Getting started

Requirements: Node.js 22 (`.nvmrc`), npm 11, PostgreSQL 16 from Phase 4.

```bash
npm install -g npm@11.6.2
npm ci
cp .env.example .env.local
npm run dev            # http://localhost:3000
```

| Script | Purpose |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm run lint` · `npm run typecheck` · `npm test` | Quality checks (also run in CI) |
| `npm run db:validate` · `npm run db:format` | Prisma schema |
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
