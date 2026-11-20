import { useId, type ComponentProps, type ReactNode } from "react";
import { cx } from "../lib/cx";
import { StatusIcon } from "../icons/icons";

/*
 * DateTimeField — EXTENSION (proposé). Date + time of one instant (arrival, departure): a fieldset
 * whose legend is the label, two native inputs (mobile pickers, keyboard entry) and one message.
 * Native props (incl. React Hook Form `register`) go through `dateProps` / `timeProps`.
 */
type NativeInput = Omit<ComponentProps<"input">, "type" | "className" | "id">;

export interface DateTimeFieldProps {
  legend: ReactNode;
  dateProps?: NativeInput;
  timeProps?: NativeInput;
  help?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  className?: string;
}

export function DateTimeField({ legend, dateProps, timeProps, help, error, required, className }: DateTimeFieldProps) {
  const id = useId();
  const described = [help ? `${id}-help` : null, error ? `${id}-msg` : null].filter(Boolean).join(" ") || undefined;
  const control = (kind: "date" | "time", props?: NativeInput) => (
    <label>
      <span className="ap-sr">{kind === "date" ? "Date" : "Heure"}</span>
      <input
        {...props}
        id={`${id}-${kind}`}
        type={kind}
        required={required}
        className="ap-input"
        aria-invalid={error ? true : undefined}
        aria-describedby={described}
      />
    </label>
  );
  return (
    <fieldset className={cx("ap-root ap-dt", className)}>
      <legend>
        {legend}
        {required ? <span className="ap-field__req" aria-hidden>{" *"}</span> : null}
      </legend>
      <div className="ap-dt__inputs">
        {control("date", dateProps)}
        {control("time", timeProps)}
      </div>
      {help ? <p className="ap-field__help" id={`${id}-help`}>{help}</p> : null}
      {error ? (
        <p className="ap-field__msg ap-field__msg--error" id={`${id}-msg`}>
          <StatusIcon tone="error" />
          <span>{error}</span>
        </p>
      ) : null}
    </fieldset>
  );
}
