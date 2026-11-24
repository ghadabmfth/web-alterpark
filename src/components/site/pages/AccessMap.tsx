import type { AccessMapData, MapSign } from "@/content/access-maps";

/*
 * Schematic access map (data in src/content/access-maps.ts). Drawn in SVG so it stays sharp and
 * uses the design tokens; the written itineraries carry the same information for screen readers.
 */

function Pin({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return <path className="amap__pin" d={`M${x} ${y + 14 * s}c${-8 * s} ${-9 * s} ${-12 * s} ${-14 * s} ${-12 * s} ${-20 * s}a${12 * s} ${12 * s} 0 0 1 ${24 * s} 0c0 ${6 * s} ${-4 * s} ${11 * s} ${-12 * s} ${20 * s}z`} />;
}

function Lines({ lines, x, y, anchor, step }: { lines: string[]; x: number; y: number; anchor: "start" | "end" | "middle"; step: number }) {
  return (
    <>
      {lines.map((t, i) => (
        <text key={`${t}-${i}`} className="amap__label" x={x} y={y + i * step} textAnchor={anchor}>{t}</text>
      ))}
    </>
  );
}

function Sign({ sign, glyph, fs }: { sign: MapSign; glyph: "motorway" | "plane"; fs: number }) {
  const size = sign.size ?? 48;
  const h = size / 2;
  const { x, y } = sign;
  const step = fs * 1.25;
  const k = size / 48;
  const d =
    glyph === "motorway"
      ? `M${x - 14 * k} ${y - 10 * k}h${28 * k}M${x - 8 * k} ${y - 10 * k}l${-5 * k} ${22 * k}M${x + 8 * k} ${y - 10 * k}l${5 * k} ${22 * k}M${x} ${y - 4 * k}v${4 * k}M${x} ${y + 5 * k}v${6 * k}`
      : `M${x} ${y - 13 * k}v${26 * k}M${x - 11 * k} ${y + 1 * k}l${11 * k} ${-6 * k} ${11 * k} ${6 * k}M${x - 6 * k} ${y + 11 * k}l${6 * k} ${-3 * k} ${6 * k} ${3 * k}`;
  const edge = sign.align === "end" ? x + h : x - h;
  return (
    <g>
      <rect className="amap__sign" x={x - h} y={y - h} width={size} height={size} rx={4} />
      <path className="amap__sign-glyph" d={d} />
      {sign.above ? <Lines lines={sign.above} x={edge} y={y - h - 12 - (sign.above.length - 1) * step} anchor={sign.align} step={step} /> : null}
      {sign.below ? <Lines lines={sign.below} x={edge} y={y + h + fs + 6} anchor={sign.align} step={step} /> : null}
      {sign.beside ? (
        <Lines lines={sign.beside} x={sign.align === "end" ? x - h - 10 : x + h + 10} y={y - ((sign.beside.length - 1) * step) / 2 + fs * 0.35} anchor={sign.align} step={step} />
      ) : null}
    </g>
  );
}

export function AccessMap({ map }: { map: AccessMapData }) {
  const [w, h] = map.viewBox;
  const fs = map.fontSize;
  const r = map.roundaboutRadius;
  const k = r / 27;
  const ps = fs / 17;
  return (
    <figure className="amap">
      <div className="amap__scroll" tabIndex={0} role="region" aria-label="Plan d’accès schématique (faites défiler horizontalement sur mobile)">
        <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-labelledby={`amap-title-${w}`} className="amap__svg" style={{ minWidth: map.minWidth, ["--amap-fs" as string]: `${fs}px` }}>
          <title id={`amap-title-${w}`}>{map.title}</title>
          {map.areas?.map((a) => (
            <path key={a.d} className={`amap__area amap__area--${a.tone}`} d={a.d} />
          ))}
          <g className="amap__roads" style={{ strokeWidth: map.road.outer }}>
            {map.roads.map((d) => <path key={d} d={d} />)}
          </g>
          <g className="amap__roads-inner" style={{ strokeWidth: map.road.inner }}>
            {map.roads.map((d) => <path key={d} d={d} />)}
          </g>
          {map.areas?.map((a) =>
            a.label && a.lx !== undefined && a.ly !== undefined ? (
              <Lines key={`l-${a.d}`} lines={a.label} x={a.lx} y={a.ly + fs * 0.35 - ((a.label.length - 1) * fs * 1.2) / 2} anchor="middle" step={fs * 1.2} />
            ) : null,
          )}
          {map.labels?.map((l) => (
            <text key={`${l.text}-${l.x}`} className={`amap__label${l.strong ? " amap__label--strong" : ""}${l.ink ? " amap__label--ink" : ""}`} x={l.x} y={l.y} textAnchor="middle">{l.text}</text>
          ))}
          {map.streets?.map((s) => (
            <text key={s.text} className="amap__street" x={s.x} y={s.y} textAnchor="middle" transform={s.rotate ? `rotate(${s.rotate} ${s.x} ${s.y})` : undefined}>{s.text}</text>
          ))}
          <path className="amap__route" d={map.route} />
          {map.arrows?.map(([x, y, a]) => (
            <path key={`${x}-${y}`} className="amap__arrow" d={`M${x} ${y}l-11 -6v12z`} transform={`rotate(${a} ${x} ${y})`} />
          ))}
          {map.roundabouts.map(([x, y]) => (
            <g key={`${x}-${y}`} className="amap__rb">
              <circle cx={x} cy={y} r={r} />
              <path d={`M${x - 12 * k} ${y - 5 * k}a${13 * k} ${13 * k} 0 0 1 ${17 * k} ${-8 * k}M${x + 12 * k} ${y + 5 * k}a${13 * k} ${13 * k} 0 0 1 ${-17 * k} ${8 * k}M${x + 5 * k} ${y - 13 * k}l${-1 * k} ${-5 * k}M${x - 5 * k} ${y + 13 * k}l${1 * k} ${5 * k}`} />
            </g>
          ))}
          {map.badges?.map((b, i) => {
            const bw = b.text.length * fs * 0.62 + 10;
            return (
              <g key={`${b.text}-${i}`}>
                <rect className="amap__badge" x={b.x - bw / 2} y={b.y - fs * 0.75} width={bw} height={fs * 1.5} rx={2} />
                <text className="amap__badge-text" x={b.x} y={b.y + fs * 0.35} textAnchor="middle">{b.text}</text>
              </g>
            );
          })}
          {map.motorways.map((m) => <Sign key={`${m.x}-${m.y}`} sign={m} glyph="motorway" fs={fs} />)}
          <Sign sign={map.airport} glyph="plane" fs={fs} />
          {map.parkingSigns?.map((p) => (
            <g key={p.label}>
              <rect className="amap__sign" x={p.x - 15} y={p.y - 16} width="30" height="32" rx="3" />
              <text className="amap__p" x={p.x} y={p.y + 10} textAnchor="middle">P</text>
              <text className="amap__label" x={p.x + 22} y={p.y + 7}>{p.label}</text>
            </g>
          ))}
          {map.places.map((p, i) => {
            const lines = Array.isArray(p.label) ? p.label : [p.label];
            const step = fs * 1.2;
            const side = p.side ?? "right";
            const top = p.y + fs * 0.35 - ((lines.length - 1) * step) / 2;
            return (
              <g key={`${lines.join(" ")}-${i}`}>
                <Pin x={p.x} y={p.y} s={ps} />
                {side === "below" ? (
                  <Lines lines={lines} x={p.x} y={p.y + 20 * ps + fs} anchor="middle" step={step} />
                ) : (
                  <Lines lines={lines} x={side === "left" ? p.x - 18 * ps : p.x + 18 * ps} y={top - 4 * ps} anchor={side === "left" ? "end" : "start"} step={step} />
                )}
              </g>
            );
          })}
          {map.brand ? (
            <g className="amap__brand-group">
              <Pin x={map.brand.pin[0]} y={map.brand.pin[1]} s={ps} />
              <text className="amap__brand" x={map.brand.x} y={map.brand.y} style={{ fontSize: map.brand.size, letterSpacing: map.brand.size / 4 }}>ALTER</text>
              <text className="amap__brand" x={map.brand.x} y={map.brand.y + map.brand.size} style={{ fontSize: map.brand.size, letterSpacing: map.brand.size / 4 }}>PARK</text>
              <text className="amap__label amap__label--accent" x={map.brand.x} y={map.brand.y + map.brand.size * 1.7}>L’autre parking</text>
            </g>
          ) : null}
          {map.meeting ? (
            <g className="amap__meeting">
              <path className="amap__callout" d={`M${map.meeting.x} ${map.meeting.y + 14}L${map.meeting.x + 20} ${map.meeting.y + 140}`} />
              <rect className="amap__meeting-box" x={map.meeting.x - 110} y={map.meeting.y + 140} width={260} height={fs * 1.25 * map.meeting.label.length + 18} rx={6} />
              {map.meeting.label.map((t, i) => (
                <text key={t} className={`amap__meeting-text${i ? "" : " amap__meeting-text--main"}`} x={map.meeting!.x + 20} y={map.meeting!.y + 140 + 9 + fs + i * fs * 1.25} textAnchor="middle">{t}</text>
              ))}
              <path className="amap__star" d={`M${map.meeting.x} ${map.meeting.y - 16}l4.5 11.5 11.5 4.5-11.5 4.5-4.5 11.5-4.5-11.5-11.5-4.5 11.5-4.5z`} />
            </g>
          ) : null}
        </svg>
      </div>
    </figure>
  );
}
