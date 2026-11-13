import { cx } from "../lib/cx";
import { SYSTEM_SVGS, type SvgData, type SystemIconName } from "./system-icons.data";

export type { SystemIconName };

export interface SvgIconProps {
  name: SystemIconName;
  /** Nom accessible : fait de l'icône une image nommée. Sans libellé, elle est décorative. */
  label?: string;
  className?: string;
}

/**
 * Pictogrammes et logo du système (`svgIcon(nom)` dans bundle.js), en SVG intégré.
 * Les pictogrammes suivent currentColor ; le logo suit text-primary, primary et surface (.ap-logo).
 */
export function SvgIcon({ name, label, className }: SvgIconProps) {
  const icon: SvgData = SYSTEM_SVGS[name];
  return (
    <span className={cx("ap-svg", className)}>
      <svg
        viewBox={icon.viewBox}
        focusable="false"
        {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
      >
        {icon.paths.map((p, i) => (
          <path key={i} d={p.d} fill={p.fill} fillRule={p.fillRule} className={p.className} />
        ))}
      </svg>
    </span>
  );
}

export function isSystemIcon(name: string): name is SystemIconName {
  return Object.prototype.hasOwnProperty.call(SYSTEM_SVGS, name);
}
