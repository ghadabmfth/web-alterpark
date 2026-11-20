import { cx } from "../lib/cx";
import { apscMarkup } from "@/design-system/illustrations/app-showcase";

/*
 * AppShowcase — design system "Patterns". Animated illustration of the ALTERPARK booking app: two
 * phones drawn in HTML/CSS/SVG (home screen, then the 4-step booking flow), no image.
 * Decorative illustration exposed as one image with a text alternative; its inner markup (which
 * contains headings and text of the fake app) is hidden from assistive technologies.
 */
export interface AppShowcaseProps {
  /** Example first name shown in the app (default « Claire »). */
  firstName?: string;
  /** Floating badges (default true). */
  badges?: boolean;
  label?: string;
  className?: string;
}

export function AppShowcase({
  firstName,
  badges,
  label = "Aperçu de l’application ALTERPARK : réservation en 4 étapes (dates, véhicule, récapitulatif, confirmation avec billet).",
  className,
}: AppShowcaseProps) {
  return (
    <div
      className={cx("ap-root apsc", className)}
      role="img"
      aria-label={label}
      dangerouslySetInnerHTML={{ __html: apscMarkup({ firstName, badges }).replace('<div class="apsc__stage">', '<div class="apsc__stage" aria-hidden="true">') }}
    />
  );
}
