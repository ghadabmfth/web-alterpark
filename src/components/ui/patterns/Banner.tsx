import Image from "next/image";
import type { ReactNode } from "react";
import { cx } from "../lib/cx";
import { assets, type BrandImage } from "../lib/assets";
import { SectionHeading } from "../content/SectionHeading";
import { Button } from "../actions/Button";
import type { LinkAction } from "../navigation/types";

/*
 * Banner — design system "Patterns". Full-width photo blended into the background, followed by
 * centred content (partner logo, title, text, button). Photo height 200 → 435 px.
 */
export interface BannerProps {
  title: ReactNode;
  image?: BrandImage;
  logo?: BrandImage;
  logoAlt?: string;
  cta?: LinkAction;
  as?: "h2" | "h3";
  typing?: boolean;
  children?: ReactNode;
  className?: string;
}

export function Banner({ title, image = assets.rallyePhoto, logo, logoAlt = "", cta, as, typing, children, className }: BannerProps) {
  return (
    <section className={cx("ap-root ap-banner", className)}>
      <div className="ap-banner__media" aria-hidden>
        <Image className="ap-banner__photo" src={image.src} width={image.width} height={image.height} alt="" sizes="100vw" />
      </div>
      <div className="ap-banner__content">
        {logo ? <Image className="ap-banner__logo" src={logo.src} width={logo.width} height={logo.height} alt={logoAlt} /> : null}
        <SectionHeading title={title} align="center" as={as} typing={typing}>
          {children}
        </SectionHeading>
        {cta?.href ? <Button href={cta.href}>{cta.label}</Button> : null}
      </div>
    </section>
  );
}
