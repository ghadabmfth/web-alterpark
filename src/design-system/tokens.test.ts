import { describe, expect, it } from "vitest";
import { tokenValue } from "./tokens";

describe("tokenValue", () => {
  it("reads colours (dark theme) and plain values", () => {
    expect(tokenValue("surface")).toBe("#313131");
    expect(tokenValue("primary")).toBe("#f6921e");
    expect(tokenValue("space-4")).toBe("16px");
  });

  it("fails loudly on unknown tokens", () => {
    expect(() => tokenValue("brand-blue")).toThrow(/Unknown design token/);
  });
});
