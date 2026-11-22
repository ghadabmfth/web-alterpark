# Security

Status: Phases 4–6 in place (authentication, authorisation, rate limiting, audit, contact, reservations, payment). ✓ = in place today.

## Authentication

- ✓ Auth.js (v5) with an e-mail + password credentials provider; passwords hashed with **Argon2id** (m=19 MiB, t=2, p=1). Unknown accounts are verified against a dummy hash: constant response time.
- ✓ Sessions in a signed, encrypted, `HttpOnly`, `Secure`, `SameSite=Lax` cookie (7 days). Every server-side
  check re-reads the user and compares `sessionVersion`: changing a password, a role or disabling an
  account revokes every existing session immediately.
- ✓ E-mail verification (48 h) and password reset (1 h) with single-use tokens consumed atomically;
  only their SHA-256 hash is stored; a new reset link invalidates older ones; confirmation is an
  explicit POST so link scanners cannot use it up. Reset responses never reveal whether an e-mail exists.
- ✓ Login (inside Auth.js `authorize`, so the raw `/api/auth/callback/credentials` endpoint is covered too: 20 / 15 min per IP, 8 / 15 min per account), sign-up (5 / h per IP), reset (5 / h) contact (5 / h), quotes (60 / 10 min per IP) and reservation changes (10 / h per account) are rate-limited; generic error messages.

## Authorisation

- Roles `CUSTOMER`, `ADMIN`, `SUPER_ADMIN` + custom staff roles; permissions from a fixed catalogue.
- ✓ Checks live in the **data-access layer** (`requireUser`, `requirePermission`) and run in every
  Server Action, route handler and server page. `proxy.ts` only does optimistic redirects; it is
  never the security boundary.
- ✓ Customers' queries are always scoped by their own `userId` (ownership in the `WHERE` clause, not
  checked after loading). Unknown or foreign resources return 404.
- ✓ Only `SUPER_ADMIN` manages roles and admin accounts by default; nobody changes their own role or disables themselves; the last active super administrator cannot be demoted or disabled; role and status changes revoke sessions. Staff are invited by single-use link, never given a password.

## Input, output, requests

- Zod validation on every server entry point (forms are validated again server-side).
- Prisma parameterised queries only; raw SQL (availability) uses tagged templates.
- React escaping; no `dangerouslySetInnerHTML` with user content.
- CSRF: Server Actions are POST-only with Origin checking by Next.js; mutating route handlers check
  `Origin`; Auth.js uses its own CSRF token; webhooks are authenticated by signature, cron by bearer secret.
- Security headers ✓ (`nosniff`, `DENY` framing, referrer policy, HSTS, permissions policy) and a
  Content-Security-Policy ✓ (ADR-018: own-origin scripts, no nonce because of prerendered shells).

## Payments

- ✓ No card data ever reaches Alterpark (Stripe-hosted payment page, no Stripe script on our pages).
- ✓ Amounts are computed server-side from the database; client values are ignored (the funnel only displays the server quote).
- ✓ Reservation confirmed **only** by a verified webhook (signature + event-id idempotency); the
  redirect page is read-only. The amount charged is compared with the server amount.
- ✓ Refunds are recorded before the provider call, idempotent (`refund:<id>` key) and audit-logged;
  customer refunds follow the cancellation rules; staff refunds require `PAYMENT_REFUND` (Phase 7).
- A restricted Stripe key limited to the needed resources is recommended.

## Abuse and privacy

- ✓ Rate limiting in PostgreSQL (fixed windows, atomic upsert) — works on serverless without extra services.
- ✓ Contact form: honeypot, minimum fill time, rate limit (bots get the same success answer); optional Turnstile later.
- IP addresses are stored only as salted hashes. GDPR: account deletion anonymises personal data
  while keeping accounting records; retention periods to confirm with the client.

## Secrets and configuration

- Secrets only in environment variables (Vercel, per environment) ✓ `.env.example` documents them; `.env*`
  is git-ignored ✓. Each feature validates its variables on first use and fails explicitly ✓.
- Preview environments use Stripe **test** keys and a separate database.
- Dependencies pinned to exact versions ✓; `npm audit --audit-level=high` runs in CI ✓.

## Audit trail

✓ In place for registration, logins (success and failure), e-mail verification, password reset and
change, profile changes, every reservation and payment state change, and every back-office action
(check-in/out, cancellations, refunds, sites, offers, rates, customers, contacts, staff, roles,
settings, CSV exports). Readable in the back office (journal d’audit, `AUDIT_LOG_READ`).

Sensitive actions (refunds, cancellations, price and capacity changes, role/permission changes,
admin account changes, settings) and every reservation/payment state change write an `AuditLog`
entry (actor, action, entity, before/after) — never secrets or card data.
