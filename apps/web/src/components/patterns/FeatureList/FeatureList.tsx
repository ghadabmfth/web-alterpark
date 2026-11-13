import { cx } from "../../lib/cx";
import { FeatureIcon, type FeatureIconName } from "../../icons/glyphs";

export interface FeatureListProps {
  items: { icon?: FeatureIconName; title: string; text?: string }[];
  columns?: 1 | 2;
  className?: string;
}

/** Liste d'atouts : pictogramme orange + titre + texte, sur 1 ou 2 colonnes. */
export function FeatureList({ items, columns, className }: FeatureListProps) {
  return (
    <ul className={cx("ap-root ap-features", columns === 1 && "ap-features--one", className)}>
      {items.map((it, i) => (
        <li key={i} className="ap-feature">
          <span className="ap-feature__ico" aria-hidden>
            <FeatureIcon name={it.icon ?? "bolt"} />
          </span>
          <span>
            <b className="ap-feature__title">{it.title}</b>
            {it.text ? <span className="ap-feature__text">{it.text}</span> : null}
          </span>
        </li>
      ))}
    </ul>
  );
}
