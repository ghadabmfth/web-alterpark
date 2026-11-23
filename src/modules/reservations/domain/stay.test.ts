import { describe, expect, it } from "vitest";
import { billedDays, formatDuration, utcToZoned, validateStay, zonedToUtc } from "./stay";

const TZ = "Europe/Paris";
const rules = (now: number) => ({ now, timeZone: TZ, minLeadMinutes: 120, maxStayDays: 60, horizonDays: 365 });
const NOW = Date.UTC(2026, 7, 1, 8, 0); // 1 Aug 2026 10:00 in Paris (UTC+2)

describe("zonedToUtc / utcToZoned", () => {
  it("converts summer and winter wall clocks in Paris", () => {
    expect(zonedToUtc({ date: "2026-08-12", time: "06:30" }, TZ)).toBe(Date.UTC(2026, 7, 12, 4, 30));
    expect(zonedToUtc({ date: "2026-12-12", time: "06:30" }, TZ)).toBe(Date.UTC(2026, 11, 12, 5, 30));
    expect(utcToZoned(Date.UTC(2026, 7, 12, 4, 30), TZ)).toEqual({ date: "2026-08-12", time: "06:30" });
  });
  it("rejects impossible dates and the spring-forward gap", () => {
    expect(zonedToUtc({ date: "2026-02-31", time: "10:00" }, TZ)).toBeNull();
    expect(zonedToUtc({ date: "2026-03-29", time: "02:30" }, TZ)).toBeNull();
    expect(zonedToUtc({ date: "2026-03-29", time: "03:30" }, TZ)).not.toBeNull();
    expect(zonedToUtc({ date: "2026-8-1", time: "10:00" }, TZ)).toBeNull();
  });
});

describe("billedDays", () => {
  it("counts every started 24 h period, at least one", () => {
    const h = 3_600_000;
    expect(billedDays(0, 1 * h)).toBe(1);
    expect(billedDays(0, 24 * h)).toBe(1);
    expect(billedDays(0, 24 * h + 1)).toBe(2);
    expect(billedDays(Date.UTC(2026, 7, 12, 4, 30), Date.UTC(2026, 7, 20, 20, 10))).toBe(9);
  });
  it("formats durations", () => {
    expect(formatDuration(120)).toBe("2 h");
    expect(formatDuration(45)).toBe("45 min");
    expect(formatDuration(90)).toBe("1 h 30");
  });
});

describe("validateStay", () => {
  const ok = { date: "2026-08-12", time: "06:30" };
  const back = { date: "2026-08-20", time: "22:10" };

  it("accepts a valid stay and returns the UTC interval", () => {
    const r = validateStay(ok, back, rules(NOW));
    expect(r.errors).toEqual({});
    expect(r.stay).toEqual({ startUtc: Date.UTC(2026, 7, 12, 4, 30), endUtc: Date.UTC(2026, 7, 20, 20, 10), days: 9 });
  });
  it("requires every field", () => {
    const r = validateStay({ date: "", time: "" }, { date: "", time: "" }, rules(NOW));
    expect(Object.keys(r.errors).sort()).toEqual(["departureDate", "departureTime", "returnDate", "returnTime"]);
    expect(r.stay).toBeNull();
  });
  it("enforces the lead time and explains the earliest slot", () => {
    const r = validateStay({ date: "2026-08-01", time: "11:00" }, back, rules(NOW));
    expect(r.errors.departureTime).toMatch(/au moins 2 h .* 01\/08\/2026 à 12:00/);
  });
  it("rejects past departures, return before departure, too long and too far", () => {
    expect(validateStay({ date: "2026-07-30", time: "10:00" }, back, rules(NOW)).errors.departureDate).toMatch(/passée/);
    expect(validateStay(back, ok, rules(NOW)).errors.returnDate).toMatch(/après le départ/);
    expect(validateStay(ok, { date: "2026-12-12", time: "06:30" }, rules(NOW)).errors.returnDate).toMatch(/60 jours/);
    expect(validateStay({ date: "2027-09-01", time: "10:00" }, { date: "2027-09-05", time: "10:00" }, rules(NOW)).errors.departureDate).toMatch(/365 jours/);
  });
  it("reports daylight-saving gaps on the right field", () => {
    const r = validateStay({ date: "2027-03-28", time: "02:30" }, { date: "2027-04-02", time: "10:00" }, rules(Date.UTC(2027, 2, 1)));
    expect(r.errors.departureTime).toMatch(/changement d’heure/);
  });
});
