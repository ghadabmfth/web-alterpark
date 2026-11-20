import type { ReactNode } from "react";
import { cx } from "../lib/cx";
import { SmartLink } from "../lib/link";
import { Button } from "../actions/Button";

/*
 * FilterBar — EXTENSION (proposé). GET form of list pages: filters live in the URL (shareable,
 * back button, no JavaScript needed); compact 48 px fields; « Réinitialiser » clears them.
 */
export interface FilterBarProps {
  children: ReactNode;
  action?: string;
  resetHref?: string;
  submitLabel?: string;
  label?: string;
  className?: string;
}

export function FilterBar({ children, action, resetHref, submitLabel = "Filtrer", label = "Filtres", className }: FilterBarProps) {
  return (
    <form className={cx("ap-root ap-filters", className)} method="get" action={action} role="search" aria-label={label}>
      {children}
      <div className="ap-filters__actions">
        <Button type="submit" size="sm">{submitLabel}</Button>
        {resetHref ? <SmartLink className="ap-filters__reset" href={resetHref}>Réinitialiser</SmartLink> : null}
      </div>
    </form>
  );
}
