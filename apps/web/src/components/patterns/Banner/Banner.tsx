import type { ReactNode } from "react";
import { cx } from "../../lib/cx";
import type { Href, ImageSource } from "../../lib/types";
import { ApImage } from "../../lib/ApImage";
import { SectionHeading } from "../../content/SectionHeading/SectionHeading";
import { Button } from "../../actions/Button/Button";

export interface BannerProps {
  title: ReactNode;
  /** Photo du bandeau. Le bundle avait une photo par défaut, non versionnée. */
  image?: ImageSource;
  logo?: ImageSource;
  logoAlt?: string;
  cta?: Href;
  as?: "h2" | "h3";
  children?: ReactNode;
  className?: string;
}

/** Bandeau photo pleine largeur fondu dans le fond, suivi d'un contenu centré (logo partenaire, titre, texte, bouton). */
export function Banner({ title, image, logo, logoAlt, cta, as, children, className }: BannerProps) {
  return (
    <section className={cx("ap-root ap-banner", className)}>
      <div className="ap-banner__media" aria-hidden>
        {image ? <ApImage className="ap-banner__photo" src={image} alt="" fill sizes="100vw" /> : null}
      </div>
      <div className="ap-banner__content">
        {logo ? <ApImage className="ap-banner__logo" src={logo} alt={logoAlt || ""} sizes="300px" /> : null}
        <SectionHeading title={title} align="center" as={as}>
          {children}
        </SectionHeading>
        {cta ? (
          <Button href={cta.href} onClick={cta.onClick}>
            {cta.label}
          </Button>
        ) : null}
      </div>
    </section>
  );
}
