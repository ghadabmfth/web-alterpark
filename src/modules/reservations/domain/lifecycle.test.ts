import { describe, expect, it } from "vitest";
import { canTransition, consumesCapacity, STATUS_LABELS, TRANSITIONS } from "./status";
import { newReference, REFERENCE_ALPHABET, REFERENCE_RE } from "./reference";
import { cancellationOption } from "./cancellation";

const H = 3_600_000;

describe("status transitions", () => {
  it("follows the documented machine", () => {
    expect(canTransition("PENDING_PAYMENT", "CONFIRMED")).toBe(true);
    expect(canTransition("EXPIRED", "CONFIRMED")).toBe(true); // late payment, space still free
    expect(canTransition("CONFIRMED", "CHECKED_IN")).toBe(true);
    expect(canTransition("CHECKED_IN", "COMPLETED")).toBe(true);
    expect(canTransition("CONFIRMED", "PENDING_PAYMENT")).toBe(false);
    expect(canTransition("CHECKED_IN", "CANCELLED")).toBe(false);
    expect(canTransition("COMPLETED", "CANCELLED")).toBe(false);
    expect(canTransition("CANCELLED", "CONFIRMED")).toBe(false);
    for (const s of Object.keys(TRANSITIONS)) expect(STATUS_LABELS[s as keyof typeof STATUS_LABELS]).toBeTruthy();
  });

  it("holds consume capacity only until they expire", () => {
    const now = new Date(1_000_000);
    expect(consumesCapacity("PENDING_PAYMENT", new Date(1_000_001), now)).toBe(true);
    expect(consumesCapacity("PENDING_PAYMENT", new Date(1_000_000), now)).toBe(false);
    expect(consumesCapacity("PENDING_PAYMENT", null, now)).toBe(false);
    expect(consumesCapacity("CONFIRMED", null, now)).toBe(true);
    expect(consumesCapacity("CHECKED_IN", null, now)).toBe(true);
    for (const s of ["COMPLETED", "CANCELLED", "EXPIRED"] as const) expect(consumesCapacity(s, null, now)).toBe(false);
  });
});

describe("references", () => {
  it("have the AP-IATA-XXXXXX shape without ambiguous characters", () => {
    for (let i = 0; i < 200; i++) expect(newReference("nte")).toMatch(REFERENCE_RE);
    expect(REFERENCE_ALPHABET).not.toMatch(/[01IO]/);
    expect(REFERENCE_ALPHABET).toHaveLength(32);
    expect(newReference("CDG", () => 0)).toBe("AP-CDG-222222");
  });
});

describe("cancellation policy", () => {
  const now = new Date("2026-06-01T10:00:00Z");
  const at = (h: number) => new Date(now.getTime() + h * H);
  it("is free until the deadline, a request after, impossible once started", () => {
    expect(cancellationOption({ status: "CONFIRMED", startsAt: at(48) }, 24, now)).toBe("FREE");
    expect(cancellationOption({ status: "CONFIRMED", startsAt: at(24) }, 24, now)).toBe("FREE");
    expect(cancellationOption({ status: "CONFIRMED", startsAt: at(23) }, 24, now)).toBe("REQUEST");
    expect(cancellationOption({ status: "CONFIRMED", startsAt: at(0) }, 24, now)).toBe("NONE");
    expect(cancellationOption({ status: "CHECKED_IN", startsAt: at(48) }, 24, now)).toBe("NONE");
    expect(cancellationOption({ status: "PENDING_PAYMENT", startsAt: at(48) }, 24, now)).toBe("NONE");
  });
});
