import type { InputHTMLAttributes, ReactNode } from "react";
import { cx } from "../../lib/cx";

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
}

/** Interrupteur pour un réglage activé immédiatement. */
export function Toggle({ label, className, ...rest }: ToggleProps) {
  return (
    <label className={cx("ap-root ap-toggle", className)}>
      <input type="checkbox" role="switch" {...rest} />
      <span className="ap-toggle__track" aria-hidden />
      <span>{label}</span>
    </label>
  );
}
