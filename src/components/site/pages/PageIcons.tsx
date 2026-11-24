import type { ReactNode } from "react";
import type { HowStep, RouteStep } from "@/content/pages-content";

/*
 * Line pictograms of the client page designs (orange stroke on the dark surface). Decorative:
 * the text next to them carries the meaning.
 */
const HOW: Record<HowStep["icon"], ReactNode> = {
  reserver: (
    <>
      <rect x="14" y="6" width="44" height="76" rx="6" />
      <path d="M28 12h16M30 76h12M20 20v-6h6M52 20v-6h-6M20 64v6h6" />
      <rect x="34" y="34" width="52" height="34" rx="4" />
      <path d="M34 44h52M42 60h8M58 60h20" />
          </>
  ),
  parking: (
    <>
      <path d="M60 14v66M30 84h60M36 84v-6M48 84v-6M72 84v-6M84 84v-6" />
      <path d="M22 70V40l4-12h20l4 12v30M22 52h28M22 62h28M28 40h16M30 70v4M42 70v4" />
      <path d="M70 70V40l4-12h20l4 12v30M70 52h28M70 62h28M76 40h16M78 70v4M90 70v4" />
    </>
  ),
  camera: (
    <>
      <path d="M38 22l58 16-6 20-58-16z" />
      <path d="M44 48l-4 14M42 80H14M14 66v28M46 68l-4 12" /><circle cx="46" cy="64" r="5" />
      <path d="M34 14a12 12 0 0 1 8-8M28 12a20 20 0 0 1 12-12" />
    </>
  ),
  navette: (
    <>
      <path d="M18 30h44a6 6 0 0 1 6 6v40H12V36a6 6 0 0 1 6-6zM12 52h56M12 64h56M20 76v8M60 76v8M22 70h4M54 70h4" />
      <circle cx="74" cy="32" r="22" />
      <path d="M64 42l20-20M68 26l8 4M78 36l4 8M66 38l-4 2 2-4" />
    </>
  ),
  route: (
    <>
      <path d="M36 50l-12 46M84 50l12 46M60 58v8M60 74v8M60 90v6" />
      <path d="M38 40l4-14h36l4 14M34 40h52v14H34zM40 54v4M80 54v4M30 36h6M84 36h6" />
    </>
  ),
};

export function HowStepIcon({ name, className }: { name: HowStep["icon"]; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 110 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false">
      {HOW[name]}
    </svg>
  );
}

const ROUTE: Record<RouteStep["icon"], ReactNode> = {
  motorway: <path d="M10 6h12M8 10h16M12 10l-3 16M20 10l3 16M16 13v3M16 19v3M16 25v1" />,
  right: <path d="M8 26V16a6 6 0 0 1 6-6h12M21 5l5 5-5 5" />,
  left: <path d="M24 26V16a6 6 0 0 0-6-6H6M11 5l-5 5 5 5" />,
  roundaboutLeft: <><circle cx="19" cy="14" r="6" /><path d="M19 20v8M13 14H5M9 10l-4 4 4 4" /></>,
  roundaboutRight: <><circle cx="13" cy="14" r="6" /><path d="M13 20v8M19 14h8M23 10l4 4-4 4" /></>,
};

export function RouteIcon({ name, className }: { name: RouteStep["icon"]; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false">
      {ROUTE[name]}
    </svg>
  );
}

export function CompassIcon({ letter, className }: { letter: "S" | "N"; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden focusable="false">
      <circle cx="20" cy="20" r="14" />
      <path d="M20 2v6M20 32v6M2 20h6M32 20h6" strokeLinecap="round" />
      <text x="20" y="25" textAnchor="middle" fontSize="14" fontWeight="800" fill="currentColor" stroke="none">{letter}</text>
    </svg>
  );
}
