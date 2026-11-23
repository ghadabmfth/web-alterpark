import { describe, expect, it } from "vitest";
import { forgotPasswordSchema, loginSchema, registerSchema } from "./schemas";

const reg = { civility: "MME", firstName: "Sophie", lastName: "Martin", companyName: "", email: "sophie@example.com", emailConfirm: "Sophie@Example.com", postalCode: "44000", phone: "06 12 34 56 78", password: "correct horse battery", passwordConfirm: "correct horse battery", acceptTerms: true };

describe("auth schemas", () => {
  it("accepts a valid registration (company optional, e-mail confirmation case-insensitive)", () => {
    expect(registerSchema.safeParse(reg).success).toBe(true);
  });
  it("enforces length, confirmation and terms", () => {
    const short = registerSchema.safeParse({ ...reg, password: "short", passwordConfirm: "short" });
    expect(short.success).toBe(false);
    const mismatch = registerSchema.safeParse({ ...reg, passwordConfirm: "something else entirely" });
    expect(mismatch.error?.issues[0]?.path).toEqual(["passwordConfirm"]);
    expect(registerSchema.safeParse({ ...reg, acceptTerms: false }).success).toBe(false);
  });
  it("requires civility, matching e-mails, postal code and phone (client design)", () => {
    const paths = (v: object) => registerSchema.safeParse({ ...reg, ...v }).error?.issues.map((i) => i.path.join("."));
    expect(paths({ civility: "" })).toEqual(["civility"]);
    expect(paths({ emailConfirm: "other@example.com" })).toEqual(["emailConfirm"]);
    expect(paths({ postalCode: "" })).toEqual(["postalCode"]);
    expect(paths({ phone: "" })).toEqual(["phone"]);
  });
  it("validates login and reset e-mails", () => {
    expect(loginSchema.safeParse({ email: "a@b.fr", password: "x" }).success).toBe(true);
    expect(loginSchema.safeParse({ email: "a@b.fr", password: "" }).success).toBe(false);
    expect(forgotPasswordSchema.safeParse({ email: "nope" }).success).toBe(false);
  });
});
