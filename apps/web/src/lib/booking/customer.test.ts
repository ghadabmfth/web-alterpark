import { describe, expect, it } from "vitest";
import { EMPTY_CUSTOMER, validateCustomer, type CustomerInput } from "./customer";

const valid: CustomerInput = {
  firstName: " Claire ",
  lastName: "Martin",
  email: "claire.martin@example.fr",
  phone: "06 12 34 56 78",
  plate: " ab-123-cd ",
  passengers: "2",
  flight: "af 1234",
  cgv: true,
};

describe("validateCustomer", () => {
  it("accepte et normalise des coordonnées valides", () => {
    const r = validateCustomer(valid);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data).toEqual({
        firstName: "Claire",
        lastName: "Martin",
        email: "claire.martin@example.fr",
        phone: "06 12 34 56 78",
        plate: "AB-123-CD",
        passengers: 2,
        flight: "AF1234",
        cgv: true,
      });
    }
  });

  it("le numéro de vol est facultatif", () => {
    expect(validateCustomer({ ...valid, flight: "" }).ok).toBe(true);
  });

  it("signale chaque champ obligatoire vide", () => {
    const r = validateCustomer(EMPTY_CUSTOMER);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors).toEqual({
        firstName: "Indiquez votre prénom.",
        lastName: "Indiquez votre nom.",
        email: "Indiquez votre adresse e-mail.",
        phone: "Indiquez votre numéro de téléphone.",
        plate: "Indiquez l’immatriculation de votre véhicule.",
        cgv: "Acceptez les conditions générales de vente pour continuer.",
      });
    }
  });

  it.each([
    ["email", "claire@", /e-mail invalide/],
    ["phone", "12 34", /Numéro invalide/],
    ["phone", "06 12 ab 56 78", /Numéro invalide/],
    ["plate", "AB_123", /Immatriculation invalide/],
    ["passengers", "0", /Au moins 1/],
    ["passengers", "9", /8 passagers au maximum/],
    ["passengers", "1.5", /nombre entier/],
    ["flight", "1234", /vol invalide/],
  ] as const)("refuse %s = %s", (field, value, message) => {
    const r = validateCustomer({ ...valid, [field]: value });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors[field]).toMatch(message);
  });

  it("accepte un numéro international et une plaque étrangère", () => {
    expect(validateCustomer({ ...valid, phone: "+44 20 7946 0958", plate: "B 1234 XYZ" }).ok).toBe(true);
  });

  it("respecte un maximum de passagers propre au parking", () => {
    expect(validateCustomer({ ...valid, passengers: "5" }, 4).ok).toBe(false);
  });
});
