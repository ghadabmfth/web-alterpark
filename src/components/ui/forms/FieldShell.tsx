import type { ReactNode } from "react";
import { cx } from "../lib/cx";
import { StatusIcon } from "../icons/icons";

/*
 * Shared frame of the design-system fields: label (with * when required), control, help text,
 * then an error or success message with its icon. The control receives aria-describedby
 * pointing to the help and message ids (see `describedBy`).
 */
export interface FieldBaseProps {
  label: ReactNode;
  help?: ReactNode;
  error?: ReactNode;
  success?: ReactNode;
  className?: string;
}

export function describedBy(id: string, p: Pick<FieldBaseProps, "help" | "error" | "success">): string | undefined {
  const ids: string[] = [];
  if (p.help) ids.push(`${id}-help`);
  if (p.error || p.success) ids.push(`${id}-msg`);
  return ids.join(" ") || undefined;
}

export function FieldShell({ id, required, label, help, error, success, className, children }: FieldBaseProps & { id: string; required?: boolean; children: ReactNode }) {
  return (
    <div className={cx("ap-root ap-field", className)}>
      <label className="ap-field__label" htmlFor={id}>
        {label}
        {required ? <span className="ap-field__req" aria-hidden>{" *"}</span> : null}
      </label>
      {children}
      {help ? <p className="ap-field__help" id={`${id}-help`}>{help}</p> : null}
      {error ? (
        <p className="ap-field__msg ap-field__msg--error" id={`${id}-msg`}>
          <StatusIcon tone="error" />
          <span>{error}</span>
        </p>
      ) : success ? (
        <p className="ap-field__msg ap-field__msg--success" id={`${id}-msg`}>
          <StatusIcon tone="success" />
          <span>{success}</span>
        </p>
      ) : null}
    </div>
  );
}
