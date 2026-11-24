import { describe, expect, it } from "vitest";
import { ACCESS_ROUTES, distanceMetres, formatDistance } from "./pages-content";

describe("itinerary distances", () => {
  it("parses km and m with a French decimal comma", () => {
    expect(distanceMetres("1,4 km")).toBe(1400);
    expect(distanceMetres("450 m")).toBe(450);
    expect(distanceMetres("2 km")).toBe(2000);
    expect(distanceMetres("")).toBe(0);
  });
  it("formats totals", () => {
    expect(formatDistance(4060)).toBe("4,1 km");
    expect(formatDistance(450)).toBe("450 m");
  });
  it("every step of every route has a readable distance", () => {
    for (const r of ACCESS_ROUTES) for (const s of r.steps) expect(distanceMetres(s.distance)).toBeGreaterThan(0);
  });
});
