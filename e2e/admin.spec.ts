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

test("a restricted role: invitation, password, menu and access limited to its permissions", async ({ page, browser }) => {
  const roleName = `Accueil ${Date.now()}`;
  await page.goto("/admin/roles");
  const newRole = page.getByRole("form", { name: "Nouveau rôle" });
  await newRole.getByLabel(/^Nom/).fill(roleName);
  await newRole.getByLabel("Gérer arrivées et départs").check();
  await newRole.getByRole("button", { name: "Créer le rôle" }).click();
  await expect(page.locator(".ap-toasts")).toContainText("Rôle créé");

  const email = `agent.${Date.now()}@e2e.test`;
  await page.goto("/admin/utilisateurs");
  const invite = page.getByRole("form", { name: "Inviter un membre" });
  await invite.getByLabel("Prénom").fill("Alex");
  await invite.getByLabel(/^Nom/).fill("Agent");
  await invite.getByLabel("Adresse e-mail").fill(email);
  await invite.getByLabel("Rôle").selectOption({ label: roleName });
  await invite.getByRole("button", { name: "Envoyer l’invitation" }).click();
  await expect(invite).toContainText("Invitation envoyée");

  // The e-mail is in the outbox (console transport in tests): read the link from the database.
  const pg = await import("pg");
  const client = new pg.default.Client({ connectionString: process.env.E2E_DATABASE_URL ?? "postgresql://alterpark:alterpark@localhost:5432/alterpark_e2e_test" });
  await client.connect();
  const { rows } = await client.query(`SELECT payload->>'url' AS url FROM "Notification" WHERE recipient = $1 AND template = 'staff.invite'`, [email]);
  await client.end();
  const link = new URL(rows[0].url as string);

  const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  const agent = await ctx.newPage();
  await agent.goto(`${link.pathname}${link.search}`);
  const reset = agent.getByRole("form", { name: "Nouveau mot de passe" });
  await reset.getByLabel(/^Nouveau mot de passe/).fill("phrase de passe pour agent");
  await reset.getByLabel(/^Confirmez/).fill("phrase de passe pour agent");
  await reset.getByRole("button", { name: "Enregistrer" }).click();
  await expect(main(agent)).toContainText("Votre mot de passe a été modifié");

  await agent.goto("/connexion?suivant=/admin/reservations");
  const login = agent.getByRole("form", { name: "Connexion" });
  await login.getByLabel("Adresse e-mail").fill(email);
  await login.getByLabel("Mot de passe").fill("phrase de passe pour agent");
  await login.getByRole("button", { name: /Se connecter/ }).click();
  await agent.waitForURL((u) => u.pathname === "/admin/reservations");
  const nav = agent.getByRole("navigation", { name: "Navigation du back-office" });
  await expect(nav.getByRole("link", { name: "Réservations" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Tableau de bord" })).toBeVisible(); // checked by default in the role form
  for (const hidden of ["Paiements", "Clients", "Utilisateurs", "Rôles et permissions", "Journal d’audit"]) await expect(nav.getByRole("link", { name: hidden })).toHaveCount(0);
  await expect(main(agent).getByRole("link", { name: "Exporter (CSV)" })).toHaveCount(0);
  await agent.goto("/admin/paiements");
  await expect(main(agent)).toContainText("Accès refusé");
  expect((await agent.request.get("/admin/rapports/export")).status()).toBe(404);
  await ctx.close();
});
