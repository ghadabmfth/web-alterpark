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
| `overrides.css` | **Declared** deviations from the system tokens, each justified (see `docs/DECISIONS.md`, ADR-005). | Only with an ADR |
| `components/*.css` | Component styles of the reference bundle, split one file per component, **verbatim**, in bundle order. | Never by hand |
| `extensions/*.css` | Styles of the *proposed* extensions (`docs/design-system/extensions.md`). Tokens only: no colour literal. | Yes, with the doc |
| `overrides-components.css` | Declared deviations from supplied component styles (contrast fixes, ADR-005). | Only with an ADR |
| `icons/svg-data.ts` | Logo, pictograms and icon sets extracted mechanically from the bundle. | Never by hand |
| `illustrations/app-showcase.ts` | AppShowcase markup, verbatim from the bundle (output verified identical). | Never by hand |
| `theme.css` | Tailwind v4 theme built *from* the tokens. All Tailwind defaults are reset. | When a token group is added |
| `tokens.ts` | Typed token values for non-CSS contexts (metadata, payment page, e-mails). | No |
| `design-system.test.ts` | Fails if `tokens.css` drifts from `tokens.json`, if a component stylesheet differs from the bundle, if breakpoints diverge, or if a colour literal appears in app code or extensions. | Extend with new rules |

Load order (`src/app/globals.css`): Tailwind → theme → tokens, fonts, typography, overrides
(`base` layer) → component styles, extensions, component overrides (`components` layer) →
utilities. A utility can therefore always refine a component.

React components live in `src/components/ui/` (one file per component, grouped as in the
system: actions, navigation, content, forms, feedback, patterns, plus data and layout for the
extensions). They render the system's `ap-*` classes; they never carry their own colours.

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

The supplied system covers the public home page. Tables, badges, tabs, pagination, menus, toasts,
loading and empty states and the app layout are **extensions** built only from existing tokens and
documented in [`docs/design-system/extensions.md`](../../docs/design-system/extensions.md), with
the porting notes. Every component is shown in all its states at `/dev/design-system` (development,
or a Preview with `DESIGN_SYSTEM_GALLERY=true`).
