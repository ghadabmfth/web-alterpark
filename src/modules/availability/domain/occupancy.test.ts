import { describe, expect, it } from "vitest";
import { peakOccupancy, remainingCapacity } from "./occupancy";

describe("peakOccupancy", () => {
  it("is 0 without intervals or outside the window", () => {
    expect(peakOccupancy([], 0, 10)).toBe(0);
    expect(peakOccupancy([{ start: 10, end: 20 }], 0, 10)).toBe(0); // end exclusive
    expect(peakOccupancy([{ start: 0, end: 5 }], 5, 10)).toBe(0);
  });

  it("counts the peak, not the number of overlapping stays", () => {
    // Two consecutive stays share one space; a third overlaps both.
    const stays = [{ start: 0, end: 5 }, { start: 5, end: 10 }, { start: 3, end: 7 }];
    expect(peakOccupancy(stays, 0, 10)).toBe(2);
    expect(peakOccupancy([{ start: 0, end: 5 }, { start: 5, end: 10 }], 0, 10)).toBe(1);
  });

  it("clips to the requested window", () => {
    const stays = [{ start: 0, end: 4 }, { start: 2, end: 6 }, { start: 8, end: 12 }];
    expect(peakOccupancy(stays, 0, 10)).toBe(2);
    expect(peakOccupancy(stays, 5, 10)).toBe(1);
  });

  it("remaining capacity never goes below zero", () => {
    expect(remainingCapacity(2, [{ start: 0, end: 5 }], 0, 5)).toBe(1);
    expect(remainingCapacity(1, [{ start: 0, end: 5 }, { start: 1, end: 3 }], 0, 5)).toBe(0);
  });
});
