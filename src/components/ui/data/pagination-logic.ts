/**
 * Page numbers to display: first, last, current ±1, with gaps ("…") where pages are skipped.
 * pageItems(5, 20) → [1, "…", 4, 5, 6, "…", 20]
 */
export function pageItems(current: number, total: number): Array<number | "…"> {
  if (total <= 7) return Array.from({ length: Math.max(0, total) }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: Array<number | "…"> = [];
  sorted.forEach((p, i) => {
    const prev = sorted[i - 1];
    if (prev !== undefined && p - prev > 1) out.push(p - prev === 2 ? prev + 1 : "…");
    out.push(p);
  });
  return out;
}
