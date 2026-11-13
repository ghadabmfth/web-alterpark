import type { ReactNode } from "react";
import { cx } from "../../lib/cx";
import type { Href, ImageSource } from "../../lib/types";
import { accentTitle } from "../../lib/accentTitle";
import { ApImage } from "../../lib/ApImage";
import { TypeTitle } from "../../content/TypeTitle/TypeTitle";
import { Steps, type HeroStep } from "../../content/Steps/Steps";
import { Button } from "../../actions/Button/Button";

export interface HeroProps {
  title: string;
  /** effet machine à écrire (défaut true) */
  typing?: boolean;
  intro?: string;
  /** Photo de fond (préchargée). Le bundle avait une photo par défaut, non versionnée. */
  image?: ImageSource;
  steps?: HeroStep[];
  cta?: Href;
  /** barre de réservation sous l'introduction */
  booking?: ReactNode;
  id?: string;
  children?: ReactNode;
  className?: string;
}

/** Ouverture de l'accueil : photo plein cadre voilée, H1 en Crossroads, introduction, étapes et bouton. */
export function Hero({ title, typing, intro, image, steps, cta, booking, id = "hero-title", children, className }: HeroProps) {
  return (
    <section className={cx("ap-root ap-hero", className)} aria-labelledby={id}>
      <div className="ap-hero__bg" aria-hidden>
        {image ? <ApImage src={image} alt="" fill priority sizes="100vw" /> : null}
      </div>
      <div className="ap-hero__content">
        {typing === false ? (
          <h1 id={id} className="display ap-display">
            {accentTitle(title)}
          </h1>
        ) : (
          <TypeTitle as="h1" id={id} className="display ap-display">
            {accentTitle(title)}
          </TypeTitle>
        )}
        {intro ? <p className="body ap-body">{intro}</p> : null}
        {booking ? <div className="ap-hero__booking">{booking}</div> : null}
        {steps ? (
          <div className="ap-hero__steps">
            <Steps variant="hero" items={steps} titleAs="h2" />
          </div>
        ) : null}
        {cta ? (
          <Button href={cta.href} onClick={cta.onClick}>
            {cta.label}
          </Button>
        ) : null}
        {children}
      </div>
    </section>
  );
}
