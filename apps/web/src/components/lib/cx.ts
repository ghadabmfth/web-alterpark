/** Concatène les classes CSS vraies (équivalent de `cx()` dans bundle.js). */
export function cx(...classes: Array<string | false | null | undefined | 0>): string {
  return classes.filter(Boolean).join(" ");
}
