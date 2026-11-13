import { describe, expect, it } from "vitest";
import { BOOKING_STEPS, stepIndex, stepProgress, stepStatus } from "./steps";

describe("étapes du tunnel", () => {
  it("suit l'ordre du parcours", () => {
    expect(BOOKING_STEPS.map((s) => s.id)).toEqual(["search", "offer", "customer", "summary", "payment", "confirmation"]);
    expect(stepIndex(BOOKING_STEPS, "customer")).toBe(2);
    expect(stepIndex(BOOKING_STEPS, "inconnue")).toBe(-1);
  });

  it("donne l'état de chaque étape", () => {
    expect([0, 1, 2, 3].map((i) => stepStatus(i, 2))).toEqual(["complete", "complete", "current", "upcoming"]);
  });

  it("calcule la progression, bornée", () => {
    expect(stepProgress(0, 6)).toBeCloseTo(1 / 6);
    expect(stepProgress(5, 6)).toBe(1);
    expect(stepProgress(9, 6)).toBe(1);
    expect(stepProgress(-3, 6)).toBe(0);
    expect(stepProgress(0, 0)).toBe(0);
  });
});
