import { expect, test } from "@playwright/test";
import { expectAccessible, expectNoHorizontalScroll, main } from "./support/helpers";

/* Public site: every page renders, is accessible and fits mobile; contact form is stored. */

const PAGES = ["/", "/services", "/parkings", "/parkings/nantes", "/parkings/marseille", "/comment-ca-marche", "/faq", "/contact", "/reservation", "/connexion", "/inscription", "/mot-de-passe-oublie", "/mentions-legales", "/cgv", "/confidentialite"];

for (const width of [390, 1440]) {
  test(`public pages at ${width} px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const csp: string[] = [];
    page.on("console", (m) => m.text().startsWith("CSP:") && csp.push(m.text()));
    await page.addInitScript(() => document.addEventListener("securitypolicyviolation", (e) => console.log(`CSP: ${e.violatedDirective} ${e.blockedURI} ${e.sourceFile}`)));
    for (const path of PAGES) {
      const res = await page.goto(path);
      expect(res?.status(), path).toBe(200);
      await expect(main(page).locator("h1").first()).toBeVisible();
      await expectAccessible(page, path);
      await expectNoHorizontalScroll(page);
    }
    expect(csp, "Content-Security-Policy violations").toEqual([]);
  });
}

test("security headers", async ({ request }) => {
  const res = await request.get("/");
  const h = res.headers();
  expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(h["x-frame-options"]).toBe("DENY");
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["strict-transport-security"]).toContain("max-age=");
  expect(h["x-powered-by"]).toBeUndefined();
});

test("unknown page is a 404", async ({ page }) => {
  const res = await page.goto("/nexiste-pas");
  expect(res?.status()).toBe(404);
  await expect(main(page)).toContainText("Page introuvable");
});

test("contact form is stored", async ({ page }) => {
  await page.goto("/contact");
  const form = page.getByRole("form", { name: /contact/i });
  await form.getByLabel(/^Nom/).fill("Paul E2E");
  await form.getByLabel("Adresse e-mail").fill("paul@example.com");
  await form.getByLabel(/Sujet/).selectOption({ index: 1 });
  await form.getByLabel(/Message/).fill("Bonjour, ceci est un message de test de bout en bout.");
  await page.waitForTimeout(3200); // the form rejects submissions faster than a human (anti-spam)
  await form.getByRole("button", { name: /Envoyer/ }).click();
  await expect(main(page)).toContainText("Message envoyé");
});

test.describe("as staff", () => {
  test.use({ storageState: "e2e/.auth/admin.json" });
  test("the contact message reached the back office", async ({ page }) => {
    await page.goto("/admin/contacts?q=Paul%20E2E");
    await expect(main(page).locator("table tbody tr").first()).toContainText("Paul E2E");
  });
});
