import type { ReactNode } from "react";
import { cx } from "../lib/cx";
import { FeatureIcon, type FeatureIconName } from "../icons/sets";

/** EmptyState — EXTENSION (proposé). Explains why a list is empty and offers the next action. */
export interface EmptyStateProps {
  title: string;
  text?: ReactNode;
  icon?: FeatureIconName;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, text, icon = "ticket", action, className }: EmptyStateProps) {
  return (
    <div className={cx("ap-root ap-empty", className)}>
      <FeatureIcon name={icon} className="ap-empty__ico" />
      <p className="ap-empty__title">{title}</p>
      {text ? <p className="ap-empty__text">{text}</p> : null}
      {action ? <div className="ap-empty__action">{action}</div> : null}
    </div>
  );
}
