/* Proposé : composant absent du design system, construit à partir des tokens. */
import type { CSSProperties } from "react";
import { cx } from "../../lib/cx";
import { CheckIcon } from "../../icons/ui";
import { BOOKING_STEPS, stepProgress, stepStatus, type BookingStep } from "@/lib/booking/steps";

export interface BookingStepperProps {
  /** Étapes du tunnel (défaut : BOOKING_STEPS). */
  steps?: readonly BookingStep[];
  /** Index de l'étape en cours (0 = première). */
  current: number;
  className?: string;
}

const STATUS_WORD = { complete: "terminée", current: "en cours", upcoming: "à venir" } as const;

/**
 * Progression dans le tunnel. Mobile : « Étape 3 sur 6 », libellé de l'étape en cours et pastilles.
 * À partir de 768 px de large (conteneur) : tous les libellés. Les étapes terminées avec `href`
 * deviennent des liens de retour. L'état est donné par l'icône, le style et un texte lu.
 */
export function BookingStepper({ steps = BOOKING_STEPS, current, className }: BookingStepperProps) {
  const total = steps.length;
  const cur = Math.min(Math.max(current, 0), total - 1);
  return (
    <nav className={cx("ap-root ap-stepper", className)} aria-label="Étapes de la réservation">
      <p className="ap-stepper__compact">
        <span className="ap-stepper__count">{`Étape ${cur + 1} sur ${total}`}</span>
        <b className="ap-stepper__now">{steps[cur]?.label}</b>
      </p>
      <div className="ap-stepper__bar" aria-hidden style={{ "--progress": stepProgress(cur, total) } as CSSProperties}>
        <span />
      </div>
      <ol className="ap-stepper__list">
        {steps.map((s, i) => {
          const st = stepStatus(i, cur);
          const inner = (
            <>
              <span className="ap-stepper__dot" aria-hidden>
                {st === "complete" ? <CheckIcon /> : i + 1}
              </span>
              <span className="ap-stepper__label">{s.label}</span>
              <span className="ap-sr">{` (étape ${i + 1}, ${STATUS_WORD[st]})`}</span>
            </>
          );
          return (
            <li key={s.id} className={cx("ap-stepper__item", `is-${st}`)} aria-current={st === "current" ? "step" : undefined}>
              {st === "complete" && s.href ? (
                <a className="ap-stepper__link" href={s.href}>
                  {inner}
                </a>
              ) : (
                <span className="ap-stepper__link">{inner}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
