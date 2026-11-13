// Génère src/components/icons/system-icons.data.ts à partir des SVG intégrés du bundle
// du design system (packages/design-system/source/bundle.js, objet `SVG`).
// Usage : node scripts/generate-icons.mjs (depuis apps/web).
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const bundle = readFileSync(path.resolve(root, "../../packages/design-system/source/bundle.js"), "utf8");
const line = bundle.split("\n").find((l) => l.trimStart().startsWith("var SVG = {"));
if (!line) throw new Error("Objet SVG introuvable dans bundle.js");
const svgs = JSON.parse(line.trim().replace(/^var SVG = /, "").replace(/;$/, ""));

const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
const out = {};
for (const [name, markup] of Object.entries(svgs)) {
  const viewBox = attr(markup.match(/<svg[^>]*>/)[0], "viewBox");
  const paths = [...markup.matchAll(/<path\b[^>]*\/?>/g)].map(([tag]) => {
    const p = { d: attr(tag, "d") };
    const fill = attr(tag, "fill");
    const fillRule = attr(tag, "fill-rule");
    const className = attr(tag, "class");
    if (fill) p.fill = fill;
    if (fillRule) p.fillRule = fillRule;
    if (className) p.className = className;
    return p;
  });
  const unknown = markup.replace(/<\/?svg[^>]*>|<path\b[^>]*\/?>|<\/path>/g, "");
  if (unknown.trim()) throw new Error(`Élément non pris en charge dans ${name}: ${unknown.slice(0, 80)}`);
  out[name] = { viewBox, paths };
}

const header = `/* Fichier généré par scripts/generate-icons.mjs depuis packages/design-system/source/bundle.js. Ne pas modifier. */
/* Pictogrammes monochromes : fill="currentColor". Logo : classes lg-o / lg-bg recolorées par le CSS (.ap-logo). */
`;
const body = `export interface SvgPath { d: string; fill?: string; fillRule?: "evenodd" | "nonzero"; className?: string }
export interface SvgData { viewBox: string; paths: readonly SvgPath[] }

export const SYSTEM_SVGS = ${JSON.stringify(out, null, 1)} as const satisfies Record<string, SvgData>;

export type SystemIconName = keyof typeof SYSTEM_SVGS;
`;
writeFileSync(path.resolve(root, "src/components/icons/system-icons.data.ts"), header + body);
console.log(`${Object.keys(out).length} icônes générées`);
