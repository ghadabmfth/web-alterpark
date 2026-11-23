import { describe, expect, it } from "vitest";
import { consumeRateLimit, windowStart } from "./rate-limit";

describe("consumeRateLimit", () => {
  const rule = { name: "test", limit: 3, windowSeconds: 60 };
  it("allows `limit` attempts per window, then blocks", async () => {
    const subject = `s-${Math.random()}`;
    const now = Date.UTC(2026, 10, 21, 10, 0, 5);
    const results = [];
    for (let i = 0; i < 4; i++) results.push((await consumeRateLimit(rule, subject, now)).allowed);
    expect(results).toEqual([true, true, true, false]);
  });
  it("starts afresh in the next window and keeps subjects apart", async () => {
    const subject = `s-${Math.random()}`;
    const now = Date.UTC(2026, 10, 21, 10, 0, 5);
    for (let i = 0; i < 4; i++) await consumeRateLimit(rule, subject, now);
    expect((await consumeRateLimit(rule, subject, now + 60_000)).allowed).toBe(true);
    expect((await consumeRateLimit(rule, `other-${subject}`, now)).allowed).toBe(true);
  });
  it("is atomic under concurrency", async () => {
    const subject = `s-${Math.random()}`;
    const now = Date.UTC(2026, 10, 21, 11, 0, 0);
    const all = await Promise.all(Array.from({ length: 10 }, () => consumeRateLimit(rule, subject, now)));
    expect(all.filter((r) => r.allowed)).toHaveLength(3);
  });
  it("aligns windows", () => {
    expect(windowStart(Date.UTC(2026, 0, 1, 0, 0, 59), 60).toISOString()).toBe("2026-01-01T00:00:00.000Z");
  });
});
