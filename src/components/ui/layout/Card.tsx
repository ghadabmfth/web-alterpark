import type { ReactNode } from "react";
import { cx } from "../lib/cx";

/** Card — EXTENSION (proposé). Panel with optional header (title, subtitle, actions) and footer. */
export interface CardProps {
  title?: ReactNode;
  titleAs?: "h2" | "h3";
  subtitle?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  /** Body without padding (tables, lists). */
  flush?: boolean;
  as?: "section" | "article" | "div";
  children?: ReactNode;
  className?: string;
}

export function Card({ title, titleAs: T = "h2", subtitle, actions, footer, flush, as: Tag = "section", children, className }: CardProps) {
  return (
    <Tag className={cx("ap-root ap-card", flush && "ap-card--flush", className)}>
      {title || actions ? (
        <div className="ap-card__head">
          <div>
            {title ? <T className="ap-card__title">{title}</T> : null}
            {subtitle ? <p className="ap-card__subtitle">{subtitle}</p> : null}
          </div>
          {actions ? <div className="ap-card__actions">{actions}</div> : null}
        </div>
      ) : null}
      <div className="ap-card__body">{children}</div>
      {footer ? <div className="ap-card__foot">{footer}</div> : null}
    </Tag>
  );
}
