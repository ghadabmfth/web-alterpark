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
  const results = await new AxeBuilder({ page: page as unknown as ConstructorParameters<typeof AxeBuilder>[0]["page"] }).include('main:not([style*="none"])').withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
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
