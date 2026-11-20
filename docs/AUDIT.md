# Phase 1 — Audit report

Date: 20 November 2026 · Scope: supplied design system (`AlterPark.zip`), existing repository, toolchain.
Companion documents: [ARCHITECTURE](ARCHITECTURE.md) · [DATA-MODEL](DATA-MODEL.md) ·
[SECURITY](SECURITY.md) · [ROADMAP](ROADMAP.md) · [DECISIONS](DECISIONS.md).

---

## 1. Design-system audit

**Source.** `AlterPark.zip`: `tokens.json` (86 tokens), generated `tokens.css`, a React 18 reference
bundle (`bundle.js` / `bundle.css`, 30 components), one documentation sheet and HTML preview per
component, brand assets (logo, 13 pictograms, 5 photos, partner badges) and fonts. It was drawn from a
single Figma page (home, desktop 1920 px); every token states whether it is **observed** in the
mock-up or **proposed** by the system author. Copied to `docs/design-system/` (documentation and
reference bundle) and `src/design-system/` (tokens), `public/brand/` and `public/fonts/` (assets).

### Visual identity

| Area | Rules extracted |
|---|---|
| Theme | **Dark only.** One page background `surface` #313131; `surface-raised` #3d3d3d (fields, cards, modal); `surface-sunken` #262626. No light mode, no white section. |
| Brand colour | `primary` #F6921E: buttons, links, icons, digits and punctuation in titles, 10 px rules. Never large fills except buttons. Hover lightens (`primary-hover` #F9A548), press darkens (`primary-active` #E8850F). |
| Restricted colours | `secondary` #F05A28 logo only; `accent` #F6BB04 rating stars only. |
| Text | `text-primary` white, `text-secondary` #D9D9D9 (help, metadata), `text-muted` #ADADAD (placeholders). |
| Status (proposed) | `success`, `warning`, `error`, `info` + `*-soft` backgrounds. Always paired with an icon **and** a word. |
| Typography | Titles: Crossroads stencil, UPPERCASE, 0.08em tracking, words white, digits/punctuation orange (`accentTitle`). UI and subtitles: Montserrat Bold. Body: Montserrat Light 16 px, line-height 26 → 32 px. Nunito only for two caption styles. Fluid sizes: display 26 → 44, h2 22 → 36, h4 20 → 24. One H1 per page. |
| Spacing | 4 px base, steps 1-2-3-4-6-8-10-12-16-20-24-30-40 (4 → 160 px). Section gaps: 64 (mobile) → 120 px (desktop), 160 px after hero. Title → text 32 px, text → button 64 px. |
| Grid | Content 90 % of viewport, max 1666 px; nav 1500 px; centred text 1160 px; text column 780 px. |
| Radii | Pill buttons; photos 33 px; banner 20 px; fields/badge 15 px; tabs 10 px. |
| Shadows | `shadow-photo`, `shadow-tab`, `shadow-elevated` (menus, modal), `shadow-focus` (2 px surface + 2 px white ring on every interactive element). |
| Separators | 1 px white dashed (3/5) between steps and accordion items. No decorative solid borders. |
| Motion | 150 / 250 / 400 ms, one easing curve; disabled under `prefers-reduced-motion`. |
| Breakpoints | Mobile-first: 576 / 768 / 1024 / 1280 / 1920. Components use container queries. |
| Iconography | Inline SVG following `currentColor`; UI icons (proposed) 2.5 px stroke, round caps. |
| Tone | French, *vouvoiement*, verbs on buttons (« Réservez maintenant »), concrete reassurance (figures, security, free shuttle), at most one « ! » per title, no emoji. |

### Component inventory (30)

| Group | Components |
|---|---|
| Actions | Button (primary / secondary / ghost, `sm`, `fullWidth`, loading), IconButton |
| Navigation | Header (sticky, burger < 1024 px), Breadcrumbs, SocialRail, Footer |
| Content | SectionHeading, Steps, RatingBadge, Stars, ReviewCard, ReviewCarousel, StoreBadges, Accordion, FeatureList, ServiceCard, Highlights |
| Forms | TextField (text, e-mail, password, phone, textarea), Select (native), Checkbox, RadioGroup, Toggle |
| Feedback | Alert (4 statuses), Modal, VideoModal |
| Patterns | Hero, MediaSection, Banner, AppShowcase, **BookingBar** (site toggle, dates, results with the two services) |

Every interactive component documents hover, focus-visible, active, disabled and error states.

### Findings

| # | Finding | Impact | Handling |
|---|---|---|---|
| D1 | White text on orange buttons = **2.32:1**, below WCAG AA. The system keeps it at the client's request and names an alternative. | Accessibility | `overrides.css` uses #313131 (5.6:1, the system's own `surface`). **Client confirmation needed** (ADR-005). |
| D2 | Crossroads is licensed "personal use" only; it has no punctuation and watermarks digits. | Legal, launch blocker | Not committed (git-ignored). Titles fall back to Montserrat until a commercial web licence is bought (ADR-006). Digits/punctuation already come from Montserrat 800. |
| D3 | Rating stars are Font Awesome 6 **Pro** paths. | Licence | Only the exported path is used; confirm OuiDev/client holds a Pro licence, or redraw. |
| D4 | Nunito is referenced (2 caption styles) but not supplied. | Minor | Falls back to Montserrat; add the font (OFL) in Phase 2 if the badge needs it. |
| D5 | `tokens.css` defines global classes with generic names (`.label`, `.button`, `.link`, `.nav`). | Style collisions | Loaded in the `base` cascade layer, below utilities; never used as component hooks. |
| D6 | The generated `.display` / `.h2` classes have fixed sizes; the fluid sizes live in the bundle's `.ap-*` rules. `text-body` freezes 32 px line-height while the README says 26 → 32. | Responsive fidelity | `typography.css` ports the fluid rules verbatim; `overrides.css` aligns `text-body` with the README. |
| D7 | The system covers only the **public home page**. No table, badge, tabs, pagination, dropdown menu, date picker, skeleton, toast, empty state, sidebar navigation or KPI tile; no back-office layout. | Phase 2 scope | Add as *proposed* components from existing tokens only, documented before wide use. The back office stays in the same dark theme — no new palette. |
| D8 | `BookingBar` reveals the business model: **two services per site** — ALTERPARK (shuttle, "most requested") and ALTERECO (no shuttle, 15 min walk) — "from" prices €45 / €35 "to be verified", and the legacy promise « Paiement uniquement à votre retour ». | Business rules | Data model has Parking → Offer → Price. Pay-on-return conflicts with the mandatory online payment: **client decision needed** (Q1). |
| D9 | Reviewer photos are deliberately not supplied (personal data); `ReviewCard` shows initials. | — | Keep. Real Google reviews require the Places API or a curated, authorised list. |
| D10 | Bundle targets React 18 globals (`window.AlterPark`). | Porting | Components are re-implemented in TSX (React 19, Server Components by default), keeping class names and props of `index.d.ts`. The bundle is a reference, never loaded. |

---

## 2. Existing project audit

**Found:** 14 commits on `main` (13–16 Nov 2026): an npm-workspaces monorepo with a Next.js 16.4.3 front
end, a design-system package, a headless WordPress theme and a WordPress booking plugin (PHP, MySQL,
HMAC-signed REST API, Stripe planned inside WordPress), a full WordPress distribution packaged by
Composer, and CI for both stacks.

**State at audit time:**

- `next build` **failed** outside CI with `SecurityFatalError`: Next.js 16.4.3 is affected by seven
  published advisories (fixed in 16.4.6). A Vercel deployment would have failed.
- The design-system copy was **stale**: `tokens.css` disagreed with `tokens.json` on `primary-hover`
  (#FFFFFF instead of #F9A548), `primary-active` and `on-primary`, and a patch file re-declared
  values the newer delivery already contains.
- The WordPress plugin was a skeleton (schema, installer, health check, HMAC guard — ~680 lines);
  no availability, pricing, payment or back-office logic existed yet.
- The architecture (WordPress + MySQL as system of record) contradicts the requested stack
  (PostgreSQL, Prisma, Auth.js, Next.js back office).

**Decision:** at the client's request, all previous work was **removed** and the project restarted
from zero (ADR-001). Nothing was carried over except the supplied design system, re-imported from the
ZIP. The previous work remains recoverable from Git history (last commit `e8ef96d`).

**New foundation verified:** lint ✓ · strict TypeScript ✓ · 19 unit tests ✓ · Prisma schema valid ✓
and applied to a disposable PostgreSQL 16 database (19 tables, 16 enums, 58 indexes, 27 foreign keys) ✓ ·
production build ✓ · `npm audit` 0 vulnerabilities ✓ · rendered at 390 px and 1440 px with the
expected tokens, fonts and fluid sizes ✓.

---

## 3. Open questions for the client

Every rule below is implemented as a **configurable value** with the stated default, so development
is not blocked; the answers only change data.

| # | Question | Default used |
|---|---|---|
| Q1 | Online payment at booking (requested) or pay on return (legacy, shown in the design system)? Or deposit? | Full online payment at booking |
| Q2 | Can customers book without an account? | Account required; created inline in the booking flow (ADR-011) |
| Q3 | Capacity of each service at each site; real addresses, opening hours, shuttle details. | Sites seeded as `DRAFT`; not bookable until filled in |
| Q4 | Price grid per service (by day count, season). Are €45 / €35 "from" prices current? | Configurable rate rows; no price is invented |
| Q5 | Minimum delay before arrival, maximum stay, booking horizon. | 2 h, 60 days, 365 days |
| Q6 | Cancellation and refund policy (free until when? fees? partial refunds?). | Free until 24 h before arrival; later = staff decision |
| Q7 | Is a day counted per started 24 h, or per calendar day? | Per started 24 h (as in `BookingBar`) |
| Q8 | Modification of a booking (dates, vehicle) — allowed, with price difference? | Not in v1; cancel and rebook |
| Q9 | Loyalty programme (« 10 points par euro ») and mobile app shown on the home page — in scope? | Out of scope for v1, content only |
| Q10 | Invoices: required on payment? Company details (SIRET, VAT) for invoices and legal pages. | Stripe receipt; invoices planned for Phase 7 |
| Q11 | White or #313131 text on orange buttons (D1)? | #313131 (accessible) |
| Q12 | Crossroads commercial licence and Font Awesome Pro licence (D2, D3). | Montserrat fallback |
| Q13 | E-mail sending domain and provider (Resend proposed); hosting region for the database (EU). | Console transport in development |
