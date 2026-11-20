import { cx } from "../lib/cx";
import { SmartLink } from "../lib/link";
import { IconOrImage } from "../icons/IconOrImage";
import type { SocialItem } from "./types";

/*
 * SocialRail — design system "Navigation". Tabs fixed to the right edge (≥ 1280 px). Below, the
 * links move to the Footer (`social` prop): the charter hides the rail to keep text readable.
 * Items are required: the URLs are business data, never guessed. Wrapped in a labelled <nav>
 * landmark (the bundle renders a bare list).
 */
export interface SocialRailProps {
  items: SocialItem[];
  /** Fixed to the right edge of the window (default true). */
  fixed?: boolean;
  label?: string;
  className?: string;
}

export function SocialRail({ items, fixed = true, label = "Réseaux sociaux et espace client", className }: SocialRailProps) {
  return (
    <nav aria-label={label}>
      <ul className={cx("ap-root ap-rail", fixed && "ap-rail--fixed", className)}>
        {items.map((it, i) => (
          <li key={i}>
            <SmartLink href={it.href} className={`ap-rail--${it.tone ?? "dark"}`} aria-label={it.label} title={it.label}>
              <IconOrImage icon={it.icon} />
            </SmartLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
