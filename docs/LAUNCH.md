# Launch runbook (Phase 9)

Order matters: **Preview is validated end to end before anything reaches Production.** Each step
says who acts. « Client » = Alterpark (accounts, legal content, business data); « OuiDev » = the
development team. Technical details of each setting: [`DEPLOYMENT.md`](DEPLOYMENT.md).

## A. Accounts and data the client provides

| # | Item | Who | Status |
|---|---|---|---|
| A1 | Stripe account verified (company, bank account), **test** then **live** restricted keys | Client | ⏳ |
| A2 | Sending domain for e-mails (e.g. `reservation@alterpark.fr`): DNS access for SPF / DKIM (Resend) | Client | ⏳ |
| A3 | Production domain and DNS access (e.g. `www.alterpark.fr`) | Client | ⏳ |
| A4 | Capacities per offer and the rate grid (entered in the back office, or sent to OuiDev) | Client | ⏳ |
| A5 | Marseille and Roissy: address, offers (or they stay « bientôt disponible ») | Client | ⏳ |
| A6 | Legal texts: mentions légales, CGV (incl. cancellation rules), privacy policy with retention periods | Client | ⏳ |
| A7 | Crossroads web-font licence (headings) — optional, Montserrat is used meanwhile | Client | ⏳ |

## B. Preview environment (`develop`)

| # | Step | Who |
|---|---|---|
| B1 | Vercel → Storage → create **Neon** (EU region). Create a `preview` branch; Preview variables `DATABASE_URL` / `DIRECT_DATABASE_URL` point to it | OuiDev |
| B2 | Preview variables: `AUTH_SECRET`, `IP_HASH_SALT`, `CRON_SECRET` (`openssl rand -base64 32`, different from Production), `EMAIL_TRANSPORT=console`, `EMAIL_FROM`, `ADMIN_NOTIFICATION_EMAIL`, `SEED_SUPER_ADMIN_EMAIL` / `_PASSWORD` | OuiDev |
| B3 | Stripe **test** restricted key + webhook endpoint on the preview URL (protection bypass for automation) → `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | OuiDev + Client (A1) |
| B4 | Redeploy `develop`. The build checks the configuration (`scripts/check-deploy-env.ts`) and stops on dangerous mistakes | — |
| B5 | `npm run smoke -- <preview URL> --expect-database` | OuiDev |
| B6 | Sign in as super administrator, change the password, delete `SEED_SUPER_ADMIN_*`; open a site with **test** rates; real Stripe test-mode run: card 4242, 3-D Secure 4000 0025 0000 3155, declined 4000 0000 0000 0002, free cancellation (refund visible in Stripe), staff refund | OuiDev |
| B7 | Client acceptance on Preview: booking, customer area, back office | Client |

## C. Production (`main`)

| # | Step | Who |
|---|---|---|
| C1 | Neon `main` branch for Production; point-in-time restore ≥ 7 days | OuiDev |
| C2 | Production variables (see DEPLOYMENT.md §2): new secrets, `EMAIL_TRANSPORT=resend`, `RESEND_API_KEY`, live Stripe restricted key + live webhook secret, `ERROR_WEBHOOK_URL`, `NEXT_PUBLIC_SITE_URL=https://<domain>` — **not** `SITE_INDEXABLE` yet | OuiDev |
| C3 | GitHub secrets `BACKUP_DATABASE_URL` (read-only role) and `BACKUP_PASSPHRASE`; run « Database backup » once by hand, then a **restore drill** (`scripts/restore-drill.sh`) | OuiDev |
| C4 | Release PR `develop` → `main`, green CI (quality + end-to-end), merge | OuiDev, client approval |
| C5 | Domain attached in Vercel; `npm run smoke -- https://<domain> --expect-database`; first super administrator as in B6 | OuiDev |
| C6 | Enter real capacities, rates and legal texts; open the sites (back office refuses an incomplete site) | Client / OuiDev |
| C7 | One real booking paid with a real card, then refunded from the back office | Client |
| C8 | **Indexing**: `SITE_INDEXABLE=true` on Production, redeploy, `npm run smoke -- https://<domain> --indexable`, submit `sitemap.xml` in Search Console | OuiDev |

## D. After launch

- Uptime monitor on `https://<domain>/api/health` (503 when the database is unreachable).
- Errors: `ERROR_WEBHOOK_URL` channel, or Vercel Logs → search `alterpark.error`.
- Quarterly restore drill; Hobby plan runs the cron once a day (Pro: every 10 minutes).
