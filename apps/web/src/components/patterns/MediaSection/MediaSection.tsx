import type { ReactNode } from "react";
import { cx } from "../../lib/cx";
import type { Href } from "../../lib/types";
import { SectionHeading } from "../../content/SectionHeading/SectionHeading";
import { Button } from "../../actions/Button/Button";

export interface MediaSectionProps {
  title: ReactNode;
  subtitle?: string;
  eyebrow?: string;
  media: ReactNode;
  /** contenu sous le texte (liste d'atouts, badges) */
  after?: ReactNode;
  cta?: Href;
  reverse?: boolean;
  as?: "h2" | "h3";
  children?: ReactNode;
  className?: string;
}

/** Section deux colonnes : titre, texte et bouton d'un côté, visuel de l'autre (photos : classe ap-photo). */
export function MediaSection({ title, subtitle, eyebrow, media, after, cta, reverse, as, children, className }: MediaSectionProps) {
  return (
    <section className={cx("ap-root ap-media", reverse && "ap-media--reverse", className)}>
      <div className="ap-media__grid">
        <div className="ap-media__text">
          <SectionHeading title={title} subtitle={subtitle} eyebrow={eyebrow} as={as}>
            {children}
          </SectionHeading>
          {after ? <div className="ap-media__after">{after}</div> : null}
          {cta ? (
            <div className="ap-media__cta">
              <Button href={cta.href} onClick={cta.onClick}>
                {cta.label}
              </Button>
            </div>
          ) : null}
        </div>
        <div className="ap-media__visual">{media}</div>
      </div>
    </section>
  );
}
