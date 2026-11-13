"use client";

import { useState, type ReactNode } from "react";
import { cx } from "../../lib/cx";
import { CloseIcon, TONE_ICONS, type Tone } from "../../icons/ui";

export interface AlertProps {
  tone?: Tone;
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  children?: ReactNode;
  className?: string;
}

/** Mot affiché quand aucun titre n'est donné : la couleur n'est jamais le seul signal. */
export const TONE_WORD: Record<Tone, string> = { success: "Succès", warning: "Attention", error: "Erreur", info: "Information" };

/** Message de retour : succès, information, avertissement, erreur. */
export function Alert({ tone = "info", title, dismissible, onDismiss, children, className }: AlertProps) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  const Icon = TONE_ICONS[tone];
  return (
    <div className={cx("ap-root ap-alert", `ap-alert--${tone}`, className)} role={tone === "error" || tone === "warning" ? "alert" : "status"}>
      <Icon />
      <div>
        <p className="ap-alert__title">{title || TONE_WORD[tone]}</p>
        {children ? <p>{children}</p> : null}
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
