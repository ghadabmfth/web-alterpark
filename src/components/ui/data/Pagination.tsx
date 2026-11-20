import { cx } from "../lib/cx";
import { SmartLink } from "../lib/link";
import { ArrowLeftIcon, ArrowRightIcon } from "../icons/icons";
import { pageItems } from "./pagination-logic";

/*
 * Pagination — EXTENSION (proposé). Server-rendered links (`hrefFor(page)`), so lists stay
 * shareable and work without JavaScript.
 */
export interface PaginationProps {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
  label?: string;
  className?: string;
}

export function Pagination({ page, totalPages, hrefFor, label = "Pagination", className }: PaginationProps) {
  if (totalPages <= 1) return null;
  const prev = page > 1 ? hrefFor(page - 1) : undefined;
  const next = page < totalPages ? hrefFor(page + 1) : undefined;
  return (
    <nav className={cx("ap-root ap-pagination", className)} aria-label={label}>
      <ol>
        <li>
          {prev ? (
            <SmartLink href={prev} aria-label="Page précédente"><ArrowLeftIcon /></SmartLink>
          ) : (
            <a aria-label="Page précédente" aria-disabled="true"><ArrowLeftIcon /></a>
          )}
        </li>
        {pageItems(page, totalPages).map((p, i) => (
          <li key={i}>
            {p === "…" ? (
              <span className="ap-pagination__gap" aria-hidden>…</span>
            ) : p === page ? (
              <span aria-current="page">
                <span className="ap-sr">Page </span>
                {p}
              </span>
            ) : (
              <SmartLink href={hrefFor(p)} aria-label={`Page ${p}`}>{p}</SmartLink>
            )}
          </li>
        ))}
        <li>
          {next ? (
            <SmartLink href={next} aria-label="Page suivante"><ArrowRightIcon /></SmartLink>
          ) : (
            <a aria-label="Page suivante" aria-disabled="true"><ArrowRightIcon /></a>
          )}
        </li>
      </ol>
    </nav>
  );
}
