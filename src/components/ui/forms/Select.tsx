import { useId, type ComponentProps } from "react";
import { cx } from "../lib/cx";
import { describedBy, FieldShell, type FieldBaseProps } from "./FieldShell";

/** Select — design system "Forms". Styled native select (keyboard and mobile pickers for free). */
export type SelectOption = string | { value: string; label: string; disabled?: boolean };

export type SelectProps = FieldBaseProps &
  Omit<ComponentProps<"select">, "className"> & {
    options: SelectOption[];
    placeholder?: string;
  };

export function Select({ label, help, error, success, className, options, placeholder, id: idProp, ...rest }: SelectProps) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <FieldShell id={id} required={rest.required} label={label} help={help} error={error} success={success} className={className}>
      <select
        {...rest}
        id={id}
        className={cx("ap-input", !!success && "is-valid")}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, { help, error, success })}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((o, i) => {
          const v = typeof o === "string" ? { value: o, label: o } : o;
          return (
            <option key={i} value={v.value} disabled={v.disabled}>
              {v.label}
            </option>
          );
        })}
      </select>
    </FieldShell>
  );
}
