import type { ReactNode } from "react";
import { cx } from "../lib/cx";

/*
 * StatTile — EXTENSION (proposé). Back-office KPI. The value must be preformatted from real data;
 * a trend always carries words (« +12 % vs. mois précédent »), never colour alone.
 */
export interface StatTileProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  trend?: { direction: "up" | "down" | "flat"; text: string };
  className?: string;
}

export function StatTile({ label, value, hint, trend, className }: StatTileProps) {
  return (
    <div className={cx("ap-root ap-stat", className)}>
      <p className="ap-stat__label">{label}</p>
      <p className="ap-stat__value">{value}</p>
      {trend || hint ? (
        <p className="ap-stat__hint">
          {trend ? (
            <span className={cx("ap-stat__trend", trend.direction !== "flat" && `ap-stat__trend--${trend.direction}`)}>{trend.text}</span>
          ) : null}
          {trend && hint ? " · " : null}
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function StatGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("ap-stat-grid", className)}>{children}</div>;
}
