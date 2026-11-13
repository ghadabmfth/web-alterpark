import type { ReactNode } from "react";

/* Titres Crossroads : mots blancs, chiffres et ponctuation orange (classe ap-accent), comme dans la maquette.
   Mots entre [crochets] : mis en orange comme la ponctuation (« votre parking [couvert] »).
   Porté tel quel depuis `accentTitle()` de bundle.js. */
export const ACCENT = /([0-9]+(?:[ ,.][0-9]+)*|[!?,.:;&“”"«»()])/;

export function accentTitle(title: ReactNode): ReactNode {
  if (typeof title !== "string") return title;
  const out: ReactNode[] = [];
  let k = 0;
  title.split(/\[([^\]]+)\]/).forEach((seg, j) => {
    if (j % 2) {
      out.push(
        <span key={k++} className="ap-accent">
          {seg}
        </span>,
      );
      return;
    }
    seg.split(ACCENT).forEach((part, i) => {
      if (!part) return;
      out.push(
        i % 2 ? (
          <span key={k++} className="ap-accent">
            {part}
          </span>
        ) : (
          part
        ),
      );
    });
  });
  return out;
}

/** Texte brut d'un nœud React (titres tapés, noms accessibles). */
export function plainText(node: ReactNode): string {
  if (node == null || node === false || node === true) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(plainText).join("");
  if (typeof node === "object" && "props" in node) {
    return plainText((node.props as { children?: ReactNode }).children);
  }
  return "";
}
