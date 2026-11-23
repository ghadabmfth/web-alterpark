"use client";

import { useRef, type CSSProperties } from "react";
import Image from "next/image";
import { cx } from "../lib/cx";
import { assets } from "../lib/assets";
import { useCountUp, useInView } from "../lib/motion";
import { ArrowRightIcon, StarIcon } from "../icons/icons";

/*
 * RatingBadge — design system "Content". Speech-bubble badge (Google rating): logo in a circle,
 * score « 4,4/5 », stars filled to the tenth, review count counting up when it enters the viewport.
 * `rating` and `count` must come from a real source (Google Places or an authorised figure).
 */
export interface RatingBadgeProps {
  count: number;
  rating: number;
  label?: string;
  source?: string;
  sourceLogo?: string;
  /** Makes the badge a link (to the reviews). */
  href?: string;
  /** Compact bubble, tip on top (tooltip). */
  size?: "mini";
  className?: string;
}

export function RatingBadge({ count, rating, label, source = "Google", sourceLogo, href, size, className }: RatingBadgeProps) {
  const ref = useRef<HTMLDivElement & HTMLAnchorElement>(null);
  const seen = useInView(ref);
  const shown = useCountUp(count, seen);
  const ratingText = rating.toLocaleString("fr-FR", { minimumFractionDigits: rating % 1 ? 1 : 0, maximumFractionDigits: 1 });
  const cls = cx("ap-root ap-rating", seen && "is-in", href && "is-link", size === "mini" && "ap-rating--mini", className);

  const content = (
    <>
      <span className="ap-rating__logo">
        <Image src={sourceLogo ?? assets.google.src} alt={source} width={64} height={64} />
      </span>
      <span className="ap-rating__body">
        <span className="ap-rating__label">
          {label ?? (
            <>
              <b className="ap-rating__score">{ratingText}</b>
              <span className="ap-rating__max">/5</span>
            </>
          )}
        </span>
        <span className="ap-rating__stars" role="img" aria-label={`Note : ${rating} sur 5`}>
          {Array.from({ length: 5 }, (_, i) => {
            const fill = Math.max(0, Math.min(1, rating - i));
            return (
              <span key={i} className="ap-rating__star" style={{ "--i": i } as CSSProperties}>
                <span className="ap-rating__star-bg"><StarIcon /></span>
                <span className="ap-rating__star-fill" style={{ width: `${fill * 100}%` }}><StarIcon /></span>
              </span>
            );
          })}
        </span>
        <span className="ap-rating__count">
          Basée sur <b aria-hidden>{shown.toLocaleString("fr-FR")}</b>
          <span className="ap-sr">{String(count)}</span> {`avis ${source}`}
        </span>
      </span>
      {href ? (
        <span className="ap-rating__go" aria-hidden>
          <ArrowRightIcon />
        </span>
      ) : null}
    </>
  );

  return href ? (
    <a ref={ref} href={href} className={cls}>{content}</a>
  ) : (
    <div ref={ref} className={cls}>{content}</div>
  );
}
