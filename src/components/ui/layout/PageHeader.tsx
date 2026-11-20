import type { ReactNode } from "react";
import { cx } from "../lib/cx";
import { accentTitle } from "../lib/accent-title";
import { Breadcrumbs } from "../navigation/Breadcrumbs";

/*
 * PageHeader — EXTENSION (proposé). Top of app pages (customer area, back office): breadcrumbs,
 * the page's single H1 at section-title size, description and actions.
 */
export interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, breadcrumbs, actions, className }: PageHeaderProps) {
  return (
    <header className={cx("ap-root ap-pagehead", className)}>
      {breadcrumbs?.length ? <Breadcrumbs items={breadcrumbs} /> : null}
      <div className="ap-pagehead__row">
        <div className="ap-pagehead__text">
          <h1 className="h2 ap-h2">{accentTitle(title)}</h1>
          {description ? <p className="ap-pagehead__desc">{description}</p> : null}
        </div>
        {actions ? <div className="ap-pagehead__actions">{actions}</div> : null}
      </div>
    </header>
  );
}
