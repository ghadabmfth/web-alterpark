"use client";

import { useState, type CSSProperties } from "react";
import { cx } from "../../lib/cx";
import { Stars } from "../Stars/Stars";
import { ApImage } from "../../lib/ApImage";

export interface ReviewCardProps {
  name: string;
  text: string;
  rating?: number;
  /** date affichée, ex. « il y a 2 semaines » */
  date?: string;
  avatar?: string;
  href?: string;
  source?: string;
  /** Logo de la source. Le bundle pointait vers un fichier non versionné. */
  sourceLogo?: string;
  className?: string;
}

/* Teintes des initiales, reprises du bundle (AVATAR_TINTS). */
const AVATAR_TINTS = ["#f6921e", "#6cb6ff", "#4cc38a", "#ff8a80", "#f6bb04", "#c79bff"];

export function avatarTint(name: string): string {
  let h = 0;
  for (let c = 0; c < name.length; c++) h = (h * 31 + name.charCodeAt(c)) >>> 0;
  return AVATAR_TINTS[h % AVATAR_TINTS.length]!;
}

/** Avis client : avatar, nom, étoiles, extrait, « Lire plus », logo de la source. */
export function ReviewCard({ name, text, rating, date, avatar, href, source, sourceLogo, className }: ReviewCardProps) {
  const [open, setOpen] = useState(false);
  const initials = (name || "?")
    .split(/\s+/)
    .map((w) => w.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const long = (text || "").length > 150;
  return (
    <article className={cx("ap-root ap-review", className)}>
      <div className="ap-review__top">
        <span className="ap-review__quote" aria-hidden>
          “
        </span>
        <Stars value={rating == null ? 5 : rating} size="md" />
      </div>
      <p className={cx("ap-review__text", open && "is-open")}>{text}</p>
      {href ? (
        <a className="ap-link" href={href}>
          Lire l’avis
        </a>
      ) : long ? (
        <button type="button" className="ap-link" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? "Lire moins" : "Lire plus"}
        </button>
      ) : null}
      <footer className="ap-review__who">
        {avatar ? (
          <ApImage className="ap-review__avatar" src={avatar} alt="" sizes="44px" />
        ) : (
          <span className="ap-review__avatar" style={{ "--tint": avatarTint(name || "") } as CSSProperties} aria-hidden>
            {initials}
          </span>
        )}
        <span className="ap-review__id">
          <b className="ap-review__name">{name}</b>
          {date ? <span className="ap-review__date">{date}</span> : null}
        </span>
        {sourceLogo ? <ApImage className="ap-review__source" src={sourceLogo} alt={`Avis ${source || "Google"}`} sizes="24px" /> : null}
      </footer>
    </article>
  );
}
