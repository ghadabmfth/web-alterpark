import type { ReactNode } from "react";
import { cx } from "../lib/cx";

/* Pictogrammes au trait de bundle.js, auparavant injectés en HTML (dangerouslySetInnerHTML),
   convertis en JSX. Tous suivent currentColor. */

const LINE = { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" } as const;

/* ---------- FeatureList (FEATURE_ICO) ---------- */
export type FeatureIconName = "bolt" | "ticket" | "gift" | "pin" | "shield" | "bus";
const FEATURE: Record<FeatureIconName, ReactNode> = {
  bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7z" />,
  ticket: (
    <>
      <path d="M3 8a2 2 0 0 0 0 4v5h18v-5a2 2 0 0 1 0-4V3H3z" transform="translate(0 2)" />
      <path d="M14 5v14" strokeDasharray="2 2.5" />
    </>
  ),
  gift: (
    <>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M5 12v8h14v-8M12 8v12M12 8c-2-4-6-4-6-1.5S9 8 12 8c3 0 6 1 6-1.5S14 4 12 8" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  bus: (
    <>
      <rect x="4" y="3" width="16" height="15" rx="3" />
      <path d="M4 11h16M7 21v-3M17 21v-3" />
    </>
  ),
};

export function FeatureIcon({ name }: { name: FeatureIconName }) {
  return (
    <svg viewBox="0 0 24 24" strokeWidth={2} {...LINE}>
      {FEATURE[name] ?? FEATURE.bolt}
    </svg>
  );
}

/* ---------- ServiceCard / Highlights (SERVICE_ICO) ---------- */
export type ServiceIconName = "evCharger" | "seatSpray" | "carWash" | "carDoc" | "thumbStars" | "stopwatch" | "medal" | "plantHand";
const SERVICE: Record<ServiceIconName, ReactNode> = {
  evCharger: (
    <>
      <rect x="4" y="3" width="10" height="18" rx="2" />
      <path d="M2 21h14M9.5 6.5 7.5 10.5h4l-2 4" />
      <path d="M14 9h2.5A1.5 1.5 0 0 1 18 10.5V16a1.5 1.5 0 0 0 3 0V8l-2.5-2.5" />
    </>
  ),
  seatSpray: (
    <>
      <path d="M5 3.5a1.5 1.5 0 0 1 3 0V10l1.5 4H14a2 2 0 0 1 2 2v1H6.5L4 10z" />
      <path d="M6 20.5h9M9 17v3.5" />
      <path d="M17 10h3v3.5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1zM17.5 10V8h2v2M19.5 8.5H21M15.5 6.5l-1-.5M15.5 8.2l-1.2.2M15.8 4.8l-.6-.9" />
    </>
  ),
  carWash: (
    <>
      <path d="M5 14l1.6-4.2a1 1 0 0 1 .9-.8h9a1 1 0 0 1 .9.8L19 14M4 14h16v4H4zM6 18v2M18 18v2" />
      <circle cx="7.5" cy="16" r=".9" />
      <circle cx="16.5" cy="16" r=".9" />
      <circle cx="8" cy="5" r="1.5" />
      <circle cx="12" cy="3.5" r="1.2" />
      <circle cx="16" cy="5.5" r="1.8" />
      <circle cx="12.3" cy="7.3" r=".9" />
    </>
  ),
  carDoc: (
    <>
      <rect x="5" y="2.5" width="14" height="19" rx="2" />
      <path d="M8.2 10.5l1-2.5h5.6l1 2.5M7.5 10.5h9V13h-9zM9 13v1M15 13v1" />
      <path d="M8 17.5h2.5M12.5 17.5H16M8 19.5h8" />
    </>
  ),
  thumbStars: (
    <>
      <path d="M8 21v-8l3-6a1.6 1.6 0 0 1 3 1l-.7 3.5H18a2 2 0 0 1 2 2.3l-1 5.5a2 2 0 0 1-2 1.7z" />
      <rect x="3.5" y="13" width="4.5" height="8" rx="1" />
      <path d="M5 3.5l.6 1.2 1.3.2-.9.9.2 1.3L5 6.5l-1.2.6.2-1.3-.9-.9 1.3-.2zM18.5 2.5l.6 1.2 1.3.2-.9.9.2 1.3-1.2-.6-1.2.6.2-1.3-.9-.9 1.3-.2z" />
    </>
  ),
  stopwatch: (
    <>
      <circle cx="13" cy="13.5" r="7.5" />
      <path d="M13 9.5v4l2.6 2M11 2.5h4M13 2.5V6M19.5 6.5 21 5M2 11h3M1.5 14h3M2.5 17h3" />
    </>
  ),
  medal: (
    <>
      <circle cx="12" cy="9" r="6" />
      <path d="M12 6.4l.8 1.7 1.9.3-1.4 1.3.3 1.8-1.6-.9-1.6.9.3-1.8-1.4-1.3 1.9-.3z" />
      <path d="M8.6 13.8 7 21l5-2.6 5 2.6-1.6-7.2" />
    </>
  ),
  plantHand: (
    <>
      <path d="M2 17h3.5l4.3 1.6a2 2 0 0 0 1.5 0L18.6 15a1.5 1.5 0 0 0-1.2-2.7L12.8 14H10" />
      <path d="M5.5 15.5l2.3-1.7a3 3 0 0 1 1.8-.6h3.2" />
      <path d="M12 11V5.5M12 8.2c0-2.6 2-4.2 4.6-4.2 0 2.6-2 4.2-4.6 4.2zM12 9.6c0-2-1.5-3.6-3.6-3.6 0 2 1.6 3.6 3.6 3.6z" />
    </>
  ),
};

/** `serviceIcon(nom, classe)` du bundle : span.ap-sico contenant le pictogramme. */
export function ServiceIcon({ name, className }: { name: ServiceIconName; className?: string }) {
  return (
    <span className={cx("ap-sico", className)} aria-hidden>
      <svg viewBox="0 0 24 24" strokeWidth={1.5} {...LINE}>
        {SERVICE[name]}
      </svg>
    </span>
  );
}

/* ---------- BookingBar (BK_ICO) ---------- */
export type BookingIconName = "search" | "cal" | "clock" | "dep" | "ret" | "arrow" | "check" | "card" | "shield" | "h24" | "plane";
const BOOKING: Record<BookingIconName, ReactNode> = {
  search: (
    <svg viewBox="0 0 24 24" strokeWidth={2.6} {...LINE}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5L20 20" />
    </svg>
  ),
  cal: (
    <svg viewBox="0 0 24 24" strokeWidth={2} {...LINE}>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 10h16M9 3v4M15 3v4" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" strokeWidth={2} {...LINE}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  dep: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M2.5 19h19v2h-19zM22.07 9.64c-.21-.8-1.04-1.28-1.84-1.06L14.92 10 8 3.57l-1.93.51 4.14 7.17-4.97 1.33-1.97-1.54-1.45.39 2.59 4.49 16.6-4.43c.81-.23 1.28-1.05 1.06-1.85z" />
    </svg>
  ),
  ret: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M2.5 19h19v2h-19zM9.68 13.27l4.35 1.16 5.31 1.42c.8.21 1.62-.26 1.84-1.06.21-.8-.26-1.62-1.06-1.84l-5.31-1.42-2.76-9.02L10.12 2v8.28L5.15 8.95l-.93-2.32-1.45-.39v5.17l1.6.43 5.31 1.43z" />
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 24 24" strokeWidth={2.4} {...LINE}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" strokeWidth={2.6} {...LINE}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  ),
  card: (
    <svg viewBox="0 0 24 24" strokeWidth={2} {...LINE}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18M7 15h4" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" strokeWidth={2} {...LINE}>
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  h24: (
    <svg viewBox="0 0 24 24" strokeWidth={2} {...LINE}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5h4" />
    </svg>
  ),
  plane: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
    </svg>
  ),
};

/** `bkIco(nom, classe)` du bundle : span.ap-bk__ico décoratif. */
export function BookingIcon({ name, className }: { name: BookingIconName; className?: string }) {
  return (
    <span className={cx("ap-bk__ico", className)} aria-hidden>
      {BOOKING[name]}
    </span>
  );
}
