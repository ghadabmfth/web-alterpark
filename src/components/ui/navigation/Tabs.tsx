import { cx } from "../lib/cx";
import { SmartLink } from "../lib/link";

/** Tabs — EXTENSION (proposé). Navigation between sub-pages (links; the current one is marked). */
export interface TabsProps {
  label: string;
  items: { label: string; href: string; current?: boolean }[];
  className?: string;
}

export function Tabs({ label, items, className }: TabsProps) {
  return (
    <nav className={cx("ap-root ap-tabs", className)} aria-label={label}>
      <ul>
        {items.map((it) => (
          <li key={it.href}>
            <SmartLink href={it.href} aria-current={it.current ? "page" : undefined}>{it.label}</SmartLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
