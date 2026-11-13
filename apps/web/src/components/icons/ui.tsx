import type { ReactNode, SVGProps } from "react";

/* Icônes d'interface de bundle.js (`icons`). Flèche et étoile reprennent les tracés du fichier source ;
   les autres sont proposées (trait 2,5 px, extrémités arrondies). Toutes suivent currentColor. */

type IconProps = Omit<SVGProps<SVGSVGElement>, "children">;

const ARROW = "M0 15.321L20.769 15.321L11.236 24.854L13.619 27.238L27.238 13.619L13.619 0L11.236 2.383L20.769 11.917L0 11.917L0 15.321Z";
const STAR = "M0.617 0.84L0.744 0.58L1.023 0.539C1.047 0.535 1.066 0.52 1.074 0.496C1.082 0.475 1.076 0.449 1.059 0.434L0.855 0.232L0.904 -0.053C0.908 -0.076 0.898 -0.1 0.879 -0.113C0.859 -0.129 0.834 -0.129 0.813 -0.119L0.563 0.016L0.311 -0.119C0.291 -0.129 0.266 -0.129 0.246 -0.113C0.227 -0.1 0.217 -0.076 0.221 -0.053L0.268 0.232L0.064 0.434C0.049 0.449 0.043 0.475 0.049 0.496C0.057 0.52 0.076 0.535 0.1 0.539L0.381 0.58L0.506 0.84C0.516 0.861 0.537 0.875 0.563 0.875C0.586 0.875 0.607 0.861 0.617 0.84Z";

/** Gabarit des icônes au trait (fonction `svg()` du bundle). */
function Stroke({ viewBox, children, strokeWidth = 2.5, ...rest }: IconProps & { viewBox: string; children: ReactNode }) {
  return (
    <svg
      viewBox={viewBox}
      aria-hidden
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 27.24 27.24" aria-hidden focusable="false" {...props}>
      <path d={ARROW} fill="currentColor" />
    </svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 27.24 27.24" aria-hidden focusable="false" {...props}>
      <path d={ARROW} fill="currentColor" transform="translate(27.24 0) scale(-1 1)" />
    </svg>
  );
}

/** Étoile Font Awesome 6 (tracé exporté). `off` : étoile éteinte (classe is-off). */
export function StarIcon({ off, ...props }: IconProps & { off?: boolean }) {
  return (
    <svg className={off ? "is-off" : undefined} viewBox="0 0 11.25 10" aria-hidden focusable="false" {...props}>
      <path d={STAR} fill="currentColor" transform="translate(0 8.75) scale(10 -10)" />
    </svg>
  );
}

export function ChevronIcon(props: IconProps) {
  return (
    <Stroke viewBox="0 0 20 20" {...props}>
      <path d="M5 7.5l5 5 5-5" />
    </Stroke>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Stroke viewBox="0 0 24 24" {...props}>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </Stroke>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Stroke viewBox="0 0 16 16" strokeWidth={2.6} {...props}>
      <path d="M3 8.5l3.2 3.2L13 5" />
    </Stroke>
  );
}

export function SuccessIcon(props: IconProps) {
  return (
    <Stroke viewBox="0 0 24 24" className="ap-alert__icon" {...props}>
      <circle cx={12} cy={12} r={10} />
      <path d="M7.5 12.5l3 3 6-6.5" />
    </Stroke>
  );
}

export function ErrorIcon(props: IconProps) {
  return (
    <Stroke viewBox="0 0 24 24" className="ap-alert__icon" {...props}>
      <circle cx={12} cy={12} r={10} />
      <path d="M12 7v6" />
      <path d="M12 16.5v.5" />
    </Stroke>
  );
}

export function WarningIcon(props: IconProps) {
  return (
    <Stroke viewBox="0 0 24 24" className="ap-alert__icon" {...props}>
      <path d="M12 3l10 18H2L12 3z" />
      <path d="M12 10v5" />
      <path d="M12 18v.5" />
    </Stroke>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <Stroke viewBox="0 0 24 24" className="ap-alert__icon" {...props}>
      <circle cx={12} cy={12} r={10} />
      <path d="M12 11v6" />
      <path d="M12 7.5v.5" />
    </Stroke>
  );
}

export type Tone = "success" | "warning" | "error" | "info";
export const TONE_ICONS: Record<Tone, (p: IconProps) => ReactNode> = {
  success: SuccessIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon,
};
