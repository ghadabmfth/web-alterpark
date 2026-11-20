import { cx } from "../lib/cx";
import { BOOKING_ICONS, FEATURE_ICONS, SERVICE_ICON_PATHS } from "@/design-system/icons/svg-data";

/* Named icon sets of the design system (static markup, never user input). */

export type FeatureIconName = keyof typeof FEATURE_ICONS;
export type BookingIconName = keyof typeof BOOKING_ICONS;
export type ServiceIconName = keyof typeof SERVICE_ICON_PATHS;

export function FeatureIcon({ name, className }: { name?: FeatureIconName; className?: string }) {
  return <span className={className} aria-hidden dangerouslySetInnerHTML={{ __html: FEATURE_ICONS[name ?? "bolt"] }} />;
}

export function BookingIcon({ name, className }: { name: BookingIconName; className?: string }) {
  return <span className={cx("ap-bk__ico", className)} aria-hidden dangerouslySetInnerHTML={{ __html: BOOKING_ICONS[name] }} />;
}

export function ServiceIcon({ name, className }: { name: ServiceIconName; className?: string }) {
  const svg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${SERVICE_ICON_PATHS[name] ?? ""}</svg>`;
  return <span className={cx("ap-sico", className)} aria-hidden dangerouslySetInnerHTML={{ __html: svg }} />;
}
