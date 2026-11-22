import { expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/* Shared helpers of the end-to-end tests. */

export const STATE = { admin: "e2e/.auth/admin.json", customerA: "e2e/.auth/customer-a.json", customerB: "e2e/.auth/customer-b.json" };

/** The visible main region (the router may keep a previous page hidden). */
export const main = (page: Page) => page.locator("main:visible").first();

/** YYYY-MM-DD in Paris, n days from now. */
export function day(n: number): string {
  return new Date(Date.now() + n * 86_400_000).toLocaleDateString("sv-SE", { timeZone: "Europe/Paris" });
}

export async function expectAccessible(page: Page, label: string) {
  const results = await new AxeBuilder({ page: page as unknown as ConstructorParameters<typeof AxeBuilder>[0]["page"] }).include('main:not([style*="none"])')
    // AppShowcase is one decorative image (role="img"); its inner text is part of an animated
    // picture (WCAG 1.4.3 exception) and is measured mid-transition otherwise.
    .exclude(".apsc").withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`), label).toEqual([]);
}

export async function expectNoHorizontalScroll(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
}

export async function login(page: Page, email: string, password: string, next = "/compte") {
  await page.goto(`/connexion?suivant=${encodeURIComponent(next)}`);
  const form = page.getByRole("form", { name: "Connexion" });
  await form.getByLabel("Adresse e-mail").fill(email);
  await form.getByLabel("Mot de passe").fill(password);
  await form.getByRole("button", { name: /Se connecter/ }).click();
  await page.waitForURL((u) => u.pathname === next.split("?")[0]);
}

/** Fills the « Première réservation ? » form (sign-up) on /inscription and submits it. */
export async function signUp(page: Page, who: { firstName: string; lastName: string; email: string }, password = "une phrase de passe solide") {
  const form = page.getByRole("form", { name: "Création de compte" });
  await form.getByLabel("Civilité").selectOption("MME");
  await form.getByLabel("Prénom").fill(who.firstName);
  await form.getByLabel(/^Nom/).fill(who.lastName);
  await form.getByLabel(/^Adresse e-mail/).fill(who.email);
  await form.getByLabel("Confirmez l’adresse e-mail").fill(who.email);
  await form.getByLabel("Code postal").fill("44000");
  await form.getByLabel("Téléphone").fill("06 12 34 56 78");
  await form.getByLabel(/^Mot de passe/).first().fill(password);
  await form.getByLabel("Confirmez le mot de passe").fill(password);
  await form.getByLabel(/j’accepte votre politique/).check();
  await form.getByRole("button", { name: "S’inscrire" }).click();
}
