"use client";

import { Fragment, createElement, isValidElement, useEffect, useRef, useState, type ReactElement, type ReactNode } from "react";
import { cx } from "../../lib/cx";
import { plainText } from "../../lib/accentTitle";
import { useInView, useReducedMotion } from "../../lib/hooks";

export interface TypeTitleProps {
  as?: "h1" | "h2" | "h3";
  id?: string;
  className?: string;
  /** ms par caractère (défaut 32) */
  speed?: number;
  children: ReactNode;
}

/* Titre tapé à la machine quand il entre à l'écran : chaque lettre apparaît avec un curseur orange.
   Les mots restent insécables, le texte complet est lu d'un bloc par les lecteurs d'écran (aria-label). */
export function TypeTitle({ as: Tag = "h2", id, className, speed = 32, children }: TypeTitleProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const seen = useInView(ref);
  const reduced = useReducedMotion();
  const label = plainText(children);
  const total = label.length;
  const [n, setN] = useState(0);
  const [finished, setFinished] = useState(false);
  const done = finished || reduced;
  const shown = reduced ? total : n;

  useEffect(() => {
    if (!seen || done) return;
    let t0: number | null = null;
    let raf = 0;
    let end: ReturnType<typeof setTimeout> | undefined;
    const tick = (t: number) => {
      if (t0 === null) t0 = t;
      const k = Math.min(total, Math.floor((t - t0) / speed) + 1);
      setN(k);
      if (k < total) raf = requestAnimationFrame(tick);
      else end = setTimeout(() => setFinished(true), 1400);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      if (end) clearTimeout(end);
    };
    // Une seule passe, au premier passage à l'écran (comme le bundle).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seen]);

  const c = { i: 0 };
  const key = { k: 0 };
  const caret = () => <span key="caret" className="ap-type__caret" />;
  const chars = (str: string): ReactNode[] =>
    str
      .split(/(\s+)/)
      .filter(Boolean)
      .map((w) => {
        if (/^\s+$/.test(w)) {
          const sp = c.i++ === shown - 1 && !done;
          return sp ? (
            <Fragment key={key.k++}>
              {w}
              {caret()}
            </Fragment>
          ) : (
            w
          );
        }
        return (
          <span key={key.k++} className="ap-type__w">
            {w.split("").map((ch) => {
              const idx = c.i++;
              return (
                <span key={key.k++} className={cx("ap-type__c", idx < shown && "is-on")}>
                  {ch}
                  {idx === shown - 1 && !done ? caret() : null}
                </span>
              );
            })}
          </span>
        );
      });
  const walk = (x: ReactNode): ReactNode => {
    if (typeof x === "string") return chars(x);
    if (Array.isArray(x)) return x.map(walk);
    if (isValidElement(x)) {
      const el = x as ReactElement<{ children?: ReactNode }>;
      return createElement(el.type, { ...el.props, key: key.k++ }, walk(el.props.children));
    }
    return x;
  };

  return (
    <Tag ref={ref} id={id} className={cx(className, "ap-type", done && "is-done")} aria-label={label}>
      <span aria-hidden>{walk(children)}</span>
    </Tag>
  );
}
