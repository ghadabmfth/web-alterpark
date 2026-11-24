import { expect, test } from "@playwright/test";
import { E2E } from "../playwright.config";
import { main, signUp, STATE } from "./support/helpers";

/* Accounts: sign-up, sign-in errors, sign-out, reset without enumeration, protected areas. */

test("sign-up creates the account and opens the customer area", async ({ page }) => {
  const email = `nouveau.${Date.now()}@e2e.test`;
  await page.goto("/inscription");
  await signUp(page, { firstName: "Nora", lastName: "Nouvelle", email });
  await page.waitForURL((u) => u.pathname === "/compte");
  await expect(main(page)).toContainText("Bonjour Nora");
  await expect(main(page)).toContainText("Confirmez votre adresse e-mail");

  await page.getByRole("button", { name: "Se déconnecter" }).click();
  await page.waitForURL((u) => !u.pathname.startsWith("/compte"));
  await page.goto("/compte");
  await expect(page).toHaveURL(/\/connexion\?suivant=%2Fcompte/);
});

test("wrong password and unknown account get the same message", async ({ page }) => {
  for (const email of ["client.a@e2e.test", "personne@e2e.test"]) {
    await page.goto("/connexion");
    const form = page.getByRole("form", { name: "Connexion" });
    await form.getByLabel("Adresse e-mail").fill(email);
    await form.getByLabel("Mot de passe").fill("mauvais mot de passe");
    await form.getByRole("button", { name: /Se connecter/ }).click();
    await expect(form).toContainText("Adresse e-mail ou mot de passe incorrect.");
  }
});

test("password reset never reveals whether an account exists", async ({ page }) => {
  for (const email of ["client.a@e2e.test", "personne@e2e.test"]) {
    await page.goto("/mot-de-passe-oublie");
    await page.getByLabel("Adresse e-mail").fill(email);
    await page.getByRole("button", { name: "Recevoir le lien" }).click();
    await expect(main(page)).toContainText("Si un compte existe avec cette adresse");
  }
});

test.describe("customer", () => {
  test.use({ storageState: STATE.customerA });
  test("cannot see the back office (not found)", async ({ page }) => {
    // The area is streamed behind the session check: the « not found » page replaces it (HTTP 200
    // once streaming has started, robots noindex); the export route answers a real 404.
    await page.goto("/admin");
    await expect(main(page)).toContainText("Page introuvable");
    await expect(page.getByRole("navigation", { name: "Navigation du back-office" })).toHaveCount(0);
    const exp = await page.request.get("/admin/rapports/export");
    expect(exp.status()).toBe(404);
  });
  test("cannot call the cron endpoint", async ({ request }) => {
    expect((await request.get("/api/cron/notifications")).status()).toBe(401);
  });
});

test("the admin session from setup is valid", async ({ browser }) => {
  const ctx = await browser.newContext({ storageState: STATE.admin });
  const page = await ctx.newPage();
  await page.goto("/admin");
  await expect(main(page).locator("h1")).toHaveText("Tableau de bord");
  expect(E2E.adminEmail).toContain("@");
  await ctx.close();
});

test("a customer deletes their account (GDPR) and can no longer sign in", async ({ page }) => {
  const email = `suppr.${Date.now()}@e2e.test`;
  await page.goto("/inscription");
  await signUp(page, { firstName: "Sam", lastName: "Supprime", email });
  await page.waitForURL((u) => u.pathname === "/compte");

  await page.goto("/compte/profil");
  const del = page.getByRole("form", { name: "Supprimer mon compte" });
  await del.getByLabel(/^Mot de passe/).fill("une phrase de passe solide");
  await del.getByLabel(/Je comprends/).check();
  await del.getByRole("button", { name: "Supprimer mon compte" }).click();
  await page.waitForURL((u) => u.pathname === "/");

  await page.goto("/connexion");
  const login = page.getByRole("form", { name: "Connexion" });
  await login.getByLabel("Adresse e-mail").fill(email);
  await login.getByLabel("Mot de passe").fill("une phrase de passe solide");
  await login.getByRole("button", { name: /Se connecter/ }).click();
  await expect(login).toContainText("Adresse e-mail ou mot de passe incorrect.");
});
