import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "../../lib/cx";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary (observé) · secondary · outline · ghost (proposés) */
  variant?: "primary" | "secondary" | "outline" | "ghost";
  /** md = 64 px (observé) · sm = 48 px (proposé, mobile et barres d'action) */
  size?: "md" | "sm";
  /** Rend un <a> au lieu d'un <button>. */
  href?: string;
  fullWidth?: boolean;
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
  /** Force un état pour la documentation uniquement. */
  state?: "hover" | "focus" | "active";
}

/** Bouton d'action en pilule, orange par défaut. */
export function Button({ variant = "primary", size = "md", href, fullWidth, iconStart, iconEnd, state, className, children, ...rest }: ButtonProps) {
  const cls = cx("ap-btn", `ap-btn--${variant}`, `ap-btn--${size}`, fullWidth && "ap-btn--full", state && `is-${state}`, className);
  const kids = (
    <>
      {iconStart ? (
        <span className="ap-btn__icon" aria-hidden>
          {iconStart}
        </span>
      ) : null}
      <span>{children}</span>
      {iconEnd ? (
        <span className="ap-btn__icon" aria-hidden>
          {iconEnd}
        </span>
      ) : null}
    </>
  );
  if (href) {
    const { disabled, ...anchorRest } = rest;
    return (
      <a
        {...(anchorRest as AnchorHTMLAttributes<HTMLAnchorElement>)}
        href={disabled ? undefined : href}
        className={cls}
        aria-disabled={disabled ? "true" : undefined}
      >
        {kids}
      </a>
    );
  }
  return (
    <button type="button" {...rest} className={cls}>
      {kids}
    </button>
  );
}
