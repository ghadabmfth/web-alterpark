import tokens from "./tokens.json";

/*
 * Typed read access to design-system token values for places CSS variables cannot reach:
 * Next.js viewport metadata, payment-page branding (Phase 6), HTML e-mails (Phase 5).
 * In CSS and components, always use var(--token) or the Tailwind theme instead.
 */

interface RawToken {
  name: string;
  value?: unknown;
}

const groups = tokens as unknown as Record<string, { tokens?: RawToken[] }>;

/** Value of a token by name (dark theme value for colours: the system has no light theme). */
export function tokenValue(name: string): string {
  for (const group of Object.values(groups)) {
    const t = group.tokens?.find((x) => x.name === name);
    if (t) {
      const v = t.value;
      if (typeof v === "string" || typeof v === "number") return String(v);
      if (v && typeof v === "object" && "dark" in v) return String((v as { dark: unknown }).dark);
    }
  }
  throw new Error(`Unknown design token: ${name}`);
}
