import { describe, expect, it } from "vitest";
import { customerSchema, normalizeFlight, normalizePlate, vehicleSchema } from "./schemas";

describe("vehicleSchema", () => {
  const base = { plate: "ab-123 cd", passengers: "2", outboundFlight: "", returnFlight: "" };
  it("normalises plate and flights and coerces passengers", () => {
    const r = vehicleSchema.parse({ ...base, outboundFlight: "af 1234" });
    expect(r).toEqual({ plate: "AB-123 CD", passengers: 2, outboundFlight: "AF1234", returnFlight: "" });
    expect(normalizePlate("  ab   12 ")).toBe("AB 12");
    expect(normalizeFlight(" u2 4567 ")).toBe("U24567");
  });
  it("rejects bad plates, flights and passenger counts", () => {
    expect(vehicleSchema.safeParse({ ...base, plate: "" }).success).toBe(false);
    expect(vehicleSchema.safeParse({ ...base, plate: "AB@123" }).success).toBe(false);
    expect(vehicleSchema.safeParse({ ...base, outboundFlight: "1234" }).success).toBe(false);
    expect(vehicleSchema.safeParse({ ...base, passengers: "9" }).success).toBe(false);
    expect(vehicleSchema.safeParse({ ...base, passengers: "0" }).success).toBe(false);
  });
});

describe("customerSchema", () => {
  const ok = { firstName: "Sophie", lastName: "Martin", email: "sophie@example.com", phone: "06 12 34 56 78", acceptTerms: true };
  it("accepts French and international numbers", () => {
    expect(customerSchema.safeParse(ok).success).toBe(true);
    expect(customerSchema.safeParse({ ...ok, phone: "+33 6 12 34 56 78" }).success).toBe(true);
  });
  it("requires the terms and a valid e-mail and phone", () => {
    expect(customerSchema.safeParse({ ...ok, acceptTerms: false }).success).toBe(false);
    expect(customerSchema.safeParse({ ...ok, email: "sophie@" }).success).toBe(false);
    expect(customerSchema.safeParse({ ...ok, phone: "12" }).success).toBe(false);
  });
});

describe("bookingFormSchema", () => {
  it("only reports the fields that are still invalid", async () => {
    const { bookingFormSchema } = await import("./schemas");
    const r = bookingFormSchema.safeParse({
      parking: "nantes", offer: "altereco", departureDate: "2026-11-24", departureTime: "06:30", returnDate: "2026-12-02", returnTime: "22:10",
      plate: "ab-123 cd", passengers: "1", outboundFlight: "", returnFlight: "",
      firstName: "", lastName: "", email: "", phone: "", acceptTerms: false,
    });
    const paths = [...new Set((r.error?.issues ?? []).map((i) => i.path.join(".")))];
    expect(paths.sort()).toEqual(["acceptTerms", "email", "firstName", "lastName", "phone"]);
  });
});
