# Deployment (Vercel)

The Vercel project `web-alterpark` builds from GitHub: `main` → Production, every other branch and
pull request → Preview. `vercel.json` pins the install (npm 11), the build command and the cron job.

## 1. Database (required for accounts, contact and, later, bookings)

PostgreSQL 16, EU region. Recommended: **Neon through the Vercel Marketplace** (Project → Storage →
Create → Neon). It injects `DATABASE_URL` (pooled) and `DATABASE_URL_UNPOOLED` (direct).

- Use **one database branch for Production and another for Preview** (Neon branching). Preview
  must never write to production data.
- Set `DIRECT_DATABASE_URL` to the direct (unpooled) URL: migrations need it.
- `DATABASE_URL` must be available at **build** time: `npm run build:vercel` runs
  `prisma migrate deploy` (applies new migrations only, never resets) and the idempotent seed
  before `next build`. Without a database, the step is skipped and the site serves the
  client-supplied catalogue (accounts and contact sending are then unavailable).

## 2. Environment variables

| Variable | Production | Preview | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://<domaine>` | preview URL or empty | Canonical URLs, e-mail links |
| `DATABASE_URL` | ✓ (prod branch) | ✓ (preview branch) | Pooled URL; also needed at build |
| `DIRECT_DATABASE_URL` | ✓ | ✓ | Direct URL, for migrations |
| `AUTH_SECRET` | ✓ | ✓ (different) | `openssl rand -base64 32`. Changing it signs everyone out |
| `IP_HASH_SALT` | ✓ | ✓ | 32+ random chars |
| `CRON_SECRET` | ✓ | — | 32+ random chars; Vercel Cron sends it |
| `EMAIL_TRANSPORT` | `resend` | `console` | `console` prints e-mails in the function logs |
| `RESEND_API_KEY` | ✓ | — | Domain verified in Resend (SPF/DKIM) |
| `EMAIL_FROM` | `ALTERPARK <reservation@<domaine>>` | any | Must be on the verified domain |
| `ADMIN_NOTIFICATION_EMAIL` | ✓ | ✓ | Receives contact messages |
| `SITE_INDEXABLE` | `true` **at launch only** | — | Opens robots.txt / meta robots |
| `DESIGN_SYSTEM_GALLERY` | — | `true` | Component gallery on previews |
| `SEED_SUPER_ADMIN_EMAIL` / `_PASSWORD` | once | — | See §3, then delete |

| `STRIPE_SECRET_KEY` | live key (restricted `rk_live_`) | test key `sk_test_` / `rk_test_` | Payment stays disabled until set |
| `STRIPE_WEBHOOK_SECRET` | from the live endpoint | from the test endpoint | `whsec_…`, one per endpoint |

## 3. First super administrator

1. Set `SEED_SUPER_ADMIN_EMAIL` and `SEED_SUPER_ADMIN_PASSWORD` (12+ characters) on Production.
2. Redeploy: the seed creates the account if it does not exist (it never changes an existing one).
3. Sign in at `/connexion`, open **Mon profil**, change the password.
4. **Delete both variables** in Vercel.

## 4. Stripe

1. Stripe dashboard → Developers → API keys: create a **restricted key** with write access to
   Checkout Sessions and Refunds (test mode for Preview, live mode for Production).
2. Developers → Webhooks → Add endpoint: `https://<domain>/api/webhooks/stripe` (Preview: the
   preview URL; Vercel Deployment Protection must let Stripe through — use a protection bypass for
   automation or a dedicated preview domain). Events:
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
   `checkout.session.async_payment_failed`, `checkout.session.expired`, `refund.created`,
   `refund.updated`, `refund.failed`.
3. Copy the endpoint's signing secret into `STRIPE_WEBHOOK_SECRET`, the key into
   `STRIPE_SECRET_KEY`, redeploy. The « Payer » button appears in the funnel.
4. Test mode: card `4242 4242 4242 4242`, 3-D Secure `4000 0025 0000 3155`, declined
   `4000 0000 0000 0002`. Locally: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.

## 5. Scheduled job

`/api/cron/notifications` retries e-mails that failed, marks unpaid holds past their time as EXPIRED (availability already ignores them), retries refunds Stripe could not take yet, and purges old rate-limit counters. E-mails
are normally sent right after each request; the job is a safety net. The Hobby plan allows **one run
per day** (configured at 03:17 UTC); on Pro, set `*/10 * * * *` in `vercel.json`.

## 6. Backups and recovery

- Neon: point-in-time restore (retention depends on the plan — 7 days minimum recommended for
  Production) and branch-from-timestamp to inspect past data without touching production.
- Weekly logical export kept outside Neon: `pg_dump --format=custom "$DIRECT_DATABASE_URL"` to an
  encrypted storage bucket (to automate in Phase 9).
- Test a restore on a scratch branch before launch, then quarterly.

## 7. Release checklist (Phase 9)

Preview validated end to end → `develop` merged into `main` → Production deployment → smoke
tests (home, booking, login, back office) → `SITE_INDEXABLE=true` → sitemap submitted.
