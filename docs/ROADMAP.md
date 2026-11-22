# Roadmap

Each phase ends with: lint, types, tests and build green; a summary of files, decisions, completed
and remaining work; issues raised before the next phase starts. Nothing is declared
production-ready before every critical workflow is tested end to end.

| Phase | Content | Exit criteria |
|---|---|---|
| **1 — Audit & foundation** ✅ | Audit, architecture, data-model proposal, fresh Next.js foundation, design-system layer, CI | Approved 20/11/2026 |
| **2 — Design system** ✅ | Port the 30 components to TSX (server-first, `ap-*` classes, props of `index.d.ts`); add documented extensions: Table, Badge, Tabs, Pagination, DropdownMenu, DateTimeField, Skeleton, EmptyState, Toast, Card, StatTile, Sidebar, PageHeader, FilterBar, ConfirmDialog; `/dev/design-system` gallery (not deployed to production) | Every component rendered in all states at 390 / 768 / 1440 px; keyboard and screen-reader checks; visual comparison with the supplied previews |
| **3 — Front-end foundation** ✅ | Public layout (Header, Footer, SocialRail), home, parkings, parking details, how it works, FAQ, contact, legal pages, auth pages, booking funnel UI, customer-area and admin shells; metadata, sitemap, robots, structured data (`ParkingFacility`, `FAQPage`, `BreadcrumbList`) | Pages responsive and accessible (axe clean), Lighthouse ≥ 90 on mobile for public pages |
| **4 — Back end & database** ✅ | First migration, seed (roles, permissions, three sites as `DRAFT`), Prisma client, Auth.js (sign-up, login, verification, reset), permission helpers, rate limiting, audit log, structured logger | Integration tests against PostgreSQL; protected routes refuse unauthorised access server-side |
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
| `develop` branch | ✅ created and pushed |

**Approved on 20/11/2026:** data model, all ADRs, and the default answers to the open questions in
`AUDIT.md` §3.

## Phase 2 — status

| Task | Status |
|---|---|
| Component styles split verbatim from the bundle (30 files) + guard test | ✅ |
| Logo, pictograms and icon sets extracted mechanically; AppShowcase markup verified identical | ✅ |
| 30 supplied components ported to TSX (React 19, Server Components by default, `next/image`) | ✅ |
| 18 extensions (Badge, Card, StatTile, DataTable, Pagination, Tabs, DropdownMenu, DateTimeField, FilterBar, Skeleton, EmptyState, Toast, ConfirmDialog, PageHeader, DescriptionList, AppShell, Button `loading`, MenuIcon), documented | ✅ `docs/design-system/extensions.md` |
| Gallery `/dev/design-system` (+ `/shell`), hidden in production | ✅ |
| Visual comparison with the original bundle (Button, TextField, BookingBar, Header, Footer…) | ✅ matches; differences are the declared ones |
| axe-core: 0 violations at 390 / 768 / 1440 px; keyboard and focus behaviour checked (drawers, menu, dialogs) | ✅ |
| Unit tests: 48 (logic, markup semantics, design-system guards) | ✅ |
| Interactive component tests in CI (Playwright) | Phase 8 (checked manually with Playwright in Phase 2) |

## Phase 3 — status

| Task | Status |
|---|---|
| Public layout (Header with parking menu and current page, rail ≥ 1280 px, Footer), skip link | ✅ |
| Home, parkings list, parking detail (×3, prerendered), how it works, FAQ, contact, legal pages (×3), 404, error page | ✅ |
| SEO: per-page metadata and canonical, sitemap.xml, robots.txt (closed until `SITE_INDEXABLE=true`), JSON-LD Organization / ParkingFacility / FAQPage / BreadcrumbList | ✅ |
| Booking funnel UI (4 steps, React Hook Form + shared Zod schemas, time-zone aware stay rules, prefill from the parking page) | ✅ — availability, price and payment wired in Phases 5–6, stated on screen |
| Auth pages (login, register, forgot password) | ✅ UI and validation — Auth.js in Phase 4, stated on screen |
| Customer area (5 pages) and back office (12 pages) on AppShell, read-only parking catalogue in the admin | ✅ shells — data in Phases 4–7, banner on every page |
| Static parking catalogue (only client-supplied facts; Marseille and Roissy as "bientôt disponible") | ✅ replaced by Prisma in Phase 4 |
| Verification: 21 routes × 3 widths, 0 axe violation, no overflow, no console error; 17 functional checks (funnel, forms, navigation, SEO) | ✅ |
| Lighthouse mobile: accessibility 100; performance 90–96 (warm cache); SEO 100 when indexable (69 while `noindex`, by design); best practices 96 (Crossroads font 404 until licensed) | ✅ |

Content decisions: the Google rating (two conflicting figures in the design system) and the loyalty
programme (« utilisez vos points en ligne », not in v1) are left out until confirmed; the Nantes
"20 mars" news is on the Nantes page. The fourth hero step says « Votre véhicule vous attend à votre
retour » instead of « Découvrez nos Services Plus » (no Services Plus page in scope).

## Phase 4 — status

| Task | Status |
|---|---|
| Prisma 7 client (pg adapter), first migration, idempotent seed (roles + permissions, 3 sites as DRAFT, optional super admin from env) | ✅ |
| Parkings read from PostgreSQL (`use cache`, tag `parkings`), catalogue fallback without database | ✅ |
| Auth.js v5: e-mail + password (Argon2id), JWT cookie, session revalidated in the DAL with `sessionVersion` (immediate revocation) | ✅ |
| Registration, login, logout, e-mail verification (single use, explicit POST), forgotten / reset password (no account enumeration), profile, password change | ✅ |
| Roles and permissions: DAL (`requireUser`, `requireStaff`, per-page permission), customers get 404 on `/admin`, `proxy.ts` optimistic redirects | ✅ |
| Rate limiting in PostgreSQL (login inside `authorize`, so Auth.js's raw endpoint is covered too; registration, reset, contact) | ✅ |
| Audit log of sensitive actions; e-mail outbox (after(), cron retry with back-off), console / Resend transports | ✅ |
| Contact form stored, spam defences (honeypot, minimum fill time, rate limit), staff notified | ✅ |
| Tests: 67 unit, 14 integration on PostgreSQL (CI service), 26 end-to-end checks, 13 routes × 3 widths axe-clean | ✅ |
| Deployment guide (`docs/DEPLOYMENT.md`), migrations on deploy | ✅ |
| Back-office screens wired to data (reservations, customers, contacts…) | Phase 7 (pages protected, permission-checked, empty) |

All sites are DRAFT (approved rule Q3) until capacities, addresses and rates are entered: the
booking funnel says reservations open soon. Phase 5 needs at least one ACTIVE site with capacity.
