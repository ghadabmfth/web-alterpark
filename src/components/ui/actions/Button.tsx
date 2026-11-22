import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "../lib/cx";

/*
 * Button — design system "Actions". Pill, orange by default.
 * Variants: primary (observed) · secondary · outline · ghost (proposed). Sizes: md 64 px · sm 48 px.
 * Extension (documented in docs/design-system/extensions.md): `loading` disables the button,
 * sets aria-busy and shows `loadingLabel`.
 */

type Common = {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "md" | "sm";
  fullWidth?: boolean;
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
  /** Forces a visual state — documentation gallery only. */
  state?: "hover" | "focus" | "active";
  loading?: boolean;
  loadingLabel?: ReactNode;
  className?: string;
  children?: ReactNode;
};

export type ButtonProps =
  | (Common & { href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>)
  | (Common & { href: string; disabled?: boolean } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">);

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    fullWidth,
    iconStart,
    iconEnd,
    state,
    loading,
    loadingLabel,
    className,
    children,
    ...rest
  } = props;
  const cls = cx("ap-btn", `ap-btn--${variant}`, `ap-btn--${size}`, fullWidth && "ap-btn--full", state && `is-${state}`, className);
  const kids = (
    <>
      {iconStart ? <span className="ap-btn__icon" aria-hidden>{iconStart}</span> : null}
      <span>{loading && loadingLabel ? loadingLabel : children}</span>
      {iconEnd ? <span className="ap-btn__icon" aria-hidden>{iconEnd}</span> : null}
    </>
  );

  if ("href" in rest && rest.href !== undefined) {
    const { href, disabled, ...anchor } = rest as { href: string; disabled?: boolean } & AnchorHTMLAttributes<HTMLAnchorElement>;
    if (disabled) {
      return <a {...anchor} className={cls} aria-disabled="true">{kids}</a>;
    }
    // Internal routes use client-side navigation; external links and downloads (prefetching would
    // run the file's route handler) stay plain anchors.
    if (href.startsWith("/") && !href.startsWith("//") && anchor.download === undefined) {
      return <Link {...anchor} href={href} className={cls}>{kids}</Link>;
    }
    return <a {...anchor} href={href} className={cls}>{kids}</a>;
  }

  const button = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button
      type="button"
      {...button}
      disabled={button.disabled || loading}
      aria-busy={loading || undefined}
      className={cls}
    >
      {kids}
    </button>
  );
}
