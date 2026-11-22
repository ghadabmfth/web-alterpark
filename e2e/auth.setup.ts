import { test as setup } from "@playwright/test";
import { E2E } from "../playwright.config";
import { login, STATE } from "./support/helpers";

/* Signs in once per role; the specs reuse the saved sessions (and stay under the login rate limits). */

setup("administrator session", async ({ page }) => {
  await login(page, E2E.adminEmail, E2E.adminPassword, "/admin");
  await page.context().storageState({ path: STATE.admin });
});

setup("customer A session", async ({ page }) => {
  await login(page, "client.a@e2e.test", E2E.customerPassword);
  await page.context().storageState({ path: STATE.customerA });
});

setup("customer B session", async ({ page }) => {
  await login(page, "client.b@e2e.test", E2E.customerPassword);
  await page.context().storageState({ path: STATE.customerB });
});
