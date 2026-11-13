import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "../../lib/cx";
import { ArrowLeftIcon, ArrowRightIcon } from "../../icons/ui";
import { SvgIcon, isSystemIcon } from "../../icons/SvgIcon";
import { ApImage } from "../../lib/ApImage";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** plain : flèche orange 27 px (carrousel) · play : disque orange 89 px */
  variant?: "plain" | "play";
  /** 'arrowLeft' | 'arrowRight' ou un nœud SVG ; pour play, un pictogramme du système ou l'URL d'une image */
  icon?: "arrowLeft" | "arrowRight" | ReactNode;
  /** Nom accessible, obligatoire. */
  label: string;
  state?: "hover" | "focus" | "active";
}

/** Bouton sans libellé visible : flèches du carrousel et bouton de lecture vidéo. */
export function IconButton({ variant = "plain", icon, label, state, className, ...rest }: IconButtonProps) {
  let glyph: ReactNode;
  if (variant === "play") {
    const name = typeof icon === "string" ? icon : "play";
    glyph = isSystemIcon(name) ? <SvgIcon name={name} /> : <ApImage src={name} alt="" />;
  } else if (icon === "arrowLeft") glyph = <ArrowLeftIcon />;
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
