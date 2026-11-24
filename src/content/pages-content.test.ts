import { describe, expect, it } from "vitest";
import { distanceMetres, formatDistance } from "./pages-content";
import { ACCESS_SITES, accessSite } from "./access-sites";

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
  it("every step of every site has a readable distance", () => {
    for (const site of ACCESS_SITES) for (const r of site.routes) if (r.mode !== "walk") for (const s of r.steps) expect(distanceMetres(s.distance), `${site.slug} ${s.title}`).toBeGreaterThan(0);
  });
});

describe("access sites", () => {
  it("covers the three parkings, each with a map and itineraries", () => {
    expect(ACCESS_SITES.map((s) => s.slug)).toEqual(["nantes", "marseille", "paris-roissy"]);
    for (const s of ACCESS_SITES) {
      expect(s.map.title.length, s.slug).toBeGreaterThan(40);
      expect(s.routes.length, s.slug).toBeGreaterThan(0);
      // Driving routes need a distance on every step; walking routes need none.
      for (const r of s.routes) if (r.mode !== "walk") expect(r.origin, r.id).toBeTruthy();
    }
    expect(accessSite("lyon")).toBeUndefined();
  });
});
