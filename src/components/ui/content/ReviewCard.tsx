"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import { cx } from "../lib/cx";
import { assets } from "../lib/assets";
import { Stars } from "./Stars";

/*
 * ReviewCard — design system "Content". Orange quote mark, stars, 5-line excerpt (« Lire plus »
 * beyond 150 characters), author (initials avatar by default: reviewer photos are personal data),
 * date and source logo.
 * Porting note: avatar tints use design-system tokens; the bundle's off-palette purple is dropped.
 */
export interface ReviewCardProps {
  name: string;
  text: string;
  rating?: number;
  /** Display date, e.g. « il y a 2 semaines ». */
  date?: string;
  /** Remote avatars must be allowed in next.config `images.remotePatterns`. */
  avatar?: string;
  href?: string;
  source?: string;
  sourceLogo?: string;
  className?: string;
}

const AVATAR_TINTS = ["var(--primary)", "var(--info)", "var(--success)", "var(--error)", "var(--accent)"];

export function initials(name: string): string {
  return (name || "?")
    .split(/\s+/)
    .map((w) => w.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function avatarTint(name: string): string {
  let hash = 0;
  for (let c = 0; c < name.length; c++) hash = (hash * 31 + name.charCodeAt(c)) >>> 0;
  return AVATAR_TINTS[hash % AVATAR_TINTS.length]!;
}

export function ReviewCard({ name, text, rating = 5, date, avatar, href, source = "Google", sourceLogo, className }: ReviewCardProps) {
  const [open, setOpen] = useState(false);
  const long = text.length > 150;
  return (
    <article className={cx("ap-root ap-review", className)}>
      <div className="ap-review__top">
        <span className="ap-review__quote" aria-hidden>“</span>
        <Stars value={rating} size="md" />
      </div>
      <p className={cx("ap-review__text", open && "is-open")}>{text}</p>
      {href ? (
        <a className="ap-link" href={href}>Lire l’avis</a>
      ) : long ? (
        <button type="button" className="ap-link" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? "Lire moins" : "Lire plus"}
        </button>
      ) : null}
      <footer className="ap-review__who">
        {avatar ? (
          <Image className="ap-review__avatar" src={avatar} alt="" width={48} height={48} />
        ) : (
          <span className="ap-review__avatar" style={{ "--tint": avatarTint(name) } as CSSProperties} aria-hidden>
            {initials(name)}
          </span>
        )}
        <span className="ap-review__id">
          <b className="ap-review__name">{name}</b>
          {date ? <span className="ap-review__date">{date}</span> : null}
        </span>
        <Image className="ap-review__source" src={sourceLogo ?? assets.google.src} alt={`Avis ${source}`} width={32} height={32} />
      </footer>
    </article>
  );
}
