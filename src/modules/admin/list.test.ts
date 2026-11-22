import { describe, expect, it } from "vitest";
import { dayRange, hrefWith, pageOf, toCsv, totalPages } from "./list";

describe("admin list helpers", () => {
  it("pages are bounded", () => {
    expect(pageOf({})).toEqual({ page: 1, skip: 0, take: 25 });
    expect(pageOf({ page: "3" })).toEqual({ page: 3, skip: 50, take: 25 });
    expect(pageOf({ page: "-4" }).page).toBe(1);
    expect(pageOf({ page: "abc" }).page).toBe(1);
    expect(totalPages(0)).toBe(1);
    expect(totalPages(26)).toBe(2);
  });

  it("builds URLs keeping filters", () => {
    expect(hrefWith("/admin/reservations", { statut: "CONFIRMED", page: "2" }, { page: 3 })).toBe("/admin/reservations?statut=CONFIRMED&page=3");
    expect(hrefWith("/x", { q: "a" }, { q: "" })).toBe("/x");
  });

  it("day ranges follow Paris midnight, including DST days", () => {
    const r = dayRange("2026-03-29", "2026-03-29"); // spring forward: 23 h day
    expect(r.gte?.toISOString()).toBe("2026-03-28T23:00:00.000Z");
    expect(r.lt?.toISOString()).toBe("2026-03-29T22:00:00.000Z");
    expect(dayRange("", "nope")).toEqual({});
  });

  it("CSV escapes separators, quotes and formulas", () => {
    const csv = toCsv(["a", "b"], [["x;y", 'say "hi"'], ["=HYPERLINK()", -12], [null, "+33 6"]]);
    expect(csv.startsWith("﻿a;b\r\n")).toBe(true);
    expect(csv).toContain('"x;y";"say ""hi"""');
    expect(csv).toContain("'=HYPERLINK();-12");
    expect(csv).toContain(";'+33 6");
  });
});
