import { expect, test } from "@playwright/test";

test("accueil : deux gros boutons, sans défilement horizontal (RES-01)", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/fr$/);
  await expect(page.getByRole("link", { name: /studio à Lomé/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /depuis chez moi/ })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
});

test("boutons d'action d'au moins 48 px de haut", async ({ page }) => {
  await page.goto("/fr");
  const box = await page.getByRole("link", { name: /studio à Lomé/ }).boundingBox();
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(48);
});
