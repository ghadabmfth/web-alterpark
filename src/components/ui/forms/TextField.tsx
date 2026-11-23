"use client";

import { useId, useState, type ComponentProps } from "react";
import { cx } from "../lib/cx";
import { describedBy, FieldShell, type FieldBaseProps } from "./FieldShell";

/*
 * TextField — design system "Forms". Text, e-mail, password (show/hide button), phone, number,
 * date, or a textarea (`multiline`). Works with React Hook Form: `ref` and native props are
 * forwarded to the control.
 */
type InputProps = Omit<ComponentProps<"input">, "type" | "className">;
type TextareaProps = Omit<ComponentProps<"textarea">, "className">;

export type TextFieldProps = FieldBaseProps & {
  type?: "text" | "email" | "password" | "tel" | "number" | "date" | "time" | "search" | "url";
  /** Forces a visual state — documentation gallery only. */
  state?: "hover" | "focus";
} & (({ multiline?: false } & InputProps) | ({ multiline: true } & TextareaProps));

export function TextField(props: TextFieldProps) {
  const { label, help, error, success, className, type = "text", state, multiline, id: idProp, ...rest } = props;
  const auto = useId();
  const id = idProp ?? auto;
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const common = {
    id,
    className: cx("ap-input", !!success && "is-valid", state && `is-${state}`, isPassword && "ap-input--has-action"),
    "aria-invalid": error ? (true as const) : undefined,
    "aria-describedby": describedBy(id, { help, error, success }),
  };

  return (
    <FieldShell id={id} required={rest.required} label={label} help={help} error={error} success={success} className={className}>
      {multiline ? (
        <textarea {...(rest as TextareaProps)} {...common} />
      ) : (
        <div className="ap-input-wrap">
          <input {...(rest as InputProps)} {...common} type={isPassword && show ? "text" : type} />
          {isPassword ? (
            <button type="button" className="ap-input-wrap__action" aria-pressed={show} aria-controls={id} onClick={() => setShow(!show)}>
              {show ? "Masquer" : "Afficher"}
            </button>
          ) : null}
        </div>
      )}
    </FieldShell>
  );
}
