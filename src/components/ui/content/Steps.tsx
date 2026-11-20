import { cx } from "../lib/cx";
import { IconOrImage } from "../icons/IconOrImage";

/*
 * Steps — design system "Content". Numbered steps: orange pictogram, big ghost numeral,
 * Crossroads title, caption, dotted separators. `hero`: 4 steps (Nunito caption);
 * `loyalty`: 3 steps (Montserrat text).
 */
export interface StepItem {
  /** System pictogram name (e.g. "stepReserver") or image URL. */
  icon: string;
  title: string;
  text?: string;
}

export interface StepsProps {
  items: StepItem[];
  variant?: "hero" | "loyalty";
  titleAs?: "h2" | "h3" | "h4";
  className?: string;
}

export function Steps({ items, variant = "hero", titleAs: T = "h3", className }: StepsProps) {
  return (
    <div className={cx("ap-root ap-steps", `ap-steps--${variant}`, className)}>
      <ol>
        {items.map((it, i) => (
          <li key={i} className="ap-step">
            <div className={cx("ap-step__visual", variant === "loyalty" && "ap-step__visual--loyalty")} aria-hidden>
              <span className="ap-step__num">{String(i + 1)}</span>
              <IconOrImage icon={it.icon} className="ap-step__icon" />
            </div>
            <div className="ap-step__body">
              <T className="ap-step__title">
                <span className="ap-sr">{`Étape ${i + 1} : `}</span>
                {it.title}
              </T>
              {it.text ? <p className="ap-step__text">{it.text}</p> : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
