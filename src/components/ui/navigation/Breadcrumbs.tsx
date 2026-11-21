import { cx } from "../lib/cx";
import { SmartLink } from "../lib/link";

/** Breadcrumbs — design system "Navigation". Inner pages; the last item is the current page. */
export interface BreadcrumbsProps {
  items: { label: string; href?: string }[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav className={cx("ap-root ap-crumbs", className)} aria-label="Fil d’Ariane">
      <ol>
        {items.map((it, i) => (
          <li key={i}>
            {i === items.length - 1 ? (
              <span aria-current="page">{it.label}</span>
            ) : (
              <SmartLink href={it.href ?? "#"}>{it.label}</SmartLink>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
