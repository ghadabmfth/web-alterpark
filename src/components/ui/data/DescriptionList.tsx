import type { ReactNode } from "react";
import { cx } from "../lib/cx";

/** DescriptionList — EXTENSION (proposé). Label / value pairs of detail pages. */
export function DescriptionList({ items, className }: { items: { term: ReactNode; value: ReactNode }[]; className?: string }) {
  return (
    <dl className={cx("ap-dl", className)}>
      {items.map((it, i) => (
        <div key={i}>
          <dt>{it.term}</dt>
          <dd>{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}
