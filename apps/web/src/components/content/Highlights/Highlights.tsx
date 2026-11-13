import type { CSSProperties } from "react";
import { cx } from "../../lib/cx";
import { accentTitle } from "../../lib/accentTitle";
import { ServiceIcon, type ServiceIconName } from "../../icons/glyphs";

export interface HighlightsProps {
  items: { icon: ServiceIconName; title: string; text: string }[];
  titleAs?: "h2" | "h3";
  className?: string;
}

/** Arguments : pictogramme au trait, titre en Crossroads, texte court ; 4 colonnes en desktop. */
export function Highlights({ items, titleAs: T = "h3", className }: HighlightsProps) {
  return (
    <div className={cx("ap-root ap-hl-wrap", className)}>
      <ul className="ap-hl">
        {items.map((it, i) => (
          <li key={i} className="ap-hl__item" style={{ "--i": i } as CSSProperties}>
            <ServiceIcon name={it.icon} className="ap-hl__ico" />
            <T className="ap-hl__title">{accentTitle(it.title)}</T>
            <p className="ap-hl__text">{it.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
