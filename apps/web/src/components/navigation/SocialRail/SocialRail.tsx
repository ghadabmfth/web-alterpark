import { cx } from "../../lib/cx";
import { IconOrImage } from "../../lib/IconOrImage";

export interface SocialRailItem {
  label: string;
  href: string;
  /** Nom d'un pictogramme du système (facebook, login, youtube…) ou URL d'image. */
  icon: string;
  tone?: "dark" | "primary" | "light";
}

export interface SocialRailProps {
  /** Liens à afficher (réglages WordPress). Le bundle avait des liens « # » par défaut, retirés. */
  items: SocialRailItem[];
  /** fixé au bord droit de la fenêtre (défaut true) */
  fixed?: boolean;
  className?: string;
}

/** Rail d'onglets fixé au bord droit : Facebook, espace client, YouTube. */
export function SocialRail({ items, fixed, className }: SocialRailProps) {
  return (
    <ul className={cx("ap-root ap-rail", fixed !== false && "ap-rail--fixed", className)}>
      {items.map((it, i) => (
        <li key={i}>
          <a href={it.href} className={`ap-rail--${it.tone || "dark"}`} aria-label={it.label} title={it.label}>
            <IconOrImage src={it.icon} />
          </a>
        </li>
      ))}
    </ul>
  );
}
