/*
 * Pure logic of the BookingBar (ported from the bundle's bk* helpers). Display-side only: the
 * reservation engine (Phase 5) re-validates dates and computes prices on the server.
 */

export interface BookingDates {
  /** YYYY-MM-DD */
  date: string;
  /** HH:MM, optional in the bar */
  time: string;
}

/** Started 24-hour periods between departure and return, at least 1 (bundle `bkDays`). */
export function bookingDays(dep: BookingDates, ret: BookingDates): number {
  const ms = new Date(`${ret.date}T${ret.time || "12:00"}`).getTime() - new Date(`${dep.date}T${dep.time || "12:00"}`).getTime();
  return Math.max(1, Math.ceil(ms / 86_400_000));
}

/** Error message of the search, or null when it can be submitted (bundle `submit`). */
export function searchError(dep: BookingDates, ret: BookingDates): string | null {
  if (!dep.date || !ret.date) return "Indiquez vos dates de départ et de retour.";
  const a = new Date(`${dep.date}T${dep.time || "00:00"}`);
  const b = new Date(`${ret.date}T${ret.time || "23:59"}`);
  if (b <= a) return "La date de retour doit être après la date de départ.";
  return null;
}

/** "2026-08-12" → "mer. 12 août" (bundle `bkFmt`). */
export function formatShortDay(date: string): string {
  return date ? new Date(`${date}T12:00`).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" }) : "";
}

/** Today in the visitor's local time zone, YYYY-MM-DD (bundle `bkToday`). */
export function localToday(now = new Date()): string {
  const d = new Date(now);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}
