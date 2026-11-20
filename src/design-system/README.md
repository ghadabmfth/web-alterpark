# Design-system layer

The single place where the supplied AlterPark design system enters the code. Everything visual in
the app reads from here. The supplied documentation (charter, analysis, responsive strategy, one
sheet per component) is in [`docs/design-system/`](../../docs/design-system/README.md).

| File | Role | Edit? |
|---|---|---|
| `tokens.json` | Source of truth for every token, as supplied. | Never by hand — replace with a new delivery |
| `tokens.css` | CSS variables + type classes + `@font-face`, as supplied. Only change: font URLs point to `/fonts/`. | Never by hand |
| `fonts.css` | Digits and punctuation of Crossroads served from Montserrat 800 (from the reference bundle). | Rarely |
| `typography.css` | Fluid heading/body rules (`.ap-display`, `.ap-h2`, `.ap-body`…), verbatim from the reference bundle. | Rarely |
| `overrides.css` | **Declared** deviations from the system, each justified (see `docs/DECISIONS.md`, ADR-005). | Only with an ADR |
| `theme.css` | Tailwind v4 theme built *from* the tokens. All Tailwind defaults are reset. | When a token group is added |
| `tokens.ts` | Typed token values for non-CSS contexts (metadata, payment page, e-mails). | No |
| `design-system.test.ts` | Fails if `tokens.css` drifts from `tokens.json`, if breakpoints diverge, or if a colour literal appears outside this folder. | Extend with new rules |

Load order (`src/app/globals.css`): Tailwind → theme → tokens → fonts → typography → overrides.
The design-system files sit in the `base` cascade layer, so utilities can refine them.

## Using it

- **Typography:** pair the generated class with the fluid rule: `<h1 class="display ap-display">`,
  `<h2 class="h2 ap-h2">`, `<h3 class="h3 ap-h3">`, `<div class="ap-body">`. One `h1` per page.
  Write titles in sentence case; CSS uppercases them.
- **Colour:** `bg-surface`, `bg-surface-raised`, `text-text-secondary`, `text-primary`, `border-border`,
  status `text-error` / `bg-error-soft`… There is no other palette: `bg-blue-500` does not exist.
  `secondary` (logo only) and `accent` (stars only) follow the charter's restrictions.
- **Spacing:** `p-4` = `space-4` = 16 px. Only the system's steps exist (1, 2, 3, 4, 6, 8, 10, 12, 16, 20, 24, 30, 40).
- **Radius / shadow:** `rounded-sm|md|lg|xl|pill`, `shadow-photo|tab|elevated|focus`.
- **Layout:** `w-page` (90 %), `max-w-site` (1666 px), `max-w-nav`, `max-w-text`, `max-w-col`.
- **Breakpoints (mobile-first):** `sm` 576, `md` 768, `lg` 1024, `xl` 1280, `xxl` 1920.
- **Arbitrary values** (`p-[13px]`, `text-[#fff]`) are not allowed. A missing value is added to the
  design system first, then exposed here.

## Extending the system

The supplied system covers the public home page. The back office, tables, badges, tabs, pagination,
menus, toasts and loading states are **not** designed in it. Phase 2 adds them as *proposed*
components built only from existing tokens, each documented in `docs/design-system/extensions.md`
before it is used widely — the same "Observed / Proposed" convention the system itself uses.
