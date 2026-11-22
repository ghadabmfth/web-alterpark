# Architecture decisions

Short records: context → decision → consequences. All records below were **approved on 20/11/2026**.

## ADR-001 — Restart from zero (20/11/2026, client request)

The repository held a WordPress-headless monorepo (Next.js + PHP booking plugin) whose build failed
on a vulnerable Next.js version and whose stack contradicts the brief. At the client's request, all
previous work was removed; only the supplied design system was re-imported. History remains in Git
(last commit of the previous approach: `e8ef96d`).

## ADR-002 — One full-stack Next.js application

Next.js (App Router) hosts the public site, the customer area, the back office and the API; PostgreSQL
via Prisma is the single system of record. Single app at the repository root (no monorepo): one
build, one Vercel project, one CI job. Modules by business feature inside `src/modules`.

## ADR-003 — Design-system integration

`tokens.json` and `tokens.css` are kept **verbatim** (only font paths adjusted), so a new delivery
replaces them as-is and a test detects drift. Typography rules are ported verbatim from the
reference bundle. Deviations live in one file (`overrides.css`), each with a justification.
Components are re-implemented in TSX (React 19, Server Components) from the reference bundle,
keeping its class names, props and states.

## ADR-004 — Tailwind CSS restricted to the design system

Tailwind v4 is configured with every default scale reset and a theme that only *references*
design-system variables (`@theme inline reference`). Utilities therefore exist only for system
values (colours, 13 spacing steps, 5 radii, 4 shadows, 5 breakpoints); arbitrary values are
forbidden by convention and colour literals outside `src/design-system` fail a test.
`reference` is required because several Tailwind namespaces share names with the system
(`--radius-md`, `--shadow-*`, `--font-sans`) and would otherwise emit self-referencing variables.

## ADR-005 — Text colour on orange buttons

The system keeps white on orange (2.32:1, fails WCAG AA) at the client's request. We use #313131,
the system's own surface colour (5.6:1). Reverting = deleting one line in `overrides.css`.

*Extended in Phase 2 (same principle, same palette):* the identical orange/white pair also occurs
inside three supplied components (BookingBar badge, ServiceCard badge, selected "dès" price) and the
orange eyebrow pill reaches only 4.37:1. `overrides-components.css` uses `on-primary` / `surface`
for the first three and `primary-hover` for the eyebrow. axe-core then reports no violation on any
component at 390, 768 and 1440 px.

## ADR-006 — Font licences

Crossroads is supplied under a "personal use" licence: not committed, git-ignored; headings fall back
to Montserrat until a commercial web licence is bought and the file is placed in `public/fonts/`.
Stars use Font Awesome 6 Pro paths: licence to confirm. Montserrat (OFL) is committed.

## ADR-007 — Versions

Next.js **16.4.6** (16.4.3 is blocked by `SecurityFatalError`: seven advisories), React 19.3,
TypeScript 5.9 strict (+ `noUncheckedIndexedAccess`), Tailwind 4.3.3, Zod 4.6, Vitest 4.1.
Prisma **7.10.1**: the npm `latest` tag points to 8.0.0-rc, so the last stable line is used.
Exact versions everywhere. npm 11 is required (npm 10's resolver crashes on Vitest's optional peers).
`effect` (a dependency of the Prisma CLI only) is overridden to 3.22.5 to fix a ReDoS advisory.

## ADR-008 — Authentication: Auth.js v5

The brief asks for Auth.js. Its App Router version (v5) is still published under the `beta` tag
(5.0.0-beta.32) although widely used in production; v4 is stable but designed for the Pages Router.
Proposal: Auth.js v5 pinned to an exact version, credentials provider, Argon2id, JWT session cookie
with a server-side `sessionVersion` check (revocation). The rest of the app depends only on our
`src/server/auth` helpers, so the library can be swapped (e.g. Better Auth) without touching modules.

## ADR-009 — Payments: Stripe Checkout behind a provider interface

Stripe Checkout Sessions (hosted page): no card data on our side (PCI SAQ A), 3-D Secure and wallets
handled by Stripe, fewer client states to build. The `PaymentProvider` interface isolates Stripe.
Checkout Sessions live at least 30 minutes, so the default capacity hold is 30 minutes
(configurable per site). Confirmation only by verified, idempotent webhook.

## ADR-010 — Overbooking prevention by row lock

Booking runs in a transaction that locks the offer row (`SELECT … FOR UPDATE`), computes the peak
overlapping occupancy for the requested interval and inserts the hold. Simple, always consistent,
no counters to drift; contention is per offer only. Upgrade path (per-day buckets) documented.

## ADR-011 — Bookings belong to an account

A reservation always has a `User`. The funnel offers sign-in or quick sign-up inline at step 4, so
"customers only see their own data" is enforced by ownership, and history/cancellation work
uniformly. Guest checkout would need a signed access link per booking; possible later.

## ADR-012 — Serverless-safe infrastructure without extra services

Rate limiting and the e-mail outbox use PostgreSQL tables; scheduled work (expiring holds, sending
e-mails) uses Vercel Cron with a bearer secret. Redis/queues can replace them if traffic requires.

## ADR-013 — E-mail provider: Resend

HTTP API, simple domain verification, good Vercel integration. Behind an `EmailTransport` interface;
`console` transport in development.

## ADR-014 — Component architecture (Phase 2)

Supplied component CSS is kept **verbatim**, split per component under `src/design-system/components`
(a test proves every file is a slice of the bundle); TSX components in `src/components/ui` only
render the system's `ap-*` classes and contain no colour. Components are Server Components unless
they need state or browser APIs (client: Header, TypeTitle, RatingBadge, ReviewCard, ReviewCarousel,
Accordion, TextField, Alert, Modal, VideoModal, BookingBar, Toast, ConfirmDialog, DropdownMenu,
AppShell and the global CircleFx). Form fields forward `ref` and
native props (React 19), ready for React Hook Form. Extensions follow the same rules and are
documented before wide use. The gallery `/dev/design-system` is the review surface; it is absent
from production builds unless `DESIGN_SYSTEM_GALLERY=true`.

## ADR-015 — Phase 3 front-end decisions

- **Static catalogue until Phase 4.** `src/modules/parkings/queries.ts` exposes the read model the
  Prisma repository will implement; pages never import the catalogue directly. Only facts supplied
  by the client are published; sites without confirmed data are `DRAFT` and not bookable.
- **No pretend features.** Forms validate fully on the client with the shared schemas; where the
  server side does not exist yet (contact sending, authentication, pricing, payment), the screen
  says so and nothing is recorded. The customer area and back office show a warning banner and
  empty states naming the phase that wires them.
- **Indexing is opt-in.** `SITE_INDEXABLE=true` (Production at launch only) opens robots.txt and
  removes the global `noindex`; Preview deployments are never indexable.
- **Rendering.** All 39 routes are static; the booking funnel reads its URL parameters after mount
  instead of `useSearchParams` + Suspense, which removed a 0.36 layout shift. Images are served as
  AVIF/WebP, full-bleed veiled photos at quality 60.
- **Form behaviour.** A field in error is revalidated while typing (`form.subscribe`), so fixing it
  never shifts the layout on blur — which had swallowed clicks on « Continuer ».

## ADR-016 — Phase 4 implementation choices

- **Session revocation.** The JWT holds only the user id and `sessionVersion`; the DAL reloads the
  user on every request and compares versions. Password change/reset, role change or disabling an
  account revoke every session at once, which a plain JWT cannot do.
- **Cache Components and auth.** Protected layouts keep a static shell; the session is read by
  guards rendered inside `<Suspense>` (Next.js guide). Every Server Action re-checks on its own.
  Customers get 404 on `/admin`; staff without a permission see « Accès refusé ».
- **Rate limiting inside `authorize`.** Found while reviewing: Auth.js exposes
  `/api/auth/callback/credentials`, which bypassed limits enforced only in the login action.
- **Non-destructive database tooling.** Deployments and tests use `prisma migrate deploy` (never
  `reset`); integration tests use unique data and a database whose name must end in `_test`.
- **All sites DRAFT** (rule Q3) until capacities are known; the public site shows the information
  and says reservations open soon. The static catalogue is the seed source and the no-database
  fallback only.
- **Cron daily** (Hobby plan limit); e-mails are sent right after the request via `after()`.

## ADR-017 — Phase 5 reservation engine

- **Holds are created at payment time, not at quote time.** The funnel asks the server for a quote
  (price + availability, nothing held); the hold is taken in the same request that opens the Stripe
  Checkout session (Phase 6). Holding a space while the customer types their details would block
  capacity for people who never pay.
- **Rate selection is deterministic:** priority, then a rate whose range covers the stay, then the
  most specific minimum, then the most recent, then the id. Rates are chosen by the arrival date in
  the site's time zone. No applicable rate → the funnel says no price is published.
- **Peak occupancy, not overlap count**, is compared with capacity: consecutive stays share a space.
- **References are random** (32-character alphabet without 0/O/1/I, 6 characters) and retried on
  the rare collision; they reveal no volume.
- **Late payments** confirm only if a space is still free; otherwise the webhook refunds (Phase 6).
- **No cancellation without refund:** until refunds exist (Phase 6), a paid booking cannot be
  cancelled online; the customer is told to contact the team.
- **Pages below a dynamic parameter** (e.g. `/compte/reservations/[reference]`) cannot know the URL
  at prerender time; the AppShell resolves the current link inside `<Suspense>` with an identical
  fallback, so the shell stays prerendered.
- **Demo data is a local script**, never part of the seed or deployment, and refuses remote databases.

## ADR-018 — Phase 6 payment choices

- **Hosted Stripe Checkout, opened by a server action.** No Stripe script on our pages; the
  browser navigates to Stripe. Card data never reaches Alterpark.
- **Two idempotency layers.** Our booking key (one per quoted stay, from the funnel) returns the same
  reservation; Stripe's key `checkout:<reservation id>` returns the same session. The session's
  `expires_at` is derived from the stored hold (hold + 2 min, Stripe's minimum lifetime is 30 min),
  so a retry sends identical parameters.
- **The webhook is the only path to CONFIRMED.** Each event is stored once (provider + event id);
  each step is a guarded `UPDATE … WHERE status …`, so duplicates and out-of-order events are
  harmless. A failed processing returns 500 and Stripe retries it.
- **Money always goes back when a booking cannot be honoured**: late payment with no space, wrong
  amount, booking cancelled meanwhile. Refunds are recorded before calling Stripe and retried by
  the cron; their final status comes from Stripe's refund events.
- **A failed or expired checkout releases the space at once** instead of waiting for the hold.
- **Concurrent inserts use `ON CONFLICT DO NOTHING`** (payments, webhook events, vehicles): found by
  the double-click test, where two parallel requests raced on the same session.
- **Signed in to pay (ADR-011).** The funnel stores the form in `sessionStorage` (this tab only,
  never the consent box) while the customer signs in or creates an account.
- **CSP without nonces.** A nonce forces every page to render per request, which Cache Components'
  prerendered shells cannot do. Scripts are limited to our origin (inline allowed); connections,
  frames (YouTube only), forms, plugins, base URL and framing are locked down. Revisit when
  Next.js SRI (experimental) is stable.
- **Auth.js and prerendering.** `getCurrentUser` awaits `connection()` before `auth()`: Auth.js draws
  random values before reading the cookie, which Cache Components reported on every account page.

## ADR-019 — Phase 7 back-office choices

- **Permission checked three times**: the page (`adminActor`, « Accès refusé »), the Server Action
  (`runAdminAction`) and the service (`ensure`). Services are what tests exercise directly.
- **Guarded updates.** Every state change is an `UPDATE … WHERE status = <expected>`: two staff
  members acting at once cannot both apply; the second gets « la réservation a changé ».
- **Refund ceiling under lock.** Refunds lock the payment rows and count refunds still pending.
- **Rates are append-only** (add, deactivate): what a customer paid can always be explained.
- **Capacity changes take the booking lock** and cannot drop below the vehicles already booked.
- **Staff never handle passwords**: invitations send a single-use link (72 h).
- **CSV exports are plain links** (`download`): a `next/link` prefetch would have run the export —
  and written an audit entry — on hover. Text cells starting with `= + - @` are neutralised.
- **Inline row actions are unnamed forms**: a named form is a landmark, and a table of named
  « Désactiver » forms produced duplicate landmarks (axe).
- **No `upgrade-insecure-requests`** in the CSP: HSTS already forces HTTPS, and the directive broke
  redirects of a production build served over HTTP (it rewrote them to https://localhost).

## ADR-020 — Phase 8 quality choices

- **Stripe emulator for end-to-end tests.** A 120-line local server implements the Stripe calls we
  make (Checkout Sessions with idempotency, expire, refunds) and a hosted « payment page » that
  sends signed webhooks. The real `StripeProvider` talks to it through `STRIPE_API_BASE`, honoured
  with **test keys only**. A real Stripe test-mode run remains a launch step (needs keys).
- **E2E against a production build** and a dedicated database (`*_test`, refused otherwise);
  sessions saved once per role to stay under the login rate limits; one worker (shared state).
- **Vendor-neutral monitoring**: one JSON log line per error (server and browser), optional webhook;
  never query strings (tokens), headers or bodies. Sentry or a Log Drain can be plugged later.
- **Erasure = anonymisation**: the account row stays to own accounting records; identity, contact
  details, vehicles, tokens and messages are erased. Refused while a booking is in progress.
- **Zod in the browser runs « jitless »**: its `Function("")` probe was blocked by the CSP and
  reported as a violation on every page with a form.
- **Back-office menu by permission**: the menu is rendered with the session (inside Suspense); the
  prerendered shell shows no entry rather than entries the role cannot open.

## ADR-021 — Phase 9 deployment safeguards

- **Configuration checked by the build itself**, not by a checklist alone: the dangerous mistakes
  (indexable preview, live key on a preview, e2e emulator URL, payments without webhook secret,
  missing secrets once a database exists, non-https site URL in production) stop the deployment.
- **Health endpoint and read-only smoke test** give the same verification for Preview and
  Production, scriptable after each deploy.
- **Backups outside the database provider**: weekly `pg_dump`, AES-256 encrypted, 35 days as a
  private GitHub artifact (no extra storage account); the restore drill refuses non-scratch targets.
- **Production stays on the holding page** until Preview has passed the runbook (B1–B7).
