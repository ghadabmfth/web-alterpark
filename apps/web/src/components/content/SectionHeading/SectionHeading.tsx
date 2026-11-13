import type { ReactNode } from "react";
import { cx } from "../../lib/cx";
import { accentTitle } from "../../lib/accentTitle";
import { TypeTitle } from "../TypeTitle/TypeTitle";

export interface SectionHeadingProps {
  title: ReactNode;
  /** effet machine à écrire (défaut true) */
  typing?: boolean;
  subtitle?: string;
  /** surtitre en pastille orange */
  eyebrow?: string;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
  size?: "display" | "h2";
  children?: ReactNode;
  className?: string;
}

/** Titre de section en Crossroads blanc, chiffres et ponctuation en orange, avec sous-titre et paragraphe facultatifs. */
export function SectionHeading({ title, typing, subtitle, eyebrow, align, as: Tag = "h2", size, children, className }: SectionHeadingProps) {
  const sz = size || (Tag === "h1" ? "display" : "h2");
  const titleCls = cx(sz, `ap-${sz}`);
  return (
    <div className={cx("ap-root ap-heading", align === "center" && "ap-heading--center", className)}>
      {eyebrow ? <span className="ap-eyebrow">{eyebrow}</span> : null}
      {typing === false ? (
        <Tag className={titleCls}>{accentTitle(title)}</Tag>
      ) : (
        <TypeTitle as={Tag} className={titleCls} accent>
          {title}
        </TypeTitle>
      )}
      {subtitle ? <p className="h3 ap-h3 ap-heading__subtitle">{subtitle}</p> : null}
      {children ? <div className="body ap-body">{children}</div> : null}
    </div>
  );
}
