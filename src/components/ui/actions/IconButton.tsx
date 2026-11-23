import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "../lib/cx";
import { ArrowLeftIcon, ArrowRightIcon } from "../icons/icons";
import { IconOrImage } from "../icons/IconOrImage";

/*
 * IconButton — design system "Actions". Button without visible text: carousel arrows (`plain`,
 * 27 px orange arrow) and video play button (`play`, 89 px orange disc). `label` is mandatory.
 */
export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: "plain" | "play";
  /** "arrowLeft" | "arrowRight" | an SVG node; for `play`, a system pictogram name or an image URL. */
  icon?: "arrowLeft" | "arrowRight" | ReactNode;
  label: string;
  state?: "hover" | "focus" | "active";
}

export function IconButton({ variant = "plain", icon, label, state, className, ...rest }: IconButtonProps) {
  let glyph: ReactNode;
  if (variant === "play") glyph = <IconOrImage icon={typeof icon === "string" ? icon : "play"} />;
  else if (icon === "arrowLeft") glyph = <ArrowLeftIcon />;
  else if (icon === "arrowRight" || !icon) glyph = <ArrowRightIcon />;
  else glyph = icon;
  return (
    <button
      type="button"
      {...rest}
      aria-label={label}
      title={label}
      className={cx("ap-iconbtn", `ap-iconbtn--${variant}`, state && `is-${state}`, className)}
    >
      {glyph}
    </button>
  );
}
