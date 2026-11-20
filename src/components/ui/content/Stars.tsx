import { cx } from "../lib/cx";
import { StarIcon } from "../icons/icons";

/** Stars — design system "Content". Rating stars in `accent` yellow (the only use of that colour). */
export interface StarsProps {
  value?: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
}

export function Stars({ value = 5, max = 5, size, className }: StarsProps) {
  return (
    <span className={cx("ap-stars", size === "md" && "ap-stars--md", className)} role="img" aria-label={`Note : ${value} sur ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <StarIcon key={i} off={i >= Math.round(value)} />
      ))}
    </span>
  );
}
