import { expect, test } from "@playwright/test";

import { loginAs, loginNewSeller } from "./helpers";

test("un vendeur s'abonne à l'annuaire : paiement simulé puis abonnement actif (ANN-01)", async ({ page }) => {
  await loginNewSeller(page);
  await page.goto("/fr/espace/abonnement");
  await expect(page.getByText("Pas d'abonnement actif")).toBeVisible();
  await page.getByRole("button", { name: "Orange Money" }).click();
  await page.getByRole("button", { name: /S'abonner/ }).click();
  await page.waitForURL(/\/dev\/paiement\//);
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Simuler la réussite" }).click();
  await expect(page.getByText("Abonnement actif")).toBeVisible();
  await expect(page.getByText(/Jusqu'au/)).toBeVisible();
});

test("l'annuaire public liste les pays avec le nombre de lives, puis les fiches", async ({ page }) => {
  await page.goto("/fr/lives");
  await expect(page.getByRole("heading", { name: "Lives en direct" })).toBeVisible();
  await page.getByRole("link", { name: /Cameroun/ }).click();
  await expect(page).toHaveURL(/\/fr\/lives\/cm/);
  await expect(page.getByRole("link", { name: /Voir le live/ }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /WhatsApp/ }).first()).toBeVisible();
});

test("la file de validation est réservée aux validateurs et admins", async ({ page }) => {
  await loginAs(page, "+22890000002"); // VALIDATOR
  await page.goto("/fr/admin/validation");
  await expect(page.getByRole("heading", { name: "Lives à valider" })).toBeVisible();
  await page.goto("/fr/admin/packages");
  await expect(page).toHaveURL(/\/fr\/admin$/); // un validateur n'accède pas aux packages
});

test("un vendeur est renvoyé de /admin/validation vers son espace", async ({ page }) => {
  await loginAs(page, "+237690000005"); // SELLER avec abonnement
  await page.goto("/fr/admin/validation");
  await expect(page).toHaveURL(/\/fr\/espace/);
});
