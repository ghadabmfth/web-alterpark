"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { cx } from "../../lib/cx";
import { CloseIcon } from "../../icons/ui";

export interface ModalProps {
  open: boolean;
  title: string;
  onClose?: () => void;
  footer?: ReactNode;
  /** affichage dans le flux (documentation) */
  inline?: boolean;
  children?: ReactNode;
  className?: string;
}

const FOCUSABLE = "button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])";

/** Fenêtre de dialogue au-dessus d'un voile : focus piégé, Échap pour fermer, focus rendu à l'ouverture. */
export function Modal({ open, title, onClose, footer, inline, children, className }: ModalProps) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });
  useEffect(() => {
    if (!open || inline) return;
    const prev = document.activeElement as HTMLElement | null;
    const el = panel.current;
    el?.querySelector<HTMLElement>("button, [href], input, select, textarea")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current?.();
      if (e.key === "Tab" && el) {
        const list = el.querySelectorAll<HTMLElement>(FOCUSABLE);
        if (!list.length) return;
        const first = list[0]!;
        const last = list[list.length - 1]!;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [open, inline]);
  if (!open) return null;
  return (
    <div
      className={cx("ap-root ap-modal", inline && "ap-modal--inline", className)}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="ap-modal__panel" role="dialog" aria-modal={inline ? undefined : "true"} aria-labelledby={titleId} ref={panel}>
        <div className="ap-modal__head">
          <h2 className="ap-modal__title" id={titleId}>
            {title}
          </h2>
          <button type="button" className="ap-modal__close" aria-label="Fermer" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <div className="ap-modal__body">{children}</div>
        {footer ? <div className="ap-modal__foot">{footer}</div> : null}
      </div>
    </div>
  );
}
