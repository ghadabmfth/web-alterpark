import { describe, expect, it } from "vitest";
import { billedDays, formatLead, utcToZoned, validateStay, zonedToUtc } from "./datetime";

const TZ = "Europe/Paris";
// 13/11/2026 10:00 à Paris (UTC+1 en hiver)
const NOW = Date.UTC(2026, 10, 13, 9, 0);
const rules = { now: NOW, minLeadMinutes: 120, timeZone: TZ };

describe("zonedToUtc / utcToZoned", () => {
  it("convertit l'heure de Paris en UTC, été comme hiver", () => {
    expect(zonedToUtc({ date: "2026-11-13", time: "10:00" }, TZ)).toBe(Date.UTC(2026, 10, 13, 9, 0));
    expect(zonedToUtc({ date: "2026-07-01", time: "10:00" }, TZ)).toBe(Date.UTC(2026, 6, 1, 8, 0));
  });

  it("fait l'aller-retour", () => {
    const utc = zonedToUtc({ date: "2026-08-12", time: "06:30" }, TZ)!;
    expect(utcToZoned(utc, TZ)).toEqual({ date: "2026-08-12", time: "06:30" });
  });

  it("refuse une date inexistante ou mal formée", () => {
    expect(zonedToUtc({ date: "2026-02-30", time: "10:00" }, TZ)).toBeNull();
    expect(zonedToUtc({ date: "12/08/2026", time: "10:00" }, TZ)).toBeNull();
    expect(zonedToUtc({ date: "2026-08-12", time: "24:00" }, TZ)).toBeNull();
  });

  it("refuse une heure sautée au passage à l'heure d'été", () => {
    expect(zonedToUtc({ date: "2026-03-29", time: "02:30" }, TZ)).toBeNull();
    expect(zonedToUtc({ date: "2026-03-29", time: "03:30" }, TZ)).toBe(Date.UTC(2026, 2, 29, 1, 30));
  });
});

describe("validateStay", () => {
  const ok = { date: "2026-11-20", time: "08:00" };
  const back = { date: "2026-11-27", time: "18:00" };

  it("accepte un séjour valide", () => {
    expect(validateStay(ok, back, rules)).toEqual({});
  });

  it("exige dates et heures", () => {
    expect(validateStay({ date: "", time: "" }, { date: "", time: "" }, rules)).toEqual({
      departureDate: "Indiquez la date de départ.",
      departureTime: "Indiquez l’heure de départ.",
      returnDate: "Indiquez la date de retour.",
      returnTime: "Indiquez l’heure de retour.",
    });
  });

  it("refuse un retour avant ou égal au départ", () => {
    expect(validateStay(ok, ok, rules).returnDate).toBe("Le retour doit être après le départ.");
    expect(validateStay(ok, { date: "2026-11-19", time: "08:00" }, rules).returnDate).toBe("Le retour doit être après le départ.");
  });

  it("refuse un départ passé", () => {
    expect(validateStay({ date: "2026-11-12", time: "08:00" }, back, rules).departureDate).toBe("La date de départ est passée.");
  });

  it("applique le délai minimal avant départ et indique l'heure possible", () => {
    // 11:30 < 10:00 + 2 h
    const e = validateStay({ date: "2026-11-13", time: "11:30" }, back, rules);
    expect(e.departureTime).toBe("Réservez au moins 2 h avant votre départ : départ possible à partir du 13/11/2026 à 12:00.");
    expect(validateStay({ date: "2026-11-13", time: "12:00" }, back, rules)).toEqual({});
  });

  it("signale l'heure inexistante du changement d'heure", () => {
    const e = validateStay({ date: "2027-03-28", time: "02:15" }, { date: "2027-04-02", time: "10:00" }, rules);
    expect(e.departureTime).toMatch(/changement d’heure/);
  });
});

describe("billedDays / formatLead", () => {
  it("arrondit au jour supérieur, 1 jour minimum", () => {
    const a = Date.UTC(2026, 7, 12, 4, 30);
    expect(billedDays(a, a + 3_600_000)).toBe(1);
    expect(billedDays(a, a + 8 * 86_400_000)).toBe(8);
    expect(billedDays(a, a + 8 * 86_400_000 + 60_000)).toBe(9);
  });

  it("formate le délai", () => {
    expect(formatLead(120)).toBe("2 h");
    expect(formatLead(45)).toBe("45 min");
    expect(formatLead(90)).toBe("1 h 30");
  });
});
