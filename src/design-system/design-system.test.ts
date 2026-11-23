import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/*
 * Guards the design-system layer:
 *  - tokens.css is still the supplied file (values equal tokens.json);
 *  - Tailwind breakpoints mirror the bp-* tokens (media queries cannot read variables);
 *  - no colour literal is written outside src/design-system.
 */

const dir = path.resolve(import.meta.dirname);
const src = path.resolve(dir, "..");

interface Token {
  name: string;
  /** A plain value, or one value per theme (`{ dark: … }`: the system defines a dark theme only). */
  value?: string | Record<string, string>;
}
const json = JSON.parse(readFileSync(path.join(dir, "tokens.json"), "utf8")) as Record<string, { tokens?: Token[] }>;
const tokensCss = readFileSync(path.join(dir, "tokens.css"), "utf8");
const themeCss = readFileSync(path.join(dir, "theme.css"), "utf8");

function cssVar(css: string, name: string): string | undefined {
  return new RegExp(`--${name}:\\s*([^;]+);`).exec(css)?.[1]?.trim();
}
const norm = (v: string) => v.replace(/\s+/g, " ").toLowerCase();

describe("tokens.css", () => {
  for (const group of ["color", "spacing", "radius", "shadow", "breakpoint", "zIndex", "container", "transition"]) {
    it(`matches tokens.json for "${group}"`, () => {
      const tokens = json[group]?.tokens ?? [];
      expect(tokens.length).toBeGreaterThan(0);
      for (const t of tokens) {
        const expected = typeof t.value === "object" ? t.value.dark : t.value;
        expect(expected, t.name).toBeDefined();
        expect(norm(cssVar(tokensCss, t.name) ?? "<missing>"), t.name).toBe(norm(String(expected)));
      }
    });
  }
});

describe("theme.css", () => {
  it("mirrors the bp-* tokens exactly", () => {
    for (const t of json.breakpoint?.tokens ?? []) {
      const key = t.name.replace(/^bp-/, "");
      expect(cssVar(themeCss, `breakpoint-${key}`), t.name).toBe(t.value);
    }
  });

  it("exposes only design-system spacing steps", () => {
    const steps = [...themeCss.matchAll(/--spacing-(\d+):/g)].map((m) => Number(m[1]));
    const system = (json.spacing?.tokens ?? []).map((t) => t.name).filter((n) => /^space-\d+$/.test(n)).map((n) => Number(n.slice(6)));
    expect(steps.filter((s) => s !== 0).sort((a, b) => a - b)).toEqual(system.sort((a, b) => a - b));
  });
});

describe("source files", () => {
  function files(d: string): string[] {
    return readdirSync(d).flatMap((f) => {
      const p = path.join(d, f);
      if (statSync(p).isDirectory()) return p.includes(`${path.sep}generated`) ? [] : files(p);
      return /\.(tsx?|css)$/.test(f) && !f.endsWith(".test.ts") ? [p] : [];
    });
  }

  it("contain no colour literal outside src/design-system", () => {
    const offenders = files(src)
      .filter((f) => !f.startsWith(dir))
      .flatMap((f) => {
        const text = readFileSync(f, "utf8");
        return /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i.test(text) ? [path.relative(src, f)] : [];
      });
    expect(offenders).toEqual([]);
  });
});

describe("component styles", () => {
  const read = (p: string) => readFileSync(path.join(dir, p), "utf8");

  it("are the reference bundle split verbatim (fonts and typography sections live elsewhere)", () => {
    const bundle = readFileSync(path.resolve(dir, "../../docs/design-system/reference/bundle.css"), "utf8");
    const order = [...read("components/index.css").matchAll(/@import "\.\/(.+?)";/g)].map((m) => m[1]!);
    expect(order.length).toBe(30);
    const strip = (css: string) => css.split("\n").slice(1).join("\n").trimEnd();
    for (const name of order) {
      const part = strip(read(`components/${name}`));
      expect(bundle.includes(part), `${name} differs from the bundle`).toBe(true);
    }
  });

  it("extensions and component overrides contain no colour literal", () => {
    const files = [
      ...readdirSync(path.join(dir, "extensions")).map((f) => `extensions/${f}`),
      "overrides-components.css",
    ];
    const offenders = files.filter((f) => /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i.test(read(f)));
    expect(offenders).toEqual([]);
  });
});
