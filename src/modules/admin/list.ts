import { zonedToUtc } from "@/modules/reservations/domain/stay";

/* Helpers of the back-office list pages: filters and pages live in the URL. */

export type SearchParams = Record<string, string | string[] | undefined>;

export const PAGE_SIZE = 25;

export function param(sp: SearchParams, key: string): string {
  const v = sp[key];
  return (Array.isArray(v) ? v[0] : v)?.trim() ?? "";
}

export function pageOf(sp: SearchParams): { page: number; skip: number; take: number } {
  const page = Math.max(1, Math.min(10_000, Number.parseInt(param(sp, "page"), 10) || 1));
  return { page, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE };
}

export function totalPages(count: number): number {
  return Math.max(1, Math.ceil(count / PAGE_SIZE));
}

/** Same URL with some parameters replaced (empty values removed). */
export function hrefWith(path: string, sp: SearchParams, changes: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    const s = Array.isArray(v) ? v[0] : v;
    if (s) q.set(k, s);
  }
  for (const [k, v] of Object.entries(changes)) {
    if (v === undefined || v === "") q.delete(k);
    else q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `${path}?${s}` : path;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** [from 00:00, to+1 00:00) in the site time zone, from YYYY-MM-DD filters; missing bounds stay open. */
export function dayRange(from: string, to: string, timeZone = "Europe/Paris"): { gte?: Date; lt?: Date } {
  const range: { gte?: Date; lt?: Date } = {};
  if (DATE_RE.test(from)) {
    const t = zonedToUtc({ date: from, time: "00:00" }, timeZone);
    if (t !== null) range.gte = new Date(t);
  }
  if (DATE_RE.test(to)) {
    // Local midnight of the next calendar day (23 or 25 hours later on DST changes).
    const next = new Date(`${to}T00:00:00Z`);
    next.setUTCDate(next.getUTCDate() + 1);
    const t = zonedToUtc({ date: next.toISOString().slice(0, 10), time: "00:00" }, timeZone);
    if (t !== null) range.lt = new Date(t);
  }
  return range;
}

/** RFC 4180 CSV with a BOM (Excel opens UTF-8 correctly) and protection against formula injection. */
export function toCsv(header: string[], rows: (string | number | null | undefined)[][]): string {
  const cell = (v: string | number | null | undefined) => {
    if (typeof v === "number") return String(v);
    let s = v ?? "";
    // A text cell starting with = + - @ would be run as a formula by spreadsheets.
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return "﻿" + [header, ...rows].map((r) => r.map(cell).join(";")).join("\r\n") + "\r\n";
}
