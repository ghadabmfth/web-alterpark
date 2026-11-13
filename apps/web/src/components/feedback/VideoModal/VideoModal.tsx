"use client";

import { useEffect, useId, useRef } from "react";
import { CloseIcon } from "../../icons/ui";
import { SvgIcon } from "../../icons/SvgIcon";

export interface VideoModalProps {
  open: boolean;
  /** lien ou identifiant YouTube */
  video: string;
  title?: string;
  onClose?: () => void;
  /**
   * Intègre le lecteur (défaut true). false : lien vers YouTube à la place.
   * Le bundle détectait les aperçus sécurisés de Claude ; sans objet sur le site.
   */
  embed?: boolean;
}

/** Identifiant YouTube depuis une URL (watch, youtu.be, embed, shorts) ou un identifiant brut. */
export function youtubeId(u: string): string {
  const m = String(u || "").match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1]! : String(u || "");
}

/** Vidéo YouTube en fenêtre (youtube-nocookie). */
export function VideoModal({ open, video, title, onClose, embed = true }: VideoModalProps) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const id = youtubeId(video);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const el = panel.current;
    el?.querySelector("button")?.focus();
    const ov = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current?.();
      if (e.key === "Tab" && el) {
        const l = el.querySelectorAll<HTMLElement>("button, a, iframe");
        if (!l.length) return;
        const f = l[0]!;
        const z = l[l.length - 1]!;
        if (e.shiftKey && document.activeElement === f) {
          e.preventDefault();
          z.focus();
        } else if (!e.shiftKey && document.activeElement === z) {
          e.preventDefault();
          f.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = ov;
      prev?.focus?.();
    };
  }, [open]);
  if (!open) return null;
  const url = `https://www.youtube.com/watch?v=${id}`;
  return (
    <div
      className="ap-root ap-video"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="ap-video__panel" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={panel}>
        <div className="ap-video__head">
          <h2 className="ap-video__title" id={titleId}>
            {title || "Vidéo"}
          </h2>
          <button type="button" className="ap-video__close" aria-label="Fermer la vidéo" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <div className="ap-video__frame">
          {embed ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
              title={title || "Vidéo"}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : (
            <a className="ap-video__fallback" href={url} target="_blank" rel="noopener">
              <span className="ap-video__fallback-play" aria-hidden>
                <SvgIcon name="play" />
              </span>
              <b>Regarder la vidéo sur YouTube</b>
              <small>La vidéo s’ouvre dans un nouvel onglet.</small>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
