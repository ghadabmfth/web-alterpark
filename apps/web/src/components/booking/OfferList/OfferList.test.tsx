// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { OfferList } from "./OfferList";
import type { BookingOfferQuote } from "../OfferCard/OfferCard";

const offers: BookingOfferQuote[] = [
  { id: "a", name: "Offre A", features: ["Inclus 1"], totalCents: 4560 },
  { id: "b", name: "Offre B", features: [], totalCents: 6000, available: false },
];

describe("OfferList", () => {
  it("affiche prix total, durée et état de sélection", () => {
    const onSelect = vi.fn();
    render(<OfferList offers={offers} days={8} selectedId="a" onSelect={onSelect} />);
    expect(screen.getByText("45,60 €")).toBeTruthy();
    expect(screen.getAllByText("TTC pour 8 jours")).toHaveLength(2);
    const chosen = screen.getByRole("button", { name: "Offre choisie" });
    expect(chosen.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("Complet pour ces dates")).toBeTruthy();
    expect(screen.getByRole("status").textContent).toBe("1 offre disponible");
    fireEvent.click(chosen);
    expect(onSelect).toHaveBeenCalledWith(offers[0]);
  });

  it("affiche l'état « aucune disponibilité » quand toutes les offres sont complètes", () => {
    render(<OfferList offers={[offers[1]!]} days={8} changeDates={{ label: "Modifier mes dates", href: "/reserver" }} />);
    expect(screen.getByText("Aucune place disponible pour ces dates")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Modifier mes dates" })).toBeTruthy();
  });

  it("affiche le chargement et l'erreur", () => {
    const { rerender } = render(<OfferList status="loading" offers={[]} days={1} />);
    expect(screen.getByRole("status").textContent).toBe("Recherche des places disponibles…");
    rerender(<OfferList status="error" offers={[]} days={1} retry={{ label: "Réessayer", onClick: () => {} }} />);
    expect(screen.getByRole("alert").textContent).toContain("Le service de réservation ne répond pas");
    expect(screen.getByRole("button", { name: "Réessayer" })).toBeTruthy();
  });
});
