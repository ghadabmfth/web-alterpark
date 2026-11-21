import type { ComponentProps, ReactNode } from "react";
import { cx } from "../lib/cx";

/** Toggle — design system "Forms". Switch for a setting applied immediately. */
export type ToggleProps = Omit<ComponentProps<"input">, "type" | "className"> & {
  label: ReactNode;
  className?: string;
};

export function Toggle({ label, className, ...rest }: ToggleProps) {
  return (
    <label className={cx("ap-root ap-toggle", className)}>
      <input type="checkbox" role="switch" {...rest} />
      <span className="ap-toggle__track" aria-hidden />
      <span>{label}</span>
    </label>
  );
}
