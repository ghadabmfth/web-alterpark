import { useId, type ChangeEventHandler } from "react";
import { cx } from "../lib/cx";

/** RadioGroup — design system "Forms". Single choice in a fieldset with a legend. */
export interface RadioGroupProps {
  legend: string;
  name?: string;
  options: (string | { value: string; label: string; disabled?: boolean })[];
  value?: string;
  defaultValue?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  className?: string;
}

export function RadioGroup({ legend, name, options, value, defaultValue, onChange, className }: RadioGroupProps) {
  const auto = useId();
  const groupName = name ?? auto;
  return (
    <fieldset className={cx("ap-root ap-choices", className)}>
      <legend>{legend}</legend>
      {options.map((o, i) => {
        const v = typeof o === "string" ? { value: o, label: o, disabled: false } : o;
        return (
          <label key={i} className="ap-choice ap-choice--radio">
            <input
              type="radio"
              name={groupName}
              value={v.value}
              defaultChecked={value === undefined ? defaultValue === v.value : undefined}
              checked={value === undefined ? undefined : value === v.value}
              disabled={v.disabled}
              onChange={onChange}
            />
            <span className="ap-choice__box" />
            <span>{v.label}</span>
          </label>
        );
      })}
    </fieldset>
  );
}
