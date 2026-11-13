"use client";

/* Proposé : DateTimeField, DateTimeRange et useStayValidation, construits sur TextField. */
import { useCallback, useId, useState, useSyncExternalStore } from "react";
import { cx } from "../../lib/cx";
import { TextField } from "../../forms/TextField/TextField";
import {
  DEFAULT_TIME_ZONE,
  billedDays,
  utcToZoned,
  validateStay,
  zonedToUtc,
  type StayErrors,
  type StayField,
  type WallClock,
} from "@/lib/booking/datetime";
import { formatDays } from "../../lib/format";

export interface DateTimeFieldProps {
  /** Légende du groupe, ex. « Départ ». */
  legend: string;
  value: WallClock;
  onChange: (value: WallClock) => void;
  onBlur?: (part: "date" | "time") => void;
  dateError?: string;
  timeError?: string;
  /** Date minimale proposée par le calendrier natif (AAAA-MM-JJ). */
  min?: string;
  help?: string;
  /** Préfixe des attributs name (ex. « departure » → departure_date, departure_time). */
  name?: string;
  className?: string;
}

/** Une date et une heure (fieldset) : deux champs natifs côte à côte, chaque erreur sous son champ. */
export function DateTimeField({ legend, value, onChange, onBlur, dateError, timeError, min, help, name, className }: DateTimeFieldProps) {
  const helpId = useId();
  return (
    <fieldset className={cx("ap-root ap-datetime", className)} aria-describedby={help ? helpId : undefined}>
      <legend className="ap-datetime__legend">{legend}</legend>
      {help ? (
        <p className="ap-field__help" id={helpId}>
          {help}
        </p>
      ) : null}
      <div className="ap-datetime__inputs">
        <TextField
          label="Date"
          type="date"
          name={name ? `${name}_date` : undefined}
          required
          min={min}
          value={value.date}
          error={dateError}
          onChange={(e) => onChange({ ...value, date: e.target.value })}
          onBlur={() => onBlur?.("date")}
        />
        <TextField
          label="Heure"
          type="time"
          name={name ? `${name}_time` : undefined}
          required
          step={300}
          value={value.time}
          error={timeError}
          onChange={(e) => onChange({ ...value, time: e.target.value })}
          onBlur={() => onBlur?.("time")}
        />
      </div>
    </fieldset>
  );
}

export interface StayValue {
  departure: WallClock;
  return: WallClock;
}

export const EMPTY_STAY: StayValue = { departure: { date: "", time: "" }, return: { date: "", time: "" } };

export interface StayRulesInput {
  /** `min_lead_minutes` du parking. */
  minLeadMinutes: number;
  /** `timezone` du parking (défaut Europe/Paris). */
  timeZone?: string;
}

/**
 * Validation départ/retour au fil de la saisie : une erreur ne s'affiche qu'une fois le champ
 * quitté (ou après une tentative d'envoi), puis se met à jour à chaque modification.
 */
export function useStayValidation(rules: StayRulesInput) {
  const [touched, setTouched] = useState<Partial<Record<StayField, boolean>>>({});
  const [errors, setErrors] = useState<StayErrors>({});
  const run = useCallback(
    (v: StayValue) => validateStay(v.departure, v.return, { now: Date.now(), minLeadMinutes: rules.minLeadMinutes, timeZone: rules.timeZone }),
    [rules.minLeadMinutes, rules.timeZone],
  );
  /** Champ quitté : il devient visible et la validation est relancée. */
  const touch = useCallback(
    (field: StayField, v: StayValue) => {
      setTouched((t) => ({ ...t, [field]: true }));
      setErrors(run(v));
    },
    [run],
  );
  /** Valeur modifiée : rafraîchit les erreurs déjà visibles. */
  const update = useCallback((v: StayValue) => setErrors(run(v)), [run]);
  /** Envoi : tous les champs deviennent visibles. Renvoie vrai si le séjour est valide. */
  const validateAll = useCallback(
    (v: StayValue) => {
      const e = run(v);
      setTouched({ departureDate: true, departureTime: true, returnDate: true, returnTime: true });
      setErrors(e);
      return Object.keys(e).length === 0;
    },
    [run],
  );
  const visible: StayErrors = {};
  for (const k of Object.keys(errors) as StayField[]) if (touched[k]) visible[k] = errors[k];
  return { errors: visible, touch, update, validateAll };
}

function todayIn(timeZone: string): string {
  return utcToZoned(Date.now(), timeZone).date;
}
const noop = () => () => {};

export interface DateTimeRangeProps {
  value: StayValue;
  onChange: (value: StayValue) => void;
  /** Erreurs à afficher (useStayValidation().errors). */
  errors?: StayErrors;
  /** Champ quitté (useStayValidation().touch). */
  onFieldBlur?: (field: StayField) => void;
  timeZone?: string;
  className?: string;
}

/** Départ et retour, côte à côte à partir de 768 px, avec la durée facturée une fois le séjour valide. */
export function DateTimeRange({ value, onChange, errors = {}, onFieldBlur, timeZone = DEFAULT_TIME_ZONE, className }: DateTimeRangeProps) {
  const today = useSyncExternalStore(noop, () => todayIn(timeZone), () => "");
  const start = zonedToUtc(value.departure, timeZone);
  const end = zonedToUtc(value.return, timeZone);
  const valid = start !== null && end !== null && end > start && Object.keys(errors).length === 0;
  return (
    <div className={cx("ap-root ap-stay", className)}>
      <div className="ap-stay__fields">
        <DateTimeField
          legend="Départ"
          name="departure"
          value={value.departure}
          min={today || undefined}
          dateError={errors.departureDate}
          timeError={errors.departureTime}
          onChange={(d) => onChange({ ...value, departure: d })}
          onBlur={(part) => onFieldBlur?.(part === "date" ? "departureDate" : "departureTime")}
        />
        <DateTimeField
          legend="Retour"
          name="return"
          value={value.return}
          min={value.departure.date || today || undefined}
          dateError={errors.returnDate}
          timeError={errors.returnTime}
          onChange={(r) => onChange({ ...value, return: r })}
          onBlur={(part) => onFieldBlur?.(part === "date" ? "returnDate" : "returnTime")}
        />
      </div>
      <p className="ap-stay__duration" aria-live="polite">
        {valid ? (
          <>
            Durée facturée : <b>{formatDays(billedDays(start, end))}</b>
          </>
        ) : null}
      </p>
    </div>
  );
}
