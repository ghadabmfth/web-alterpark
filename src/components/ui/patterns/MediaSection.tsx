import type { ReactNode } from "react";
import { cx } from "../lib/cx";
import { SectionHeading } from "../content/SectionHeading";
import { Button } from "../actions/Button";
import type { LinkAction } from "../navigation/types";

/*
 * MediaSection — design system "Patterns". Two columns from 1024 px: heading, text and button on
 * one side, visual on the other (`reverse` swaps them); stacked text-then-visual below.
 */
export interface MediaSectionProps {
  title: ReactNode;
  subtitle?: string;
  eyebrow?: string;
  media: ReactNode;
  /** Content under the text (feature list, badges). */
  after?: ReactNode;
  cta?: LinkAction;
  reverse?: boolean;
  as?: "h2" | "h3";
  typing?: boolean;
  children?: ReactNode;
  className?: string;
}

export function MediaSection({ title, subtitle, eyebrow, media, after, cta, reverse, as, typing, children, className }: MediaSectionProps) {
  return (
    <section className={cx("ap-root ap-media", reverse && "ap-media--reverse", className)}>
      <div className="ap-media__grid">
        <div className="ap-media__text">
          <SectionHeading title={title} subtitle={subtitle} eyebrow={eyebrow} as={as} typing={typing}>
            {children}
          </SectionHeading>
          {after ? <div className="ap-media__after">{after}</div> : null}
          {cta?.href ? (
            <div className="ap-media__cta">
              <Button href={cta.href}>{cta.label}</Button>
            </div>
          ) : null}
        </div>
        <div className="ap-media__visual">{media}</div>
      </div>
    </section>
  );
}
