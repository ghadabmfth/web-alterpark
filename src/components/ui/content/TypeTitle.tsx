"use client";

import { Fragment, cloneElement, isValidElement, useEffect, useRef, useState, type ReactElement, type ReactNode } from "react";
import { cx } from "../lib/cx";
import { plainText } from "../lib/text";
import { useInView, useReducedMotion } from "../lib/motion";

/*
 * TypeTitle — typewriter title of the design system: each letter appears with an orange caret
 * when the title enters the viewport. Words stay unbreakable; screen readers get the whole text at
 * once (aria-label). Complete immediately under prefers-reduced-motion, and readable without
 * JavaScript (see the <noscript> rule in the root layout).
 */
export interface TypeTitleProps {
  as?: "h1" | "h2" | "h3";
  id?: string;
  className?: string;
  /** ms per character (default 32). */
  speed?: number;
  children: ReactNode;
}

export function TypeTitle({ as: Tag = "h2", id, className, speed = 32, children }: TypeTitleProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const seen = useInView(ref);
  const reduced = useReducedMotion();
  const label = plainText(children);
  const total = label.length;
  const [typed, setTyped] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!seen || reduced) return;
    let t0: number | null = null;
    let raf = 0;
    let doneTimer: ReturnType<typeof setTimeout> | undefined;
    const tick = (t: number) => {
      if (t0 === null) t0 = t;
      const k = Math.min(total, Math.floor((t - t0) / speed) + 1);
      setTyped(k);
      if (k < total) raf = requestAnimationFrame(tick);
      else doneTimer = setTimeout(() => setFinished(true), 1400);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      if (doneTimer) clearTimeout(doneTimer);
    };
  }, [seen, reduced, total, speed]);

  const n = reduced ? total : typed;
  const done = reduced || finished;

  // Walk the children, wrapping every character; counters are local to this render.
  let index = 0;
  let key = 0;
  const caret = () => <span key="caret" className="ap-type__caret" />;
  const chars = (str: string): ReactNode[] =>
    str
      .split(/(\s+)/)
      .filter(Boolean)
      .map((word) => {
        if (/^\s+$/.test(word)) {
          const here = index++ === n - 1 && !done;
          return here ? <Fragment key={key++}>{word}{caret()}</Fragment> : word;
        }
        return (
          <span key={key++} className="ap-type__w">
            {word.split("").map((ch) => {
              const i = index++;
              return (
                <span key={key++} className={cx("ap-type__c", i < n && "is-on")}>
                  {ch}
                  {i === n - 1 && !done ? caret() : null}
                </span>
              );
            })}
          </span>
        );
      });
  const walk = (node: ReactNode): ReactNode => {
    if (typeof node === "string") return chars(node);
    if (typeof node === "number") return chars(String(node));
    if (Array.isArray(node)) return node.map(walk);
    if (isValidElement<{ children?: ReactNode }>(node)) {
      return cloneElement(node as ReactElement<{ children?: ReactNode }>, { key: key++ }, walk(node.props.children));
    }
    return node;
  };

  return (
    <Tag ref={ref} id={id} className={cx(className, "ap-type", done && "is-done")} aria-label={label}>
      <span aria-hidden>{walk(children)}</span>
    </Tag>
  );
}
