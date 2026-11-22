# Security review — Phase 8 (22/11/2026)

Review of the application before deployment, by threat. « Tested » means an automated test in
CI (unit, integration on PostgreSQL, or end-to-end on a production build) covers it.

| Area | Check | Result |
|---|---|---|
| Authentication | Argon2id, constant-time answer for unknown accounts, generic errors | ✅ tested (unit + e2e: same message for wrong password / unknown account) |
| | Login rate limits inside Auth.js `authorize` (covers the raw endpoint) | ✅ tested |
| | Session revocation (`sessionVersion`) on password change/reset, role change, disable, erasure | ✅ tested |
| | Reset / verification tokens single-use, hashed, expiring; reset never reveals an account | ✅ tested |
| | Registration reveals that an e-mail already has an account | Accepted: needed to tell the person to sign in; rate-limited (5/h/IP) |
| Authorisation | Back office: page + Server Action + service each check the permission | ✅ tested (every admin command refused without its permission) |
| | Customers get « not found » on `/admin`, 404 on the export route | ✅ e2e. The page answers HTTP 200 with the not-found content once streaming started (Cache Components); `noindex` |
| | Ownership in queries (`userId` in the `WHERE`): another customer's reservation is not found | ✅ e2e + integration |
| | Last active super administrator protected; no self role change / self disable | ✅ tested |
| Open redirect | `?suivant=` after sign-in | ⚠️ **Fixed in this phase**: `/\t/evil.example` (tab stripped by browsers) passed the old check; now control characters, spaces and backslashes are refused and the path must resolve on our origin — unit-tested |
| Injection | Prisma parameterised queries; the few raw queries are tagged templates | ✅ reviewed |
| | React escaping; `dangerouslySetInnerHTML` only for static SVG, JSON-LD (`<` escaped) and the supplied showcase markup (escapes its input — test added) | ✅ reviewed |
| | E-mail templates escape HTML; subjects contain no free text | ✅ reviewed |
| | CSV export neutralises cells starting with `= + - @` | ✅ tested |
| CSRF | Server Actions: POST + Origin check by Next.js; Auth.js CSRF token; webhook by signature; cron by bearer secret; client-error endpoint same-origin only | ✅ |
| Payments | Amount from the database; webhook signature; event idempotency; amount checked on receipt; refunds never above what was paid (lock) | ✅ tested (incl. duplicate and out-of-order events, concurrent refunds) |
| | Stripe emulator reachable only with **test** keys | ✅ unit-tested |
| Abuse | Rate limits: login, sign-up, reset, contact, quotes, reservation changes, client error reports | ✅ |
| | Contact spam: honeypot + minimum fill time | ✅ |
| Headers | CSP (own-origin scripts, no framing, forms to self, no plugins), HSTS, nosniff, DENY framing, referrer policy, permissions policy, no `x-powered-by` | ✅ e2e (headers) — and **zero CSP violation** on public pages (e2e) |
| Privacy | IPs stored as salted hashes; logs never contain query strings (tokens), headers or bodies | ✅ tested (`report.ts`) |
| | Erasure: self-service and back office; refused while a booking is in progress | ✅ tested (integration + e2e) |
| | Retention periods (reservations, contact messages, audit log) | ⏳ to confirm with the client (accounting: 10 years for invoices) |
| Secrets | No secret in the repository (scan for live keys, AWS keys, private keys) ; `.env*` ignored; per-feature validation | ✅ |
| Dependencies | Exact versions; `npm audit --audit-level=high` in CI: 0 vulnerabilities | ✅ |

## Recommendations before launch (Phase 9)

1. Restricted Stripe key (Checkout Sessions + Refunds), webhook endpoint with only the 7 listed events.
2. Vercel: protect Preview deployments (Vercel Authentication), keep Production public.
3. `ERROR_WEBHOOK_URL` (or a Vercel Log Drain) so errors reach someone.
4. Confirm data-retention periods and publish them in the privacy policy (texts still to supply).
5. Turnstile on the contact form if spam appears (hook already isolated in the action).
