// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CustomerForm } from "./CustomerForm";

const setup = (props: Partial<Parameters<typeof CustomerForm>[0]> = {}) => {
  const onSubmit = vi.fn();
  const user = userEvent.setup();
  render(<CustomerForm cgvHref="/cgv" onSubmit={onSubmit} {...props} />);
  return { user, onSubmit };
};

describe("CustomerForm", () => {
  it("bloque l'envoi, résume les erreurs et place le focus sur le premier champ", async () => {
    const { user, onSubmit } = setup();
    await user.click(screen.getByRole("button", { name: "Continuer vers le récapitulatif" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toContain("6 champs sont à corriger.");
    expect(screen.getByText("Indiquez votre prénom.")).toBeTruthy();
    expect(screen.getByText("Acceptez les conditions générales de vente pour continuer.")).toBeTruthy();
    await waitFor(() => expect(document.activeElement).toBe(screen.getByLabelText(/^Prénom/)));
  });

  it("vérifie un champ quand on le quitte", async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText(/^E-mail/), "claire@");
    await user.tab();
    expect(screen.getByText(/Adresse e-mail invalide/)).toBeTruthy();
    expect(screen.getByLabelText(/^E-mail/).getAttribute("aria-invalid")).toBe("true");
    await user.type(screen.getByLabelText(/^E-mail/), "example.fr");
    expect(screen.queryByText(/Adresse e-mail invalide/)).toBeNull();
  });

  it("envoie les coordonnées normalisées", async () => {
    const { user, onSubmit } = setup({ maxPassengers: 4 });
    await user.type(screen.getByLabelText(/^Prénom/), "Claire");
    await user.type(screen.getByLabelText(/^Nom/), "Martin");
    await user.type(screen.getByLabelText(/^E-mail/), "claire@example.fr");
    await user.type(screen.getByLabelText(/^Téléphone/), "06 12 34 56 78");
    await user.type(screen.getByLabelText(/^Immatriculation/), "ab-123-cd");
    await user.selectOptions(screen.getByLabelText(/^Passagers/), "3");
    expect(screen.getAllByRole("option")).toHaveLength(4);
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Continuer vers le récapitulatif" }));
    expect(onSubmit).toHaveBeenCalledWith({
      firstName: "Claire",
      lastName: "Martin",
      email: "claire@example.fr",
      phone: "06 12 34 56 78",
      plate: "AB-123-CD",
      passengers: 3,
      flight: "",
      cgv: true,
    });
  });

  it("ouvre les CGV dans un nouvel onglet et désactive l'envoi pendant le traitement", () => {
    setup({ pending: true });
    const link = screen.getByRole("link", { name: /conditions générales de vente/ });
    expect(link.getAttribute("target")).toBe("_blank");
    const button = screen.getByRole("button", { name: "Vérification de la disponibilité…" }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
});
