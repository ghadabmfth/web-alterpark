"use client";

import { useRef, type CSSProperties } from "react";
import { cx } from "../../lib/cx";
import { useCountUp, useInView } from "../../lib/hooks";
import { ArrowRightIcon, StarIcon } from "../../icons/ui";
import { ApImage } from "../../lib/ApImage";

export interface RatingBadgeProps {
  count: number;
  rating?: number;
  label?: string;
  source?: string;
  /** Logo de la source (fichier officiel, ex. « G » de Google). Le bundle pointait vers un fichier non versionné. */
  sourceLogo?: string;
  /** rend la carte cliquable (lien vers les avis) */
  href?: string;
  /** mini : bulle compacte, pointe en haut (info-bulle) */
  size?: "mini";
  className?: string;
}

/** Badge de note : carte au liseré animé, étoiles qui apparaissent une à une, nombre d'avis qui défile. */
export function RatingBadge({ count, rating: r, label, source, sourceLogo, href, size, className }: RatingBadgeProps) {
  const ref = useRef<HTMLDivElement & HTMLAnchorElement>(null);
  const seen = useInView(ref);
  const shown = useCountUp(count || 0, seen);
  const rating = r == null ? 5 : r;
  const ratingTxt = rating.toLocaleString("fr-FR", { minimumFractionDigits: rating % 1 ? 1 : 0, maximumFractionDigits: 1 });
  const src = source || "Google";
  const Tag = href ? "a" : "div";
  return (
    <Tag
      ref={ref}
      href={href}
      className={cx("ap-root ap-rating", seen && "is-in", !!href && "is-link", size === "mini" && "ap-rating--mini", className)}
    >
      {sourceLogo ? (
        <span className="ap-rating__logo">
          <ApImage src={sourceLogo} alt={src} />
        </span>
      ) : null}
      <span className="ap-rating__body">
        <span className="ap-rating__label">
          {label || (
            <>
              <b className="ap-rating__score">{ratingTxt}</b>
              <span className="ap-rating__max">/5</span>
            </>
          )}
        </span>
        <span className="ap-rating__stars" role="img" aria-label={`Note : ${rating} sur 5`}>
          {/* Étoiles partielles : 4,4 → 4 pleines + une remplie à 40 %. */}
          {Array.from({ length: 5 }, (_, i) => {
            const fill = Math.max(0, Math.min(1, rating - i));
            return (
              <span key={i} className="ap-rating__star" style={{ "--i": i } as CSSProperties}>
                <span className="ap-rating__star-bg">
                  <StarIcon />
                </span>
                <span className="ap-rating__star-fill" style={{ width: `${fill * 100}%` }}>
                  <StarIcon />
                </span>
              </span>
            );
          })}
        </span>
        <span className="ap-rating__count">
          Basée sur <b aria-hidden>{shown.toLocaleString("fr-FR")}</b>
          <span className="ap-sr">{String(count || 0)}</span>
          {` avis ${src}`}
        </span>
      </span>
      {href ? (
        <span className="ap-rating__go" aria-hidden>
          <ArrowRightIcon />
        </span>
      ) : null}
    </Tag>
  );
}
