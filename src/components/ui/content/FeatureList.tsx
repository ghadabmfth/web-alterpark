import { cx } from "../lib/cx";
import { FeatureIcon, type FeatureIconName } from "../icons/sets";

/** FeatureList — design system "Content". Orange pictogram in a tinted square, bold title, 16 px text. */
export interface FeatureListProps {
  items: { icon?: FeatureIconName; title: string; text?: string }[];
  columns?: 1 | 2;
  className?: string;
}

export function FeatureList({ items, columns, className }: FeatureListProps) {
  return (
    <ul className={cx("ap-root ap-features", columns === 1 && "ap-features--one", className)}>
      {items.map((it, i) => (
        <li key={i} className="ap-feature">
          <FeatureIcon name={it.icon} className="ap-feature__ico" />
          <span>
            <b className="ap-feature__title">{it.title}</b>
            {it.text ? <span className="ap-feature__text">{it.text}</span> : null}
          </span>
        </li>
      ))}
    </ul>
  );
}
