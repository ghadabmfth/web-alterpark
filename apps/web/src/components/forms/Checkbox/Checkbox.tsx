import type { InputHTMLAttributes, ReactNode } from "react";
import { cx } from "../../lib/cx";
import { CheckIcon } from "../../icons/ui";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
  invalid?: boolean;
}

/** Case à cocher. */
export function Checkbox({ label, className, invalid, ...rest }: CheckboxProps) {
  return (
    <label className={cx("ap-root ap-choice", className)}>
      <input type="checkbox" {...rest} aria-invalid={invalid ? "true" : undefined} />
      <span className="ap-choice__box">
        <CheckIcon />
      </span>
      <span>{label}</span>
    </label>
  );
}
