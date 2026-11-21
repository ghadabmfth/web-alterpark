/*
 * Stay dates — pure domain logic shared by the booking form (client) and the reservation engine
 * (server, Phase 5). The customer enters wall-clock dates and times in the PARKING's time zone;
 * the engine works with UTC instants. No dependency, deterministic (`now` is injected).
 */

export interface WallClock {
  /** YYYY-MM-DD */
  date: string;
  /** HH:MM (24 h) */
  time: string;
}

export interface StayRules {
  now: number;
  timeZone: string;
  /** Minimum delay between booking and drop-off (Parking.minLeadMinutes). */
  minLeadMinutes: number;
  /** Maximum stay length in days (Parking.maxStayDays). */
  maxStayDays: number;
  /** How far ahead drop-off can be (Parking.bookingHorizonDays). */
  horizonDays: number;
}

export type StayField = "departureDate" | "departureTime" | "returnDate" | "returnTime";
export type StayErrors = Partial<Record<StayField, string>>;

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DAY_MS = 86_400_000;

/** Offset (ms) of `timeZone` at instant `utcMs`: local wall clock − UTC. */
function offsetAt(utcMs: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(utcMs));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asUtc - Math.floor(utcMs / 1000) * 1000;
}

/** Wall clock in `timeZone` of a UTC instant. */
export function utcToZoned(utcMs: number, timeZone: string): WallClock {
  const iso = new Date(utcMs + offsetAt(utcMs, timeZone)).toISOString();
  return { date: iso.slice(0, 10), time: iso.slice(11, 16) };
}

/**
 * UTC instant of a wall-clock date and time in `timeZone`; null when the format is wrong, the date
 * does not exist (31 February) or the time falls in a daylight-saving gap (e.g. 02:30 on the last
 * Sunday of March in Europe/Paris).
 */
export function zonedToUtc({ date, time }: WallClock, timeZone: string): number | null {
  const d = DATE_RE.exec(date);
  const t = TIME_RE.exec(time);
  if (!d || !t) return null;
  const [y, mo, da] = [Number(d[1]), Number(d[2]), Number(d[3])];
  const naive = Date.UTC(y, mo - 1, da, Number(t[1]), Number(t[2]));
  const check = new Date(naive);
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== mo - 1 || check.getUTCDate() !== da) return null;
  // Two passes: the offset may change between the estimate and the result (DST transition).
  let utc = naive - offsetAt(naive, timeZone);
  utc = naive - offsetAt(utc, timeZone);
  const back = utcToZoned(utc, timeZone);
  return back.date === date && back.time === time ? utc : null;
}

/** Billed days: every started 24-hour period counts, at least 1 (approved rule Q7). */
export function billedDays(startUtc: number, endUtc: number): number {
  return Math.max(1, Math.ceil((endUtc - startUtc) / DAY_MS));
}

/** "2 h", "45 min", "1 h 30" */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} min`;
  return m ? `${h} h ${String(m).padStart(2, "0")}` : `${h} h`;
}

/** "12/08/2026" */
export function formatShortDate(date: string): string {
  const [y, m, d] = date.split("-");
  return `${d}/${m}/${y}`;
}

/** "mar. 12 août 2026 à 06:30" in the parking's time zone. */
export function formatDateTime(utcMs: number, timeZone: string): string {
  const date = new Intl.DateTimeFormat("fr-FR", { timeZone, weekday: "short", day: "numeric", month: "long", year: "numeric" }).format(utcMs);
  const time = new Intl.DateTimeFormat("fr-FR", { timeZone, hour: "2-digit", minute: "2-digit" }).format(utcMs);
  return `${date} à ${time}`;
}

export interface ValidStay {
  startUtc: number;
  endUtc: number;
  days: number;
}

/**
 * Validates departure (drop-off) and return (pick-up). Messages are attached to the field to fix.
 * Returns the UTC interval when valid.
 */
export function validateStay(departure: WallClock, ret: WallClock, rules: StayRules): { errors: StayErrors; stay: ValidStay | null } {
  const errors: StayErrors = {};
  const tz = rules.timeZone;
  const fields = (v: WallClock, dateKey: StayField, timeKey: StayField, word: string) => {
    if (!v.date) errors[dateKey] = `Indiquez la date de ${word}.`;
    else if (!DATE_RE.test(v.date)) errors[dateKey] = "Date invalide. Utilisez le format JJ/MM/AAAA.";
    if (!v.time) errors[timeKey] = `Indiquez l’heure de ${word}.`;
    else if (!TIME_RE.test(v.time)) errors[timeKey] = "Heure invalide. Utilisez le format HH:MM.";
  };
  fields(departure, "departureDate", "departureTime", "départ");
  fields(ret, "returnDate", "returnTime", "retour");

  const gap = "Cette heure n’existe pas ce jour-là (changement d’heure). Choisissez une autre heure.";
  const start = errors.departureDate || errors.departureTime ? null : zonedToUtc(departure, tz);
  const end = errors.returnDate || errors.returnTime ? null : zonedToUtc(ret, tz);
  if (!errors.departureDate && !errors.departureTime && start === null) errors.departureTime = gap;
  if (!errors.returnDate && !errors.returnTime && end === null) errors.returnTime = gap;

  if (start !== null) {
    const earliest = rules.now + rules.minLeadMinutes * 60_000;
    if (start < rules.now) {
      errors.departureDate = "La date de départ est passée.";
    } else if (start < earliest) {
      const e = utcToZoned(earliest, tz);
      errors.departureTime = `Réservez au moins ${formatDuration(rules.minLeadMinutes)} avant votre arrivée au parking : départ possible à partir du ${formatShortDate(e.date)} à ${e.time}.`;
    } else if (start > rules.now + rules.horizonDays * DAY_MS) {
      errors.departureDate = `Les réservations sont ouvertes jusqu’à ${rules.horizonDays} jours à l’avance.`;
    }
  }
  if (start !== null && end !== null) {
    if (end <= start) errors.returnDate = "Le retour doit être après le départ.";
    else if (billedDays(start, end) > rules.maxStayDays) errors.returnDate = `La durée maximale d’un séjour est de ${rules.maxStayDays} jours.`;
  }

  const valid = Object.keys(errors).length === 0 && start !== null && end !== null;
  return { errors, stay: valid ? { startUtc: start, endUtc: end, days: billedDays(start, end) } : null };
}
