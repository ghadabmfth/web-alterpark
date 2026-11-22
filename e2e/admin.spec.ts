import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { expectAccessible, expectNoHorizontalScroll, main, STATE } from "./support/helpers";

/* Back office: every section accessible at mobile and desktop widths, export, settings, roles. */

test.use({ storageState: STATE.admin });

const SECTIONS = ["", "/reservations", "/paiements", "/clients", "/contacts", "/parkings", "/parkings/nantes", "/tarifs", "/rapports", "/utilisateurs", "/roles", "/parametres", "/journal"];

for (const width of [390, 1440]) {
  test(`all sections at ${width} px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const s of SECTIONS) {
      await page.goto(`/admin${s}`);
      await expect(main(page).locator("h1").first()).toBeVisible();
      await expect(main(page)).not.toContainText("Accès refusé");
      await expectAccessible(page, `/admin${s}`);
      await expectNoHorizontalScroll(page);
    }
  });
}

test("CSV export of reservations", async ({ page }) => {
  await page.goto("/admin/reservations");
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("link", { name: "Exporter (CSV)" }).click()]);
  const csv = readFileSync((await download.path())!, "utf8");
  expect(csv.startsWith("﻿Référence;Statut;Parking")).toBe(true);
});

test("the booking switch closes and reopens the funnel", async ({ page, browser }) => {
  const visitor = await browser.newContext();
  const pub = await visitor.newPage();
  try {
    await page.goto("/admin/parametres");
    await page.getByLabel("Réservation en ligne ouverte").uncheck();
    await page.getByLabel(/Message affiché/).fill("Travaux d’accès ce week-end.");
    await page.getByRole("button", { name: "Enregistrer" }).click();
    await expect(page.locator(".ap-toasts")).toContainText("Paramètres enregistrés");
    await pub.goto("/reservation");
    await expect(main(pub)).toContainText("Travaux d’accès ce week-end.");
    await expect(main(pub)).toContainText("bientôt disponible");
  } finally {
    await page.goto("/admin/parametres");
    await page.getByLabel("Réservation en ligne ouverte").check();
    await page.getByLabel(/Message affiché/).fill("");
    await page.getByRole("button", { name: "Enregistrer" }).click();
    await expect(page.locator(".ap-toasts")).toContainText("Paramètres enregistrés");
  }
  await pub.goto("/reservation");
  await expect(pub.locator("#funnel-step")).toBeVisible();
  await visitor.close();
});

test("dashboard figures and audit trail", async ({ page }) => {
  await page.goto("/admin");
  await expect(main(page)).toContainText("Chiffre d’affaires encaissé");
  await page.goto("/admin/journal?action=settings.");
  await expect(main(page).locator("table tbody tr")).not.toHaveCount(0);
});
