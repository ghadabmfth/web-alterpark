import { describe, expect, it } from "vitest";
import { priceStay, rateApplies, type RateRow } from "./price";

const row = (o: Partial<RateRow>): RateRow => ({
  id: "r", validFrom: "2026-01-01", validTo: null, minDays: 1, maxDays: null, mode: "PER_DAY",
  amountCents: 1000, extraDayCents: 0, priority: 0, currency: "EUR", ...o,
});

describe("rate applicability", () => {
  it("uses the arrival date and inclusive validity bounds", () => {
    const r = row({ validFrom: "2026-07-01", validTo: "2026-08-31" });
    expect(rateApplies(r, "2026-06-30", 3)).toBe(false);
    expect(rateApplies(r, "2026-07-01", 3)).toBe(true);
    expect(rateApplies(r, "2026-08-31", 3)).toBe(true);
    expect(rateApplies(r, "2026-09-01", 3)).toBe(false);
  });

  it("respects minDays and maxDays, unless extra days are priced", () => {
    expect(rateApplies(row({ minDays: 4 }), "2026-03-01", 3)).toBe(false);
    expect(rateApplies(row({ maxDays: 7 }), "2026-03-01", 8)).toBe(false);
    expect(rateApplies(row({ maxDays: 7, extraDayCents: 500 }), "2026-03-01", 8)).toBe(true);
  });
});

describe("priceStay", () => {
  it("returns null when no rate applies (a price is never guessed)", () => {
    expect(priceStay([], "2026-03-01", 3)).toBeNull();
    expect(priceStay([row({ validFrom: "2027-01-01" })], "2026-03-01", 3)).toBeNull();
    expect(priceStay([row({})], "2026-03-01", 0)).toBeNull();
  });

  it("computes PER_DAY and FLAT amounts", () => {
    expect(priceStay([row({ amountCents: 990 })], "2026-03-01", 3)?.totalCents).toBe(2970);
    expect(priceStay([row({ mode: "FLAT", amountCents: 4500, minDays: 1, maxDays: 4 })], "2026-03-01", 4)?.totalCents).toBe(4500);
  });

  it("adds extra days beyond maxDays", () => {
    const flat = priceStay([row({ mode: "FLAT", amountCents: 5000, maxDays: 7, extraDayCents: 600 })], "2026-03-01", 10);
    expect(flat?.totalCents).toBe(5000 + 3 * 600);
    expect(flat?.breakdown).toMatchObject({ baseDays: 7, extraDays: 3, extraCents: 1800 });
    const perDay = priceStay([row({ amountCents: 1000, maxDays: 7, extraDayCents: 600 })], "2026-03-01", 9);
    expect(perDay?.totalCents).toBe(7000 + 1200);
  });

  it("chooses the highest priority, then a covering range, then the most specific", () => {
    const base = row({ id: "base", amountCents: 1000 });
    const summer = row({ id: "summer", amountCents: 1500, priority: 10, validFrom: "2026-07-01", validTo: "2026-08-31" });
    expect(priceStay([base, summer], "2026-07-14", 2)?.rateId).toBe("summer");
    expect(priceStay([base, summer], "2026-06-14", 2)?.rateId).toBe("base");

    const short = row({ id: "short", mode: "FLAT", amountCents: 3000, maxDays: 3, extraDayCents: 900 });
    const long = row({ id: "long", amountCents: 800, minDays: 4 });
    expect(priceStay([short, long], "2026-03-01", 3)?.rateId).toBe("short");
    expect(priceStay([short, long], "2026-03-01", 5)?.rateId).toBe("long"); // more specific (minDays 4)
    const extend = row({ id: "extend", mode: "FLAT", amountCents: 3000, maxDays: 3, extraDayCents: 900 });
    const cover = row({ id: "cover", amountCents: 2000 });
    expect(priceStay([extend, cover], "2026-03-01", 5)?.rateId).toBe("cover"); // covering range beats extension
  });

  it("is deterministic whatever the input order", () => {
    const a = row({ id: "a" });
    const b = row({ id: "b" });
    expect(priceStay([a, b], "2026-03-01", 2)?.rateId).toBe(priceStay([b, a], "2026-03-01", 2)?.rateId);
  });
});
