import { expect, test } from "@playwright/test";

// Parcours complet : accueil -> profil vendeur + OTP -> offre -> créneau -> paiement simulé -> confirmation.
test("un vendeur réserve et paie un live à distance de bout en bout", async ({ page }) => {
  const phone = `+2376${String(Date.now()).slice(-8)}`;
  const email = `e2e-${Date.now()}@ocdlive.test`;

  await page.goto("/fr");
  await page.getByRole("link", { name: /depuis chez moi/ }).click();

  // Écran 2 : catégorie, coordonnées, puis code reçu par e-mail (affiché en développement).
  await page.getByRole("button", { name: "Nourriture" }).click();
  await page.getByLabel("Ton nom complet").fill("Test Playwright");
  await page.getByLabel("Nom de ta boutique").fill("Boutique E2E");
  await page.getByLabel("Ton pays").selectOption({ label: "Cameroun (+237)" });
  await page.getByLabel("Ton numéro WhatsApp", { exact: true }).fill(phone);
  await page.getByLabel("Ton adresse e-mail", { exact: true }).fill(email);
  await page.getByRole("button", { name: "Recevoir mon code" }).click();
  const hint = await page.getByText(/Code de test : \d{6}/).textContent();
  await page.getByLabel("Entre ton code à 6 chiffres").fill(hint!.match(/\d{6}/)![0]);
  await page.getByRole("button", { name: "Valider mon code et continuer" }).click();

  // Écran 3 : offre.
  await expect(page).toHaveURL(/\/reserver\/package/);
  await page.getByRole("button", { name: /^Choisir/ }).first().click();

  // Écran 4 : premier jour ouvert, premier créneau libre.
  await expect(page).toHaveURL(/\/reserver\/creneau/);
  // Jour et créneau au hasard : évite les collisions avec les exécutions précédentes ou parallèles.
  const days = page.locator("button:not([disabled])[aria-label*='libre']");
  await expect(days.first()).toBeVisible();
  await days.nth(Math.floor(Math.random() * (await days.count()))).click();
  const slots = page.locator("button[data-slot]:not([disabled])");
  await expect(slots.first()).toBeVisible();
  await slots.nth(Math.floor(Math.random() * (await slots.count()))).click();

  await page.getByRole("button", { name: "Continuer vers le paiement" }).click();

  // Écran 5 : paiement mobile money simulé.
  await expect(page).toHaveURL(/\/reserver\/paiement/);
  await expect(page.getByText(/Créneau verrouillé pour/)).toBeVisible();
  await page.getByRole("button", { name: "Orange Money" }).click();
  await page.getByRole("button", { name: /^Payer/ }).click();
  await page.waitForURL(/\/dev\/paiement\//);
  await page.waitForLoadState("networkidle"); // laisse la page s'hydrater avant de cliquer
  await page.getByRole("button", { name: "Simuler la réussite" }).click();

  await expect(page.getByRole("heading", { name: /Ton direct est officiellement programmé/ })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole("link", { name: /Télécharger le reçu/ })).toBeVisible();
});

test("un rechargement à l'étape créneau ramène à l'étape créneau (RES-06)", async ({ page }) => {
  await page.goto("/fr");
  await page.evaluate(() =>
    localStorage.setItem("ocd:booking:v1", JSON.stringify({ mode: "REMOTE", sellerDone: true, countryCode: "CM", packageSlug: "essai" })),
  );
  await page.goto("/fr/reserver");
  await expect(page).toHaveURL(/\/reserver\/creneau/);
  await page.reload();
  await expect(page).toHaveURL(/\/reserver\/creneau/);
});

test("un vendeur ne peut pas ouvrir le back-office", async ({ page }) => {
  await page.goto("/fr/admin");
  await expect(page).toHaveURL(/\/fr\/connexion/);
});
