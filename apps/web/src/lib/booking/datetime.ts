/*
 * Dates du parcours de réservation. Le client saisit une date et une heure « murales » dans le
 * fuseau du parking (Europe/Paris par défaut, colonne `timezone` des parkings) ; l'API travaille
 * en UTC. Fonctions pures, sans dépendance, partagées entre client et serveur.
 */

export const DEFAULT_TIME_ZONE = "Europe/Paris";

export interface WallClock {
  /** AAAA-MM-JJ */
  date: string;
  /** HH:MM */
  time: string;
}

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Décalage du fuseau (ms) à l'instant `utcMs` : heure locale − UTC. */
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

/**
 * Instant UTC (ms) d'une date et heure murales dans `timeZone`.
 * null si le format est invalide, si la date n'existe pas (31 février) ou si l'heure tombe
 * dans le saut du passage à l'heure d'été (ex. 02:30 le dernier dimanche de mars).
 */
export function zonedToUtc({ date, time }: WallClock, timeZone: string = DEFAULT_TIME_ZONE): number | null {
  const d = DATE_RE.exec(date);
  const t = TIME_RE.exec(time);
  if (!d || !t) return null;
  const [y, mo, da] = [Number(d[1]), Number(d[2]), Number(d[3])];
  const [h, mi] = [Number(t[1]), Number(t[2])];
  const naive = Date.UTC(y, mo - 1, da, h, mi);
  const check = new Date(naive);
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== mo - 1 || check.getUTCDate() !== da) return null;
  // Deux passes : le décalage peut changer entre l'estimation et le résultat (changement d'heure).
  let utc = naive - offsetAt(naive, timeZone);
  utc = naive - offsetAt(utc, timeZone);
  const back = utcToZoned(utc, timeZone);
  if (back.date !== date || back.time !== time) return null;
  return utc;
}

/** Date et heure murales dans `timeZone` d'un instant UTC (ms). */
export function utcToZoned(utcMs: number, timeZone: string = DEFAULT_TIME_ZONE): WallClock {
  const local = utcMs + offsetAt(utcMs, timeZone);
  const iso = new Date(local).toISOString();
  return { date: iso.slice(0, 10), time: iso.slice(11, 16) };
}

/** Jours facturés : durée arrondie au jour supérieur, 1 au minimum (même règle que BookingBar). */
export function billedDays(startUtc: number, endUtc: number): number {
  return Math.max(1, Math.ceil((endUtc - startUtc) / 86_400_000));
}

/** « 2 h », « 45 min », « 1 h 30 » */
export function formatLead(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} min`;
  return m ? `${h} h ${String(m).padStart(2, "0")}` : `${h} h`;
}

export type StayField = "departureDate" | "departureTime" | "returnDate" | "returnTime";
export type StayErrors = Partial<Record<StayField, string>>;

export interface StayRules {
  /** Instant présent (ms), injecté pour les tests. */
  now: number;
  /** Délai minimal avant le départ, en minutes (`min_lead_minutes` du parking, 120 par défaut). */
  minLeadMinutes: number;
  timeZone?: string;
}

/**
 * Valide départ et retour. Les messages sont posés sur le champ à corriger :
 * date manquante ou invalide, heure manquante, départ trop proche, retour avant le départ.
 */
export function validateStay(departure: WallClock, ret: WallClock, rules: StayRules): StayErrors {
  const tz = rules.timeZone ?? DEFAULT_TIME_ZONE;
  const errors: StayErrors = {};
  const check = (v: WallClock, dateKey: StayField, timeKey: StayField, word: string) => {
    if (!v.date) errors[dateKey] = `Indiquez la date de ${word}.`;
    else if (!DATE_RE.test(v.date)) errors[dateKey] = "Date invalide. Utilisez le format JJ/MM/AAAA.";
    if (!v.time) errors[timeKey] = `Indiquez l’heure de ${word}.`;
    else if (!TIME_RE.test(v.time)) errors[timeKey] = "Heure invalide. Utilisez le format HH:MM.";
  };
  check(departure, "departureDate", "departureTime", "départ");
  check(ret, "returnDate", "returnTime", "retour");

  const start = errors.departureDate || errors.departureTime ? null : zonedToUtc(departure, tz);
  const end = errors.returnDate || errors.returnTime ? null : zonedToUtc(ret, tz);
  if (!errors.departureDate && !errors.departureTime && start === null) {
    errors.departureTime = "Cette heure n’existe pas ce jour-là (changement d’heure). Choisissez une autre heure.";
  }
  if (!errors.returnDate && !errors.returnTime && end === null) {
    errors.returnTime = "Cette heure n’existe pas ce jour-là (changement d’heure). Choisissez une autre heure.";
  }

  if (start !== null) {
    const earliest = rules.now + rules.minLeadMinutes * 60_000;
    if (start < rules.now) {
      errors.departureDate = "La date de départ est passée.";
    } else if (start < earliest) {
      const e = utcToZoned(earliest, tz);
      errors.departureTime = `Réservez au moins ${formatLead(rules.minLeadMinutes)} avant votre départ : départ possible à partir du ${formatShortDate(e.date)} à ${e.time}.`;
    }
  }
  if (start !== null && end !== null && end <= start) {
    errors.returnDate = "Le retour doit être après le départ.";
  }
  return errors;
}

/** « 12/08/2026 » */
export function formatShortDate(date: string): string {
  const [y, m, d] = date.split("-");
  return `${d}/${m}/${y}`;
}

/** « mar. 12 août 2026 à 06:30 », dans le fuseau du parking. */
export function formatDateTime(utcMs: number, timeZone: string = DEFAULT_TIME_ZONE): string {
  const date = new Intl.DateTimeFormat("fr-FR", { timeZone, weekday: "short", day: "numeric", month: "long", year: "numeric" }).format(utcMs);
  const time = new Intl.DateTimeFormat("fr-FR", { timeZone, hour: "2-digit", minute: "2-digit" }).format(utcMs);
  return `${date} à ${time}`;
}

/** « 14:32 », dans le fuseau du parking. */
export function formatTime(utcMs: number, timeZone: string = DEFAULT_TIME_ZONE): string {
  return new Intl.DateTimeFormat("fr-FR", { timeZone, hour: "2-digit", minute: "2-digit" }).format(utcMs);
}
