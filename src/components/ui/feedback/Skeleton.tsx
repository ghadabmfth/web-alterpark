import type { CSSProperties, ReactNode } from "react";
import { cx } from "../lib/cx";

/** Skeleton — EXTENSION (proposé). Placeholder blocks while content loads (static under reduced motion). */
export function Skeleton({ variant = "text", width, className }: { variant?: "text" | "block"; width?: string; className?: string }) {
  return <span className={cx("ap-skeleton", `ap-skeleton--${variant}`, className)} style={width ? ({ width } as CSSProperties) : undefined} aria-hidden />;
}

/** Wraps skeletons: announces the loading state to assistive technologies. */
export function LoadingRegion({ label = "Chargement…", children, className }: { label?: string; children: ReactNode; className?: string }) {
  return (
    <div className={className} aria-busy="true" role="status">
      <span className="ap-sr">{label}</span>
      {children}
    </div>
  );
}
