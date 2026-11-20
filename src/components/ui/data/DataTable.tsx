import type { ReactNode } from "react";
import { cx } from "../lib/cx";

/*
 * DataTable — EXTENSION (proposé). Semantic table with a caption (visible or screen-reader only),
 * column headers with scope, numeric columns right-aligned, horizontal scroll on small screens,
 * and an empty state instead of an empty body.
 */
export interface Column<Row> {
  key: string;
  header: ReactNode;
  cell: (row: Row) => ReactNode;
  align?: "start" | "end";
  nowrap?: boolean;
}

export interface DataTableProps<Row> {
  caption: string;
  captionHidden?: boolean;
  columns: Column<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  empty?: ReactNode;
  className?: string;
}

export function DataTable<Row>({ caption, captionHidden = true, columns, rows, rowKey, empty, className }: DataTableProps<Row>) {
  if (rows.length === 0 && empty) return <>{empty}</>;
  return (
    <div className={cx("ap-root ap-table-wrap", className)} tabIndex={0} role="region" aria-label={caption}>
      <table className="ap-table">
        <caption className={captionHidden ? "ap-sr" : undefined}>{caption}</caption>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" className={cx(c.align === "end" && "is-num")}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={rowKey(r)}>
              {columns.map((c) => (
                <td key={c.key} className={cx(c.align === "end" && "is-num", c.nowrap && "is-nowrap")}>{c.cell(r)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
