import { cx } from "../../lib/cx";
import { IconOrImage } from "../../lib/IconOrImage";

export interface HeroStep {
  /** Pictogramme du système (stepReserver, fideliteCumulez…) ou URL d'image. */
  icon: string;
  title: string;
  text?: string;
}

export interface StepsProps {
  items: HeroStep[];
  /** hero : 4 étapes, légende Nunito · loyalty : 3 étapes, texte Montserrat */
  variant?: "hero" | "loyalty";
  titleAs?: "h2" | "h3" | "h4";
  className?: string;
}

/** Suite d'étapes numérotées : pictogramme orange, grand chiffre fantôme, titre en Crossroads, légende, filets pointillés. */
export function Steps({ items, variant = "hero", titleAs: T = "h3", className }: StepsProps) {
  return (
    <div className={cx("ap-root ap-steps", `ap-steps--${variant}`, className)}>
      <ol>
        {items.map((it, i) => (
          <li key={i} className="ap-step">
            <div className={cx("ap-step__visual", variant === "loyalty" && "ap-step__visual--loyalty")} aria-hidden>
              <span className="ap-step__num">{String(i + 1)}</span>
              <IconOrImage src={it.icon} className="ap-step__icon" />
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
