import { cx } from "../../lib/cx";
import { StarIcon } from "../../icons/ui";

export interface StarsProps {
  value?: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
}

/** Étoiles de notation jaunes accent. */
export function Stars({ value, max = 5, size, className }: StarsProps) {
  const n = value == null ? 5 : value;
  return (
    <span className={cx("ap-stars", size === "md" && "ap-stars--md", className)} role="img" aria-label={`Note : ${n} sur ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <StarIcon key={i} off={i >= Math.round(n)} />
      ))}
    </span>
  );
}
