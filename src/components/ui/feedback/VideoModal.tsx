"use client";

import { useId, useRef } from "react";
import { useDialogFocus } from "../lib/focus-trap";
import { CloseIcon } from "../icons/icons";
import { SvgIcon } from "../icons/SvgIcon";

/*
 * VideoModal — design system "Feedback". Full-screen YouTube player (privacy-enhanced domain):
 * blurred scrim, Crossroads title, round close button, 16:9 player. Page scroll is locked.
 * With `embed={false}`, a link to YouTube replaces the player.
 */
export interface VideoModalProps {
  open: boolean;
  /** YouTube URL or 11-character id. */
  video: string;
  title?: string;
  onClose?: () => void;
  embed?: boolean;
}

export function youtubeId(input: string): string {
  const m = String(input || "").match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1]! : String(input || "");
}

export function VideoModal({ open, video, title = "Vidéo", onClose, embed = true }: VideoModalProps) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const id = youtubeId(video);
  useDialogFocus(panel, open, onClose, true);
  if (!open) return null;
  return (
    <div
      className="ap-root ap-video"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="ap-video__panel" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={panel}>
        <div className="ap-video__head">
          <h2 className="ap-video__title" id={titleId}>{title}</h2>
          <button type="button" className="ap-video__close" aria-label="Fermer la vidéo" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <div className="ap-video__frame">
          {embed ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&modestbranding=1`}
              title={title}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : (
            <a className="ap-video__fallback" href={`https://www.youtube.com/watch?v=${encodeURIComponent(id)}`} target="_blank" rel="noopener noreferrer">
              <span className="ap-video__fallback-play" aria-hidden>
                <SvgIcon name="play" />
              </span>
              <b>Regarder la vidéo sur YouTube</b>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
