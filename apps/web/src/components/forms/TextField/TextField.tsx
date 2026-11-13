"use client";

import { useId, useState, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cx } from "../../lib/cx";
import { FieldShell, fieldDescribedBy, type FieldBase } from "../FieldShell";

export interface TextFieldProps extends FieldBase, Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className"> {
  /** `time` ajouté au bundle pour DateTimeField (proposé). */
  type?: "text" | "email" | "password" | "tel" | "number" | "date" | "time";
  /** Rend un <textarea>. */
  multiline?: boolean;
  state?: "hover" | "focus";
}

/** Champ de saisie avec libellé, aide et message : texte, e-mail, mot de passe, téléphone, zone de texte. */
export function TextField({ label, help, error, success, className, multiline, type = "text", id: idProp, state, ...rest }: TextFieldProps) {
  const auto = useId();
  const id = idProp || auto;
  const [show, setShow] = useState(false);
  const isPw = type === "password";
  const p = { label, help, error, success, className };
  const common = {
    id,
    className: cx("ap-input", success && "is-valid", state && `is-${state}`, isPw && "ap-input--has-action"),
    "aria-invalid": error ? ("true" as const) : undefined,
    "aria-describedby": fieldDescribedBy(p, id),
  };
  const control = multiline ? (
    <textarea {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)} {...common} />
  ) : (
    <div className="ap-input-wrap">
      <input type={isPw && show ? "text" : type} {...rest} {...common} />
      {isPw ? (
        <button type="button" className="ap-input-wrap__action" aria-pressed={show} onClick={() => setShow(!show)}>
          {show ? "Masquer" : "Afficher"}
        </button>
      ) : null}
    </div>
  );
  return (
    <FieldShell p={p} id={id} required={rest.required}>
      {control}
    </FieldShell>
  );
}
