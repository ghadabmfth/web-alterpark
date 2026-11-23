import type { ReactNode } from "react";

/*
 * Crossroads titles: words white, digits and punctuation orange, as in the mock-up (bundle
 * `accentTitle`). Words between [brackets] are accented too: « votre parking [couvert] ».
 */
const ACCENT = /([0-9]+(?:[ ,.][0-9]+)*|[!?,.:;&“”"«»()])/;

export function accentTitle(title: ReactNode): ReactNode {
  if (typeof title !== "string") return title;
  const out: ReactNode[] = [];
  let k = 0;
  title.split(/\[([^\]]+)\]/).forEach((seg, j) => {
    if (j % 2) {
      out.push(<span key={k++} className="ap-accent">{seg}</span>);
      return;
    }
    seg.split(ACCENT).forEach((part, i) => {
      if (!part) return;
      out.push(i % 2 ? <span key={k++} className="ap-accent">{part}</span> : part);
    });
  });
  return out;
}
