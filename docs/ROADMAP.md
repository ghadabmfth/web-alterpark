# Roadmap

Each phase ends with: lint, types, tests and build green; a summary of files, decisions, completed
and remaining work; issues raised before the next phase starts. Nothing is declared
production-ready before every critical workflow is tested end to end.

| Phase | Content | Exit criteria |
|---|---|---|
| **1 — Audit & foundation** ✅ | Audit, architecture, data-model proposal, fresh Next.js foundation, design-system layer, CI | This document set approved |
| **2 — Design system** | Port the 30 components to TSX (server-first, `ap-*` classes, props of `index.d.ts`); add documented extensions: Table, Badge, Tabs, Pagination, DropdownMenu, DateTimeField, Skeleton, EmptyState, Toast, Card, StatTile, Sidebar, PageHeader, FilterBar, ConfirmDialog; `/dev/design-system` gallery (not deployed to production) | Every component rendered in all states at 390 / 768 / 1440 px; keyboard and screen-reader checks; visual comparison with the supplied previews |
| **3 — Front-end foundation** | Public layout (Header, Footer, SocialRail), home, parkings, parking details, how it works, FAQ, contact, legal pages, auth pages, booking funnel UI, customer-area and admin shells; metadata, sitemap, robots, structured data (`ParkingFacility`, `FAQPage`, `BreadcrumbList`) | Pages responsive and accessible (axe clean), Lighthouse ≥ 90 on mobile for public pages |
| **4 — Back end & database** | First migration, seed (roles, permissions, three sites as `DRAFT`), Prisma client, Auth.js (sign-up, login, verification, reset), permission helpers, rate limiting, audit log, structured logger | Integration tests against PostgreSQL; protected routes refuse unauthorised access server-side |
| **5 — Reservation engine** | Date rules, pricing engine, availability with row lock, holds and expiry cron, lifecycle transitions, references, cancellation rules and requests, e-mail outbox | Unit tests (pricing, dates, availability, transitions, permissions); concurrency test: N parallel bookings on the last space → exactly one |
| **6 — Payment** | `PaymentProvider` + Stripe Checkout, webhook (signature, idempotency), success / failure / pending / expiry / late payment, refunds, CSP | Stripe test-mode scenarios incl. duplicate and out-of-order webhooks; no confirmation without webhook |
| **7 — Back office** | Dashboard (real KPIs, date/site filters), reservations, parkings & offers, pricing, customers, payments & refunds, contacts (status, assignment, notes), reports & CSV export, admin users, roles & permissions, settings, audit log | Every action permission-checked and audit-logged; e2e admin flows |
| **8 — Quality** | Playwright e2e (registration, login, booking, payment sandbox, confirmation, history, admin management, contact), accessibility pass, security review, performance, error monitoring | All suites green in CI |
| **9 — Deployment** | Vercel project, environments and variables, Neon (or chosen) PostgreSQL, migrations in CI/CD, Stripe live webhook, e-mail domain, backups & restore drill, `DEPLOYMENT.md`, then indexing enabled | Preview validated end to end before Production |

## Phase 1 — implementation plan and status

| Task | Status |
|---|---|
| Inspect the supplied design system (tokens, components, docs, assets, licences) | ✅ `AUDIT.md` §1 |
| Inspect the existing repository, dependencies, build | ✅ `AUDIT.md` §2 |
| Remove previous work and restart from zero (client request) | ✅ ADR-001 |
| Fresh Next.js 16.4.6 app: App Router, React 19, TS strict, ESLint, Tailwind 4, `cacheComponents` | ✅ |
| Design-system layer: verbatim tokens, fonts, fluid typography, declared overrides, Tailwind theme reset to tokens, guard tests | ✅ `src/design-system/` |
| Brand assets and fonts imported (Crossroads excluded for licence reasons) | ✅ `public/brand`, `public/fonts` |
| Per-feature environment validation + complete `.env.example` | ✅ `src/server/config/env.ts` |
| Data-model proposal as a valid Prisma schema, verified on PostgreSQL 16 | ✅ `prisma/schema.prisma`, `DATA-MODEL.md` |
| Architecture, workflows, security, decisions, roadmap | ✅ `docs/` |
| CI: audit, lint, types, tests, schema validation, build | ✅ `.github/workflows/ci.yml` |
| Security headers, noindex until launch | ✅ |
| `develop` branch | ⏳ needs approval to push a new branch |

**Waiting for approval** of: the data model, ADR-008 (Auth.js v5), ADR-009 (Stripe Checkout),
ADR-011 (account required), ADR-013 (Resend), and answers to the open questions in `AUDIT.md` §3.
