import { describe, expect, it } from "vitest";
import { forgotPasswordSchema, loginSchema, registerSchema } from "./schemas";

const reg = { firstName: "Sophie", lastName: "Martin", email: "sophie@example.com", phone: "", password: "correct horse battery", passwordConfirm: "correct horse battery", acceptTerms: true };

describe("auth schemas", () => {
  it("accepts a valid registration (phone optional)", () => {
    expect(registerSchema.safeParse(reg).success).toBe(true);
  });
  it("enforces length, confirmation and terms", () => {
    const short = registerSchema.safeParse({ ...reg, password: "short", passwordConfirm: "short" });
    expect(short.success).toBe(false);
    const mismatch = registerSchema.safeParse({ ...reg, passwordConfirm: "something else entirely" });
    expect(mismatch.error?.issues[0]?.path).toEqual(["passwordConfirm"]);
    expect(registerSchema.safeParse({ ...reg, acceptTerms: false }).success).toBe(false);
  });
  it("validates login and reset e-mails", () => {
    expect(loginSchema.safeParse({ email: "a@b.fr", password: "x" }).success).toBe(true);
    expect(loginSchema.safeParse({ email: "a@b.fr", password: "" }).success).toBe(false);
    expect(forgotPasswordSchema.safeParse({ email: "nope" }).success).toBe(false);
  });
});
