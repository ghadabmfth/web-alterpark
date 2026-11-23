import type { ReactNode } from "react";
import { cx } from "../lib/cx";
import { accentTitle } from "../lib/accent-title";
import { TypeTitle } from "./TypeTitle";

/*
 * SectionHeading — design system "Content". Crossroads title (words white, digits and punctuation
 * orange), optional orange eyebrow pill, Montserrat subtitle and body text.
 */
export interface SectionHeadingProps {
  title: ReactNode;
  /** Typewriter effect (default true). */
  typing?: boolean;
  subtitle?: string;
  eyebrow?: string;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
  size?: "display" | "h2";
  children?: ReactNode;
  className?: string;
}

export function SectionHeading({ title, typing = true, subtitle, eyebrow, align, as: Tag = "h2", size, children, className }: SectionHeadingProps) {
  const s = size ?? (Tag === "h1" ? "display" : "h2");
  const cls = cx(s, `ap-${s}`);
  return (
    <div className={cx("ap-root ap-heading", align === "center" && "ap-heading--center", className)}>
      {eyebrow ? <span className="ap-eyebrow">{eyebrow}</span> : null}
      {typing ? (
        <TypeTitle as={Tag} className={cls}>{accentTitle(title)}</TypeTitle>
      ) : (
        <Tag className={cls}>{accentTitle(title)}</Tag>
      )}
      {subtitle ? <p className="h3 ap-h3 ap-heading__subtitle">{subtitle}</p> : null}
      {children ? <div className="body ap-body">{children}</div> : null}
    </div>
  );
}
