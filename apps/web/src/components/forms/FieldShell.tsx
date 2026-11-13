import type { ReactNode } from "react";
import { cx } from "../lib/cx";
import { ErrorIcon, SuccessIcon } from "../icons/ui";

export interface FieldBase {
  label: string;
  help?: string;
  error?: string;
  success?: string;
  className?: string;
}

/** aria-describedby d'un champ : aide puis message. */
export function fieldDescribedBy(p: FieldBase, id: string): string | undefined {
  const d: string[] = [];
  if (p.help) d.push(`${id}-help`);
  if (p.error || p.success) d.push(`${id}-msg`);
  return d.join(" ") || undefined;
}

/** Libellé, contrôle, aide et message (succès ou erreur, toujours avec icône et texte). */
export function FieldShell({ p, id, required, children }: { p: FieldBase; id: string; required?: boolean; children: ReactNode }) {
  return (
    <div className={cx("ap-root ap-field", p.className)}>
      <label className="ap-field__label" htmlFor={id}>
        {p.label}
        {required ? (
          <span className="ap-field__req" aria-hidden>
            {" *"}
          </span>
        ) : null}
      </label>
      {children}
      {p.help ? (
        <p className="ap-field__help" id={`${id}-help`}>
          {p.help}
        </p>
      ) : null}
      {p.error ? (
        <p className="ap-field__msg ap-field__msg--error" id={`${id}-msg`}>
          <ErrorIcon />
          <span>{p.error}</span>
        </p>
      ) : p.success ? (
        <p className="ap-field__msg ap-field__msg--success" id={`${id}-msg`}>
          <SuccessIcon />
          <span>{p.success}</span>
        </p>
      ) : null}
    </div>
  );
}
