"use client";

import { useId, useState, type ReactNode } from "react";
import { cx } from "../../lib/cx";
import { ChevronIcon } from "../../icons/ui";

export interface AccordionProps {
  items: { title: string; content: ReactNode }[];
  multiple?: boolean;
  defaultOpen?: number | number[];
  headingAs?: "h2" | "h3" | "h4";
  className?: string;
}

/** Liste de questions dépliables, séparées par le filet pointillé de la marque. */
export function Accordion({ items, multiple, defaultOpen, headingAs: T = "h3", className }: AccordionProps) {
  const base = useId();
  const [open, setOpen] = useState<number[]>(defaultOpen == null ? [] : ([] as number[]).concat(defaultOpen));
  const toggle = (i: number) => {
    const on = open.includes(i);
    if (multiple) setOpen(on ? open.filter((x) => x !== i) : open.concat(i));
    else setOpen(on ? [] : [i]);
  };
  return (
    <div className={cx("ap-root ap-accordion", className)}>
      {items.map((it, i) => {
        const on = open.includes(i);
        return (
          <div key={i} className="ap-acc__item">
            <T style={{ margin: 0 }}>
              <button
                type="button"
                className="ap-acc__btn"
                id={`${base}-b${i}`}
                aria-expanded={on}
                aria-controls={`${base}-p${i}`}
                onClick={() => toggle(i)}
              >
                <span>{it.title}</span>
                <ChevronIcon />
              </button>
            </T>
            <div className="ap-acc__panel" id={`${base}-p${i}`} role="region" aria-labelledby={`${base}-b${i}`} hidden={!on}>
              {it.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
