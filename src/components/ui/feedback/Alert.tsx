"use client";

import { useState, type ReactNode } from "react";
import { cx } from "../lib/cx";
import { CloseIcon, StatusIcon, type StatusTone } from "../icons/icons";

/*
 * Alert — design system "Feedback". Success, information, warning, error: always an icon and a
 * word (the title defaults to the tone's name). Errors and warnings are announced (role="alert").
 */
export interface AlertProps {
  tone?: StatusTone;
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  children?: ReactNode;
  className?: string;
}

const TONE_WORD: Record<StatusTone, string> = { success: "Succès", warning: "Attention", error: "Erreur", info: "Information" };

export function Alert({ tone = "info", title, dismissible, onDismiss, children, className }: AlertProps) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className={cx("ap-root ap-alert", `ap-alert--${tone}`, className)} role={tone === "error" || tone === "warning" ? "alert" : "status"}>
      <StatusIcon tone={tone} />
      <div>
        <p className="ap-alert__title">{title ?? TONE_WORD[tone]}</p>
        {children ? <div>{children}</div> : null}
      </div>
      {dismissible ? (
        <button
          type="button"
          className="ap-alert__close"
          aria-label="Fermer"
          onClick={() => {
            setVisible(false);
            onDismiss?.();
          }}
        >
          <CloseIcon />
        </button>
      ) : (
        <span />
      )}
    </div>
  );
}
