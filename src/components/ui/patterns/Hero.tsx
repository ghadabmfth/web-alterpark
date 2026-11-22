import Image from "next/image";
import type { ReactNode } from "react";
import { cx } from "../lib/cx";
import { assets, type BrandImage } from "../lib/assets";
import { accentTitle } from "../lib/accent-title";
import { TypeTitle } from "../content/TypeTitle";
import { Steps, type StepItem } from "../content/Steps";
import { Button } from "../actions/Button";
import type { LinkAction } from "../navigation/types";

/*
 * Hero — design system "Patterns". Full-bleed veiled photo (preloaded: it is the LCP image),
 * Crossroads H1 (the page's only H1), intro, optional booking bar, steps and call to action.
 */
export interface HeroProps {
  title: string;
  /** Typewriter effect (default true). */
  typing?: boolean;
  intro?: ReactNode;
  image?: BrandImage;
  steps?: StepItem[];
  cta?: LinkAction;
  /** Booking bar under the intro. */
  booking?: ReactNode;
  id?: string;
  children?: ReactNode;
  className?: string;
}

export function Hero({ title, typing = true, intro, image = assets.heroPhoto, steps, cta, booking, id = "hero-title", children, className }: HeroProps) {
  return (
    <section className={cx("ap-root ap-hero", className)} aria-labelledby={id}>
      <div className="ap-hero__bg" aria-hidden>
        <Image src={image.src} width={image.width} height={image.height} alt="" sizes="100vw" quality={60} preload />
      </div>
      <div className="ap-hero__content">
        {typing ? (
          <TypeTitle as="h1" id={id} className="display ap-display">{accentTitle(title)}</TypeTitle>
        ) : (
          <h1 id={id} className="display ap-display">{accentTitle(title)}</h1>
        )}
        {intro ? <p className="body ap-body">{intro}</p> : null}
        {booking ? <div className="ap-hero__booking">{booking}</div> : null}
        {steps ? (
          <div className="ap-hero__steps">
            <Steps variant="hero" items={steps} titleAs="h2" />
          </div>
        ) : null}
        {cta?.href ? <Button href={cta.href}>{cta.label}</Button> : null}
        {children}
      </div>
    </section>
  );
}
