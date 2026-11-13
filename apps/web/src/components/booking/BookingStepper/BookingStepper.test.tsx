// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { BookingStepper } from "./BookingStepper";

describe("BookingStepper", () => {
  it("annonce l'étape en cours et le total", () => {
    render(<BookingStepper current={2} />);
    const nav = screen.getByRole("navigation", { name: "Étapes de la réservation" });
    expect(within(nav).getByText("Étape 3 sur 6")).toBeTruthy();
    const current = nav.querySelector('[aria-current="step"]');
    expect(current?.textContent).toContain("Coordonnées");
    expect(current?.textContent).toContain("(étape 3, en cours)");
  });

  it("marque les étapes terminées et à venir, en texte", () => {
    render(<BookingStepper current={2} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(6);
    expect(items[0]!.className).toContain("is-complete");
    expect(items[0]!.textContent).toContain("terminée");
    expect(items[5]!.className).toContain("is-upcoming");
    expect(items[5]!.textContent).toContain("à venir");
  });

  it("propose un lien de retour seulement vers les étapes terminées", () => {
    const steps = [
      { id: "a", label: "Dates", href: "/reserver" },
      { id: "b", label: "Offre", href: "/reserver/offres" },
      { id: "c", label: "Paiement", href: "/reserver/paiement" },
    ];
    render(<BookingStepper steps={steps} current={1} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]!.getAttribute("href")).toBe("/reserver");
  });

  it("borne l'étape courante", () => {
    render(<BookingStepper current={42} />);
    expect(screen.getByText("Étape 6 sur 6")).toBeTruthy();
  });
});
