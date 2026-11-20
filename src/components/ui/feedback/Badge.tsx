import type { ReactNode } from "react";
import { cx } from "../lib/cx";

/** Badge — EXTENSION (proposé). Status pill; the text is always the status word, never colour alone. */
export type BadgeTone = "neutral" | "primary" | "success" | "warning" | "error" | "info";

export function Badge({ tone = "neutral", children, className }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return <span className={cx("ap-badge", tone !== "neutral" && `ap-badge--${tone}`, className)}>{children}</span>;
}
