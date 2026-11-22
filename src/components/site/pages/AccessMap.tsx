/*
 * Schematic access map of the client design « Plan accès » (not to scale). Drawn in SVG so it
 * stays sharp and uses the design tokens; the written itineraries below carry the same
 * information for screen readers.
 */
const ROADS = [
  "M20 274H1410", // airport road (D85, from exit 51)
  "M550 274V100H752V274", // airport loop
  "M750 274V400",
  "M40 400H750",
  "M750 400L1088 588L1420 760", // towards exit 50 (D823)
  "M185 400V780H20",
  "M20 588H1088",
  "M462 400V780",
  "M462 476H575M462 520H575",
  "M750 588V780",
  "M928 600V780",
];
const ROUNDABOUTS: [number, number][] = [[750, 274], [750, 400], [185, 400], [185, 588], [462, 588], [750, 588], [1088, 588]];
const ROUTE = "M1395 274H785M750 300V372M720 400H215M185 430V560M185 618V795H160M1400 748L1118 600M1058 588H780M720 588H492M432 588H215";
const PLACES: { x: number; y: number; label: string; below?: boolean; left?: boolean }[] = [
  { x: 243, y: 347, label: "IDEA Group" },
  { x: 624, y: 350, label: "Dasher" },
  { x: 840, y: 382, label: "Oceania" },
  { x: 330, y: 453, label: "Tipiak" },
  { x: 515, y: 447, label: "HERTZ / Avis" },
  { x: 40, y: 548, label: "Bollore" },
  { x: 515, y: 541, label: "Groupe PLG" },
  { x: 945, y: 541, label: "IRT Jules Verne", left: true },
  { x: 1217, y: 572, label: "AIRBUS" },
  { x: 278, y: 633, label: "Val PG" },
  { x: 840, y: 635, label: "Daher", below: true },
  { x: 227, y: 746, label: "TEA Nantes" },
  { x: 968, y: 746, label: "Techno Campus" },
  { x: 1260, y: 717, label: "Un zest d’aroma", below: true },
];
const MOTORWAYS: { x: number; y: number; top: string[]; bottom: string[]; anchor: "start" | "end" }[] = [
  { x: 1433, y: 275, top: ["Sortie 51", "Porte de Grand Lieu"], bottom: ["D85"], anchor: "end" },
  { x: 54, y: 400, top: ["D85"], bottom: ["St Aignan", "de Gd Lieu"], anchor: "start" },
  { x: 1432, y: 757, top: ["D823"], bottom: ["Sortie 50", "Porte de Retz"], anchor: "end" },
];

function Pin({ x, y }: { x: number; y: number }) {
  return <path className="amap__pin" d={`M${x} ${y + 14}c-8-9-12-14-12-20a12 12 0 0 1 24 0c0 6-4 11-12 20z`} />;
}

export function AccessMap() {
  return (
    <figure className="amap">
      <div className="amap__scroll" tabIndex={0} role="region" aria-label="Plan d’accès schématique (faites défiler horizontalement sur mobile)">
        <svg viewBox="0 0 1500 950" role="img" aria-labelledby="amap-title" className="amap__svg">
          <title id="amap-title">Plan d’accès schématique : Alterpark se trouve rue Dieudonné Costes à Saint-Aignan-de-Grandlieu, au sud-ouest de l’aéroport Nantes Atlantique, entre la sortie 51 (Porte de Grand Lieu, D85) et la sortie 50 (Porte de Retz, D823).</title>
          <g className="amap__roads">
            {ROADS.map((d) => <path key={d} d={d} />)}
          </g>
          <g className="amap__roads-inner">
            {ROADS.map((d) => <path key={d} d={d} />)}
          </g>
          <path className="amap__route" d={ROUTE} />
          {ROUNDABOUTS.map(([x, y]) => (
            <g key={`${x}-${y}`} className="amap__rb">
              <circle cx={x} cy={y} r="27" />
              <path d={`M${x - 12} ${y - 5}a13 13 0 0 1 17-8M${x + 12} ${y + 5}a13 13 0 0 1-17 8M${x + 5} ${y - 13}l-1-5M${x - 5} ${y + 13}l1 5`} />
            </g>
          ))}
          {MOTORWAYS.map((m) => (
            <g key={`${m.x}-${m.y}`}>
              <rect className="amap__sign" x={m.x - 24} y={m.y - 24} width="48" height="48" rx="4" />
              <path className="amap__sign-glyph" d={`M${m.x - 14} ${m.y - 10}h28M${m.x - 8} ${m.y - 10}l-5 22M${m.x + 8} ${m.y - 10}l5 22M${m.x} ${m.y - 4}v4M${m.x} ${m.y + 5}v6`} />
              {m.top.map((t, i) => <text key={t} className="amap__label" x={m.anchor === "end" ? m.x + 24 : m.x - 24} y={m.y - 40 - (m.top.length - 1 - i) * 22} textAnchor={m.anchor}>{t}</text>)}
              {m.bottom.map((t, i) => <text key={t} className="amap__label" x={m.anchor === "end" ? m.x + 24 : m.x - 24} y={m.y + 48 + i * 22} textAnchor={m.anchor}>{t}</text>)}
            </g>
          ))}
          <g>
            <rect className="amap__sign" x="548" y="24" width="38" height="38" rx="4" />
            <path className="amap__sign-glyph" d="M567 30v26M556 44l11-6 11 6M561 54l6-3 6 3" />
            <text className="amap__label" x="598" y="38">Aéroport Nantes</text>
            <text className="amap__label" x="598" y="60">Atlantique</text>
          </g>
          {[{ x: 810, y: 216, t: "P5 Nord" }, { x: 445, y: 312, t: "P3 Sud" }].map((p) => (
            <g key={p.t}>
              <rect className="amap__sign" x={p.x - 15} y={p.y - 16} width="30" height="32" rx="3" />
              <text className="amap__p" x={p.x} y={p.y + 10} textAnchor="middle">P</text>
              <text className="amap__label" x={p.x + 22} y={p.y + 7}>{p.t}</text>
            </g>
          ))}
          {PLACES.map((p) => (
            <g key={p.label}>
              <Pin x={p.x} y={p.y} />
              <text className="amap__label" x={p.below ? p.x : p.left ? p.x - 20 : p.x + 20} y={p.below ? p.y + 36 : p.y + 6} textAnchor={p.below ? "middle" : p.left ? "end" : "start"}>{p.label}</text>
            </g>
          ))}
          <Pin x={148} y={800} />
          <text className="amap__brand" x="64" y="868">ALTER</text>
          <text className="amap__brand" x="64" y="908">PARK</text>
          <text className="amap__label amap__label--accent" x="64" y="936">L’autre parking</text>
        </svg>
      </div>
    </figure>
  );
}
