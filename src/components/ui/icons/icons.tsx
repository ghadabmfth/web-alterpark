import type { ReactNode, SVGProps } from "react";
import { ARROW_PATH, STAR_PATH } from "@/design-system/icons/svg-data";

/*
 * Interface icons of the design system (bundle `icons`). Arrow and star come from the source file;
 * the others are the system's proposed icons: 2.5 px stroke, round caps, currentColor.
 */

type IconProps = { className?: string };

function Stroke({ viewBox, children, strokeWidth = 2.5, className }: { viewBox: string; children: ReactNode; strokeWidth?: number; className?: string }) {
  const props: SVGProps<SVGSVGElement> = {
    viewBox,
    "aria-hidden": true,
    focusable: "false",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
  };
  return <svg {...props}>{children}</svg>;
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 27.24 27.24" aria-hidden focusable="false" className={className}>
      <path d={ARROW_PATH} fill="currentColor" />
    </svg>
  );
}

export function ArrowLeftIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 27.24 27.24" aria-hidden focusable="false" className={className}>
      <path d={ARROW_PATH} fill="currentColor" transform="translate(27.24 0) scale(-1 1)" />
    </svg>
  );
}

export function StarIcon({ off, className }: IconProps & { off?: boolean }) {
  return (
    <svg viewBox="0 0 11.25 10" aria-hidden focusable="false" className={off ? "is-off" : className}>
      <path d={STAR_PATH} fill="currentColor" transform="translate(0 8.75) scale(10 -10)" />
    </svg>
  );
}

export function ChevronIcon({ className }: IconProps) {
  return <Stroke viewBox="0 0 20 20" className={className}><path d="M5 7.5l5 5 5-5" /></Stroke>;
}

export function CloseIcon({ className }: IconProps) {
  return <Stroke viewBox="0 0 24 24" className={className}><path d="M6 6l12 12" /><path d="M18 6L6 18" /></Stroke>;
}

export function CheckIcon({ className }: IconProps) {
  return <Stroke viewBox="0 0 16 16" strokeWidth={2.6} className={className}><path d="M3 8.5l3.2 3.2L13 5" /></Stroke>;
}

export type StatusTone = "success" | "error" | "warning" | "info";

/** Status icon; always paired with a word in the UI (charter rule). */
export function StatusIcon({ tone, className = "ap-alert__icon" }: { tone: StatusTone; className?: string }) {
  switch (tone) {
    case "success":
      return <Stroke viewBox="0 0 24 24" className={className}><circle cx={12} cy={12} r={10} /><path d="M7.5 12.5l3 3 6-6.5" /></Stroke>;
    case "error":
      return <Stroke viewBox="0 0 24 24" className={className}><circle cx={12} cy={12} r={10} /><path d="M12 7v6" /><path d="M12 16.5v.5" /></Stroke>;
    case "warning":
      return <Stroke viewBox="0 0 24 24" className={className}><path d="M12 3l10 18H2L12 3z" /><path d="M12 10v5" /><path d="M12 18v.5" /></Stroke>;
    case "info":
      return <Stroke viewBox="0 0 24 24" className={className}><circle cx={12} cy={12} r={10} /><path d="M12 11v6" /><path d="M12 7.5v.5" /></Stroke>;
  }
}

/** Proposed (extension): menu icon for the AppShell burger, same stroke as the system's UI icons. */
export function MenuIcon({ className }: IconProps) {
  return <Stroke viewBox="0 0 24 24" className={className}><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></Stroke>;
}
