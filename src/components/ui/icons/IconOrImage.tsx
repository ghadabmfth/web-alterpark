import Image from "next/image";
import { isSystemSvg, SvgIcon } from "./SvgIcon";

/**
 * A system pictogram by name, or an image by URL (bundle `iconOrImg`). Images are lazy-loaded
 * and decorative unless `label` is given.
 */
export function IconOrImage({ icon, label, className, size = 80 }: { icon: string; label?: string; className?: string; size?: number }) {
  if (isSystemSvg(icon)) return <SvgIcon name={icon} label={label} className={className} />;
  return <Image src={icon} alt={label ?? ""} width={size} height={size} className={className} />;
}
