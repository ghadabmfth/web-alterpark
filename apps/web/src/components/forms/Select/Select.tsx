import { useId, type SelectHTMLAttributes } from "react";
import { cx } from "../../lib/cx";
import { FieldShell, fieldDescribedBy, type FieldBase } from "../FieldShell";

export interface SelectProps extends FieldBase, Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> {
  options: (string | { value: string; label: string })[];
  placeholder?: string;
}

/** Liste déroulante native stylée. */
export function Select({ label, help, error, success, className, options, placeholder, id: idProp, ...rest }: SelectProps) {
  const auto = useId();
  const id = idProp || auto;
  const p = { label, help, error, success, className };
  return (
    <FieldShell p={p} id={id} required={rest.required}>
      <select
        {...rest}
        id={id}
        className={cx("ap-input", success && "is-valid")}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={fieldDescribedBy(p, id)}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((o, i) => {
          const v = typeof o === "string" ? { value: o, label: o } : o;
          return (
            <option key={i} value={v.value}>
              {v.label}
            </option>
          );
        })}
      </select>
    </FieldShell>
  );
}
