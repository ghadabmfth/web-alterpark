import type { ComponentProps, ReactNode } from "react";
import { cx } from "../lib/cx";
import { CheckIcon } from "../icons/icons";

/** Checkbox — design system "Forms". */
export type CheckboxProps = Omit<ComponentProps<"input">, "type" | "className"> & {
  label: ReactNode;
  invalid?: boolean;
  className?: string;
};

export function Checkbox({ label, invalid, className, ...rest }: CheckboxProps) {
  return (
    <label className={cx("ap-root ap-choice", className)}>
      <input type="checkbox" {...rest} aria-invalid={invalid ? true : undefined} />
      <span className="ap-choice__box">
        <CheckIcon />
      </span>
      <span>{label}</span>
    </label>
  );
}
