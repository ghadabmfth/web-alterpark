import { SvgIcon, isSystemIcon } from "../icons/SvgIcon";
import { ApImage } from "./ApImage";

/** Une icône donnée par son nom (SVG intégré) ou par une URL d'image (`iconOrImg` du bundle). */
export function IconOrImage({ src, label, className }: { src: string; label?: string; className?: string }) {
  return isSystemIcon(src) ? <SvgIcon name={src} label={label} className={className} /> : <ApImage src={src} alt={label ?? ""} className={className} />;
}
