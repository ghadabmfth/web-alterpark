import { expect, test, type Page } from "@playwright/test";
import { day, expectAccessible, main, STATE } from "./support/helpers";

/*
 * Booking and payment, end to end: funnel → hold → hosted payment page (Stripe emulator) → signed
 * webhook → confirmed reservation in the customer area; cancellation with refund; cancel and resume;
 * ownership; staff actions on the same booking. Demo rates: ALTERECO 27,00 € up to 3 days.
 */

test.describe.configure({ mode: "serial" });
test.use({ storageState: STATE.customerA });

let reference = "";

async function fillFunnel(page: Page, inDays: number, plate: string) {
  await page.goto(`/reservation?parking=nantes&offre=altereco&depart=${day(inDays)}&heureDepart=10:00&retour=${day(inDays + 2)}&heureRetour=10:00`);
  await expect(page.locator("#funnel-step")).toHaveText("Parking et dates");
  await page.getByRole("button", { name: "Continuer" }).click();
  await expect(page.locator("#funnel-step")).toHaveText("Véhicule");
  await page.getByLabel("Immatriculation").fill(plate);
  await page.getByRole("button", { name: "Continuer" }).click();
  // Signed-in customer: details prefilled from the account.
  await expect(page.getByLabel("Prénom")).toHaveValue("Alice");
  await page.getByLabel(/J’accepte/).check();
  await page.getByRole("button", { name: "Continuer" }).click();
  await expect(page.locator("#funnel-step")).toHaveText("Récapitulatif");
  await expect(main(page)).toContainText("27,00 €");
  await expectAccessible(page, "funnel summary");
}

test("book and pay: confirmed only by the webhook, listed in the customer area", async ({ page }) => {
  await fillFunnel(page, 12, "E2-001-AA");
  await page.getByRole("button", { name: /Payer 27,00/ }).click();
  await page.waitForURL(/localhost:12111\/pay\//);
  await expect(page.getByRole("heading", { name: "Émulateur de paiement" })).toBeVisible();
  await expect(page.locator("body")).toContainText("27.00 EUR");
  await page.getByRole("button", { name: "Payer" }).click();

  await page.waitForURL(/\/compte\/reservations\/AP-NTE-[A-Z0-9]{6}\?paiement=retour/);
  reference = new URL(page.url()).pathname.split("/").pop()!;
  await expect(main(page)).toContainText("Paiement reçu, réservation confirmée");
  await expect(main(page)).toContainText("Payé en ligne");
  await expectAccessible(page, "reservation detail");

  await page.goto("/compte/reservations");
  await expect(main(page).locator("tr", { hasText: reference })).toContainText("Confirmée");
  await page.goto("/compte");
  await expect(main(page)).toContainText(reference);
});

test("another customer cannot open it", async ({ browser }) => {
  const ctx = await browser.newContext({ storageState: STATE.customerB });
  const page = await ctx.newPage();
  await page.goto(`/compte/reservations/${reference}`);
  await expect(main(page)).toContainText("Page introuvable");
  await ctx.close();
});

test("staff see it, check the vehicle in and out", async ({ browser }) => {
  const ctx = await browser.newContext({ storageState: STATE.admin });
  const page = await ctx.newPage();
  await page.goto(`/admin/reservations?q=${reference}`);
  await main(page).getByRole("link", { name: reference }).click();
  await expect(main(page)).toContainText("Paiement reçu");
  await page.getByRole("button", { name: "Véhicule déposé" }).click();
  await expect(page.locator(".ap-toasts")).toContainText("arrivée enregistrée");
  await page.getByRole("button", { name: "Véhicule rendu" }).click();
  await expect(page.locator(".ap-toasts")).toContainText("réservation terminée");
  await page.reload();
  await expect(main(page)).toContainText("Véhicule rendu");
  await expectAccessible(page, "admin reservation");
  await ctx.close();
});

test("free cancellation refunds the payment in full", async ({ page }) => {
  await fillFunnel(page, 20, "E2-002-BB");
  await page.getByRole("button", { name: /Payer 27,00/ }).click();
  await page.waitForURL(/localhost:12111\/pay\//);
  await page.getByRole("button", { name: "Payer" }).click();
  await page.waitForURL(/paiement=retour/);
  await expect(main(page)).toContainText("Paiement reçu, réservation confirmée");

  await page.getByRole("button", { name: "Annuler la réservation" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Confirmer l’annulation" }).click();
  await expect(main(page)).toContainText("Réservation annulée le");
  await expect(main(page)).toContainText("Remboursé");
  await expect(main(page)).toContainText("27,00 €");
});

test("cancelled on the payment page: the space stays held, payment can resume", async ({ page }) => {
  await fillFunnel(page, 30, "E2-003-CC");
  await page.getByRole("button", { name: /Payer 27,00/ }).click();
  await page.waitForURL(/localhost:12111\/pay\//);
  await page.getByRole("link", { name: "Retour au site" }).click();
  await page.waitForURL(/paiement=annule/);
  await expect(main(page)).toContainText("Paiement non effectué");
  await page.getByRole("button", { name: "Reprendre le paiement" }).click();
  await page.waitForURL(/localhost:12111\/pay\//);
  await page.getByRole("button", { name: "Payer" }).click();
  await page.waitForURL(/paiement=retour/);
  await expect(main(page)).toContainText("Paiement reçu, réservation confirmée");
});

test("a refused payment releases the space", async ({ page }) => {
  await fillFunnel(page, 40, "E2-004-DD");
  await page.getByRole("button", { name: /Payer 27,00/ }).click();
  await page.waitForURL(/localhost:12111\/pay\//);
  await page.getByRole("button", { name: "Refuser le paiement" }).click();
  await page.waitForURL(/paiement=annule/);
  await page.reload();
  await expect(main(page).locator("header, h1").first()).toBeVisible();
  await expect(main(page)).toContainText("Annulée");
});

test("pay on site: confirmed at once, staff record the payment at the counter", async ({ page, browser }) => {
  await fillFunnel(page, 50, "E2-005-EE");
  await page.getByRole("radio", { name: /Payer sur place à mon retour/ }).check();
  await expect(main(page)).toContainText("Votre réservation est confirmée immédiatement");
  await page.getByRole("button", { name: "Confirmer ma réservation" }).click();
  await page.waitForURL(/\/compte\/reservations\/AP-NTE-[A-Z0-9]{6}\?reservation=confirmee/);
  const ref = new URL(page.url()).pathname.split("/").pop()!;
  await expect(main(page)).toContainText("Réservation confirmée");
  await expect(main(page)).toContainText("À régler sur place à votre retour");

  const ctx = await browser.newContext({ storageState: STATE.admin });
  const admin = await ctx.newPage();
  await admin.goto(`/admin/reservations/${ref}`);
  await expect(main(admin)).toContainText("Sur place, au retour");
  const form = admin.getByRole("form", { name: "Encaissement sur place" });
  await form.getByLabel("Moyen de paiement").selectOption({ label: "Chèques vacances" });
  await form.getByRole("button", { name: "Enregistrer l’encaissement" }).click();
  await expect(admin.locator(".ap-toasts")).toContainText("Encaissement enregistré");
  await admin.reload();
  await expect(main(admin)).toContainText("Encaissement sur place (Chèques vacances)");
  await expect(admin.getByRole("form", { name: "Encaissement sur place" })).toHaveCount(0);
  await ctx.close();
});
