"use client";

import { useId, useRef, type ReactNode } from "react";
import { cx } from "../lib/cx";
import { useDialogFocus } from "../lib/focus-trap";
import { CloseIcon } from "../icons/icons";

/*
 * Modal — design system "Feedback". Dialog over a scrim: focus moves inside and is trapped,
 * Escape and a click on the scrim close it, focus returns to the trigger. `inline` renders it in
 * the flow (documentation only).
 */
export interface ModalProps {
  open: boolean;
  title: string;
  onClose?: () => void;
  footer?: ReactNode;
  inline?: boolean;
  children?: ReactNode;
  className?: string;
}

export function Modal({ open, title, onClose, footer, inline, children, className }: ModalProps) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useDialogFocus(panel, open && !inline, onClose);
  if (!open) return null;
  return (
    <div
      className={cx("ap-root ap-modal", inline && "ap-modal--inline", className)}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="ap-modal__panel" role="dialog" aria-modal={inline ? undefined : true} aria-labelledby={titleId} ref={panel}>
        <div className="ap-modal__head">
          <h2 className="ap-modal__title" id={titleId}>{title}</h2>
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
