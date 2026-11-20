# Architecture

Status: **approved 20/11/2026.** Only the parts marked ✓ exist in the code today.

## 1. Overview

One full-stack Next.js application (App Router) deployed on Vercel, backed by PostgreSQL.
No CMS, no second back end: the database is the system of record, Next.js renders the pages and
hosts the business logic, Stripe handles card data.

```
Browser ──HTTPS──▶ Next.js on Vercel (Node.js runtime)
                    ├─ Public site & customer area      Server Components, Server Actions
                    ├─ Admin back office (/admin)       Server Components, Server Actions
                    ├─ Route handlers (/api)            webhooks, cron jobs, health
                    └─ Domain modules ──Prisma──▶ PostgreSQL (EU region, pooled)
                                        └──HTTPS──▶ Stripe API · e-mail provider
Stripe ──signed webhook──▶ /api/webhooks/stripe
Vercel Cron ──bearer secret──▶ /api/cron/*  (expire holds, send e-mail outbox)
```

## 2. Layers

| Layer | Location | Rule |
|---|---|---|
| Presentation | `src/app/**` (routes), `src/modules/*/components` | Assembles components; no business rule, no Prisma call |
| UI library | `src/components/ui`, `src/design-system` ✓ | Built only from design-system tokens; no data access |
| Server entry points | `src/modules/*/actions.ts` (Server Actions), `src/app/api/**/route.ts` | Authenticate → authorise → validate (Zod) → call a service → map errors |
| Business logic | `src/modules/*/service.ts`, `src/modules/*/domain/*` | Pure domain functions (pricing, dates, transitions) + services orchestrating transactions |
| Data access | `src/modules/*/repository.ts`, `src/server/db` | The only place that imports the Prisma client |
| Auth & permissions | `src/server/auth` | `requireUser()`, `requirePermission()` used by every entry point |
| Integrations | `src/server/payments`, `src/server/email` | Behind interfaces (`PaymentProvider`, `EmailTransport`) |
| Cross-cutting | `src/server/config` ✓, `src/server/log`, `src/server/rate-limit`, `src/server/audit` | Env validation, structured logs, limits, audit trail |

Dependencies point inwards: `app → actions → services → domain/repositories → db`. Domain functions
are pure and unit-tested; services are integration-tested against PostgreSQL.

## 3. Folder structure

```
prisma/
  schema.prisma ✓          data model (proposal)
  migrations/               Phase 4
  seed.ts                   Phase 4: roles, permissions, the three sites in DRAFT
src/
  app/
    (public)/               home, parkings, parkings/[slug], comment-ca-marche, faq, contact,
                            mentions-legales, cgv, confidentialite
    (public)/reservation/   booking funnel (steps as nested routes)
    (auth)/                 connexion, inscription, mot-de-passe-oublie, verification
    compte/                 customer area: dashboard, reservations, reservations/[ref], paiements, profil, support
    admin/                  back office: dashboard, reservations, parkings, tarifs, clients, paiements,
                            contacts, rapports, utilisateurs, roles, parametres, journal
    api/
      webhooks/stripe/      signed webhook
      cron/                 expire-holds, send-notifications
      health/
    sitemap.ts, robots.ts, layout.tsx ✓, globals.css ✓
  design-system/ ✓          tokens, theme, typography, overrides (see its README)
  components/
    ui/                     DS primitives ported to TSX + documented extensions
    layout/                 Header, Footer, AdminShell, AccountShell
  modules/                  one folder per business feature
    auth/  users/  parkings/  pricing/  availability/  reservations/  payments/
    vehicles/  customers/  contact/  notifications/  analytics/  admin/  audit/
  server/
    config/ ✓ env.ts        per-feature validated environment
    db/                     Prisma client singleton (pg adapter)
    auth/                   Auth.js config, session helpers, permission checks
    payments/               PaymentProvider interface + Stripe implementation
    email/                  EmailTransport interface + console/Resend + templates
    log/  rate-limit/  audit/
  generated/prisma/         Prisma client (git-ignored)
tests/e2e/                  Playwright (Phase 8)
docs/                       this documentation, design-system reference
```

### Module anatomy

```
src/modules/reservations/
  domain/            pure: status machine, reference generator, cancellation rules (+ *.test.ts)
  schemas.ts         Zod schemas shared by forms and server entry points
  repository.ts      Prisma queries
  service.ts         use cases: createHold, confirmFromPayment, requestCancellation…
  actions.ts         Server Actions ("use server")
  components/        feature UI (client components only where interactive)
  index.ts           public surface of the module
```

## 4. Rendering and caching

- Server Components by default; client components only for interactive islands (date fields,
  forms with live validation, menus, carousels).
- `cacheComponents` is on: data is dynamic by default. Marketing pages and parking descriptions opt into
  `use cache` with tags (`parking:<slug>`) invalidated from the back office on save.
- Availability, prices, reservations, payments and anything per-user are **never cached**.
- Images through `next/image`; only the hero image is preloaded.

## 5. Main business workflows

### 5.1 Booking

| Step | Where | Server-side guarantee |
|---|---|---|
| 1–3. Site, service, arrival and departure (wall-clock in the site's time zone) | `/reservation` | Dates validated: lead time, order, max stay, horizon, DST gaps |
| 4. Account (sign in or quick sign-up inline) | funnel | Session required from here |
| 5. Vehicle (saved or new) and traveller details | funnel | Zod schemas; plate normalised |
| 6–7. Availability + price | Server Action `quote` | Computed by the engine; the client only displays it |
| 8. Review | funnel | Shows the server quote; a quote expires after 15 min |
| 9. Pay | Server Action `startCheckout` | **Transaction:** lock offer row → check capacity → insert `PENDING_PAYMENT` reservation with `holdExpiresAt` and the price snapshot → create Stripe Checkout Session for the server amount (idempotency key = reservation id) |
| 10–12. Verify, confirm, reference | `/api/webhooks/stripe` | Signature verified, event recorded once, reservation `CONFIRMED` in the same transaction as the payment row; reference generated at hold time |
| 13. Notify | outbox → cron | E-mail queued in the confirming transaction, sent and retried by the cron job |

The return page (`/reservation/confirmation?ref=…`) only **reads** the status; it never confirms.
While the webhook has not arrived it shows "payment being verified" and polls.

### 5.2 Availability and overbooking prevention

Capacity is per **offer** (service of a site). A reservation occupies one space on `[startsAt, endsAt)`.
Statuses that consume capacity: `CONFIRMED`, `CHECKED_IN`, and `PENDING_PAYMENT` while
`holdExpiresAt > now()`.

```
BEGIN;
SELECT … FROM "ParkingOffer" WHERE id = $offer FOR UPDATE;      -- serialises bookings of this offer
peak := maximum number of consuming reservations overlapping any instant of [start, end)
        (evaluated at `start` and at every reservation start inside the window)
IF peak + 1 > capacity THEN ROLLBACK → "complet"
INSERT reservation (PENDING_PAYMENT, holdExpiresAt = now() + holdTtl);
COMMIT;
```

Two customers racing for the last space are serialised by the row lock: the second sees the first
hold and is refused. Locking one offer row does not block other offers or sites; at Alterpark's
volume (bookings per minute, not per millisecond) this is simpler and safer than counters that can
drift. If volume ever requires it, the documented upgrade is per-day occupancy buckets.
A concurrency test (N parallel bookings for the last space → exactly one succeeds) is a Phase 5
exit criterion.

**Late payment:** if Stripe confirms a payment after the hold expired, the service re-runs the
capacity check; if a space is still free the reservation is confirmed, otherwise it is refunded in
full automatically and staff are alerted.

### 5.3 Reservation lifecycle

```
PENDING_PAYMENT ──payment verified──▶ CONFIRMED ──arrival──▶ CHECKED_IN ──departure──▶ COMPLETED
       │                                 │
       ├──hold expired / checkout expired──▶ EXPIRED
       └──payment failed (final)──────────▶ EXPIRED
CONFIRMED ──cancelled (customer within free window, or staff)──▶ CANCELLED (+ refund)
```

Transitions are a pure, unit-tested table; any other transition is rejected. Customers outside the
free-cancellation window create a `CancellationRequest` decided by staff.

### 5.4 Payment (provider-agnostic)

`src/server/payments` exposes one interface; Stripe is its first implementation.

```ts
interface PaymentProvider {
  createCheckout(input: { reservationId; amountCents; currency; customerEmail; expiresAt; successUrl; cancelUrl }): Promise<{ sessionId; url }>;
  verifyWebhook(rawBody: string, signature: string): PaymentEvent;   // throws on bad signature
  refund(input: { paymentId; amountCents; reason; idempotencyKey }): Promise<{ refundId; status }>;
  retrieve(sessionId: string): Promise<PaymentSnapshot>;             // reconciliation
}
```

Stripe Checkout Sessions (hosted payment page) are proposed: card data never touches Alterpark
(PCI SAQ A), 3-D Secure, Apple Pay and Google Pay are handled by Stripe, and branding uses the design
system's colours. Handled events: `checkout.session.completed`,
`checkout.session.async_payment_succeeded` / `_failed`, `checkout.session.expired`,
`charge.refunded`, `refund.updated`. Each event id is stored once in `PaymentWebhookEvent`
(unique constraint): duplicates are acknowledged and ignored.

### 5.5 Contact

Form → Server Action: Zod validation, honeypot field, minimum fill time, rate limit per IP hash,
optional Cloudflare Turnstile → `ContactMessage` saved → admin e-mail queued. Back office: list with
filters, status workflow (`NEW → IN_PROGRESS → RESOLVED`, or `SPAM` / `ARCHIVED`), assignment,
internal notes.

### 5.6 Notifications

Transactional outbox: the business transaction inserts a `Notification` row (with a dedupe key);
a Vercel Cron job sends pending rows, retries with back-off, and records failures. No e-mail is lost
if the provider is down, and no e-mail is sent for a transaction that rolled back.

## 6. Back office

Same dark design system, denser layout: sidebar navigation (collapsible under `lg`), breadcrumbs,
page header with primary action, filter bar, data table with pagination, detail pages with an
activity timeline from the audit log. Every page and action checks a permission server-side.
Dashboard KPIs are SQL aggregates over real data (revenue = succeeded payments minus refunds),
filterable by date range and site; no mock data outside clearly-labelled development fixtures.

## 7. Observability

- Structured JSON logs (level, request id, user id, module, event) to Vercel logs; log drains optional.
- Errors: `error.tsx` / `global-error.tsx` boundaries with a user-safe message and an error id;
  server errors logged with the same id. Sentry (or equivalent) can be plugged in via
  `instrumentation.ts` — decision in Phase 8.
- Health endpoint checks database connectivity.

## 8. Deployment

Vercel project on the repository root. Preview deployments per branch/PR with **test** Stripe keys and
a **separate database** (Neon branching via the Vercel Marketplace is proposed). Migrations run with
`prisma migrate deploy` in the build step for Preview and Production. Details, environment variables
and backup policy are written in Phase 9 (`docs/DEPLOYMENT.md`); variables are already listed in
`.env.example`.

## 9. Git workflow

`main` = production, `develop` = integration, `feature/*` and `fix/*` branched from `develop`,
merged by pull request after green CI. Releases merge `develop` into `main`. Commit messages:
imperative, scoped (`reservations: prevent overlapping holds`).
