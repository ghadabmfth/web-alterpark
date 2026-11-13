import { describe, expect, it } from "vitest";
import { canonicalString, sign, verify } from "./signature";

const secret = "x".repeat(32);
const parts = { method: "post", path: "/apbs/v1/health", body: '{"a":1}', timestamp: 1_800_000_000 };

describe("signature HMAC", () => {
  it("produit la chaîne canonique attendue par le plugin PHP", () => {
    expect(canonicalString(parts)).toBe(
      "1800000000\nPOST\n/apbs/v1/health\n015abd7f5cc57a2dd94b7590f04ad8084273905ee33ec5cebeae62276a97f862",
    );
  });

  it("produit la même signature que le plugin PHP (vecteur partagé)", () => {
    // Même vecteur calculé avec hash_hmac() en PHP 8.3 : voir HmacGuard.php
    expect(sign(secret, parts)).toBe("267e22482fd6da64e05c3d1d484fc6c6c92f803a75a3453aae8529364a02f824");
  });

  it("accepte une signature valide dans la fenêtre", () => {
    expect(verify(secret, parts, sign(secret, parts), parts.timestamp + 10)).toBe(true);
  });

  it("refuse une signature expirée", () => {
    expect(verify(secret, parts, sign(secret, parts), parts.timestamp + 301)).toBe(false);
  });

  it("refuse un corps modifié", () => {
    const sig = sign(secret, parts);
    expect(verify(secret, { ...parts, body: '{"a":2}' }, sig, parts.timestamp)).toBe(false);
  });

  it("refuse une signature mal formée", () => {
    expect(verify(secret, parts, "abc", parts.timestamp)).toBe(false);
  });
});
