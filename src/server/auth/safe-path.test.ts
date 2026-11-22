import { describe, expect, it } from "vitest";
import { isSafeNextPath } from "./safe-path";

describe("redirect after sign-in", () => {
  it("accepts internal paths", () => {
    for (const p of ["/compte", "/admin/reservations?statut=CONFIRMED", "/reservation?reprise=1", "/compte/reservations/AP-NTE-7K3Q9M"]) expect(isSafeNextPath(p), p).toBe(true);
  });
  it("refuses anything that could leave the site", () => {
    for (const p of [null, "", "compte", "//evil.example", "/\\evil.example", "/\t/evil.example", "/\n/evil.example", "/ /evil.example", "https://evil.example", "/%0d%0aSet-Cookie:x".replace("%0d%0a", "\r\n"), "/" + "a".repeat(600)]) {
      expect(isSafeNextPath(p), JSON.stringify(p)).toBe(false);
    }
  });
});
