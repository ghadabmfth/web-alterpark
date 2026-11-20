# Design-system extensions and porting notes

The supplied AlterPark system covers the public home page. The application also needs a booking
funnel, a customer area and a back office. The components below are **extensions**, marked
*Proposé* in the same way the system marks its own proposals. Rules they follow:

- They use **only existing tokens**: no new colour, spacing, radius, shadow or font. A test fails if
  any extension stylesheet contains a colour literal.
- They reuse the system's own idioms: `surface-raised` panels with `radius-md`; the dotted white
  rule (3 px dash, 8 px period) between rows; the orange pill (`ap-eyebrow`) for badges; the
  Header dropdown panel for menus; the Modal footer for card footers; the 10 px orange filet on
  top of the sidebar; `shadow-focus` on every interactive element.
- They respect the charter: status colours always come with an icon or a word, touch targets are at
  least 44 px, and animation stops under `prefers-reduced-motion`.

Code: `src/components/ui/**` (TSX) and `src/design-system/extensions/*.css`.
Gallery: `/dev/design-system`, available in development only.

## Extensions

| Component | Purpose | Built from | Accessibility |
|---|---|---|---|
| `Button` `loading` | Feedback while a form is submitted | Existing disabled state (45 % opacity) + label swap | `aria-busy`, disabled |
| `Badge` | Reservation, payment and contact statuses | `ap-eyebrow` pill (700 14/20, leading dot), status `*-soft` backgrounds | Text is the status word |
| `Card` | Panels of the customer area and back office | `surface-raised`, `radius-md`, footer like `ap-modal__foot` | Section with heading |
| `StatTile` / `StatGrid` | Dashboard KPIs | Card surface; value in Montserrat 800 (the system's digit face) at `fs-h2` | Trend expressed in words |
| `DataTable` | Lists (reservations, payments, customers…) | Dotted rule between rows; headers like help text; numbers right-aligned | `<caption>`, `scope="col"`, focusable scroll region |
| `Pagination` | Long lists | 44 px pills; current page filled `primary` with `on-primary` text; system arrows | `nav` + `aria-current="page"`, links work without JavaScript |
| `Tabs` | Sub-pages (e.g. reservation detail / payments / history) | Orange 3 px underline (the system's filets), dotted rule under the row | Links with `aria-current` |
| `DropdownMenu` | User menu, row actions | Header dropdown panel and items | WAI-ARIA menu button (arrows, Home/End, Escape, focus return) |
| `DateTimeField` | Arrival and departure | Two native inputs in `ap-input` style, one fieldset | Legend as label; one message for the pair |
| `FilterBar` | Filters of list pages | Compact 48 px fields (height of `Button size="sm"`) on `surface-sunken` | GET form with `role="search"`; state in the URL |
| `Skeleton` / `LoadingRegion` | Loading states | `surface-sunken` blocks, gentle pulse | `aria-busy`, spoken « Chargement… », static under reduced motion |
| `EmptyState` | Empty lists | FeatureList pictogram square on `surface-raised` | Title + explanation + next action |
| `ToastProvider` / `useToast` | Feedback after an action | The system's `Alert`, stacked bottom-right, `shadow-elevated` | Polite live region; errors and warnings stay until dismissed |
| `ConfirmDialog` | Confirmation of sensitive actions (cancel, refund) | The system's `Modal` + two buttons | Modal focus trap. **No new "danger" button**: the label names the consequence |
| `PageHeader` | Top of app pages | Breadcrumbs + H1 at `h2` size (Crossroads) + actions | Single H1 per page |
| `DescriptionList` | Detail pages | Dotted rule between rows | `dl` / `dt` / `dd` |
| `AppShell` | Back office and customer area layout | `surface-sunken` sidebar (like the mobile drawer) with the 10 px orange filet; active link in `primary` with a 3 px marker | Drawer below 1024 px, `inert` while closed, Escape closes |
| `MenuIcon` | Burger of the AppShell | Same stroke (2.5 px, round caps) as the system's UI icons | Decorative; the button has a label |

## Porting notes (deviations from the reference bundle)

| Component | Bundle behaviour | Port | Reason |
|---|---|---|---|
| All | React 18 globals, `<img>` | React 19 TSX, Server Components where there is no interaction; `next/image` (hero preloaded) | Performance, SEO |
| Header, Footer | Contact details hard-coded | Props, default from `src/config/site.ts` | Business data is configuration |
| SocialRail, StoreBadges, Footer legal links | Default `#` links | Required props | No dead links in production |
| Footer | `year` defaults to the current date | `year` required | Reading the clock in a component would make every page dynamic under Cache Components |
| BookingBar | Default offers (€45 / €35) and perks including « Paiement uniquement à votre retour » | `offers` and `perks` are required props | Prices come from the database; payment is online at booking (approved Q1) |
| BookingBar | `min` date computed at render | Set after mount | Avoids a server/client hydration mismatch |
| RatingBadge | Default rating 5 | `rating` and `count` required | No invented figures |
| ReviewCard | Six avatar tints incl. an off-palette purple (#c79bff) | Five tints mapped to tokens (`primary`, `info`, `success`, `error`, `accent`) | Single palette |
| VideoModal | Detects preview sandboxes to disable embedding | `embed` defaults to true | Not relevant on the real site |
| Modal, VideoModal | Inline focus-trap code | Shared `useDialogFocus` hook | One tested implementation |
| Alert | Children inside a `<p>` | Children inside a `<div>` | Allows lists and links without invalid nesting |
| TextField, Select, Checkbox, Toggle, DateTimeField | — | `ref` and native props forwarded | Works with React Hook Form |
