import { cx } from "../../lib/cx";

export interface BreadcrumbsProps {
  items: { label: string; href?: string }[];
  className?: string;
}

/** Fil d'Ariane des pages intérieures. */
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav className={cx("ap-root ap-crumbs", className)} aria-label="Fil d’Ariane">
      <ol>
        {items.map((it, i) => (
          <li key={i}>{i === items.length - 1 ? <span aria-current="page">{it.label}</span> : <a href={it.href || "#"}>{it.label}</a>}</li>
        ))}
      </ol>
    </nav>
  );
}
