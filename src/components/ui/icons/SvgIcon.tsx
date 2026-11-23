import { cx } from "../lib/cx";
import { SYSTEM_SVG, type SystemSvgName } from "@/design-system/icons/svg-data";

function escapeAttr(t: string): string {
  return t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] ?? c);
}

export function isSystemSvg(name: string): name is SystemSvgName {
  return Object.prototype.hasOwnProperty.call(SYSTEM_SVG, name);
}

/**
 * Logo or pictogram of the design system, inlined (bundle `svgIcon`). With `label` it is a named
 * image; without, it is decorative. The markup is static design-system data, never user input.
 */
export function SvgIcon({ name, label, className }: { name: SystemSvgName; label?: string; className?: string }) {
  const a11y = label ? `role="img" aria-label="${escapeAttr(label)}"` : 'aria-hidden="true"';
  return (
    <span
      className={cx("ap-svg", className)}
      dangerouslySetInnerHTML={{ __html: SYSTEM_SVG[name].replace("<svg", `<svg ${a11y} focusable="false"`) }}
    />
  );
}
