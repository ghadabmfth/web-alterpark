import { cx } from "../lib/cx";
import { CheckIcon } from "../icons/icons";

/*
 * Stepper — EXTENSION (proposé). Progress of a multi-step flow. Text summary « Étape 2 sur 4 : … »
 * always available to assistive technologies; labels visible from 768 px.
 */
export function Stepper({ steps, current, label = "Progression", className }: { steps: string[]; current: number; label?: string; className?: string }) {
  return (
    <nav className={cx("ap-root ap-stepper", className)} aria-label={label}>
      <p className="ap-stepper__summary">{`Étape ${current + 1} sur ${steps.length} : ${steps[current] ?? ""}`}</p>
      <ol>
        {steps.map((s, i) => (
          <li key={s} className={cx(i < current && "is-done")} aria-current={i === current ? "step" : undefined}>
            <span className="ap-stepper__label">
              {i < current ? <CheckIcon /> : null}
              {`${i + 1}. ${s}`}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
