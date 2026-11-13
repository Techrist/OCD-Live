import { expect, test } from "@playwright/test";

const stamp = () => `${Date.now()}${Math.floor(Math.random() * 1000)}`;

test("l'API refuse une adresse invalide", async ({ request }) => {
  const res = await request.post("/api/auth/otp/request", { data: { email: "pas-une-adresse" } });
  expect(res.status()).toBe(400);
});

test("première connexion : numéro WhatsApp exigé, puis compte vendeur créé", async ({ page, request }) => {
  const email = `e2e-auth-${stamp()}@ocdlive.test`;
  const req = await request.post("/api/auth/otp/request", { data: { email } });
  const { devCode, needsPhone } = await req.json();
  expect(needsPhone).toBe(true);
  // Sans numéro : refusé AVANT de consommer le code.
  expect((await request.post("/api/auth/otp/verify", { data: { email, code: devCode } })).status()).toBe(400);
  // Numéro déjà pris par un autre compte (admin du seed).
  const taken = await request.post("/api/auth/otp/verify", { data: { email, code: devCode, phone: "+22890000001" } });
  expect((await taken.json()).reason).toBe("PHONE_TAKEN");
  // Le code est toujours valable : connexion avec un nouveau numéro.
  const ok = await request.post("/api/auth/otp/verify", { data: { email, code: devCode, phone: `+2376${stamp().slice(-8)}` } });
  expect((await ok.json()).redirect).toMatch(/espace/);
  // Un code ne sert qu'une fois.
  expect((await request.post("/api/auth/otp/verify", { data: { email, code: devCode, phone: "+22890000009" } })).status()).toBe(401);
  await page.goto("/fr/connexion");
});

test("connexion d'un compte existant depuis /connexion : pas de numéro demandé, redirection vers l'espace", async ({ page }) => {
  await page.goto("/fr/connexion");
  await expect(page.getByRole("button", { name: /Continuer avec Google/ })).toBeVisible();
  await page.getByLabel("Ton adresse e-mail").fill("Aicha@OcdLive.test");
  await page.getByRole("button", { name: "Recevoir mon code" }).click();
  const hint = await page.getByText(/Code de test : \d{6}/).textContent();
  await expect(page.getByLabel("Ton numéro WhatsApp")).toHaveCount(0);
  await page.getByLabel(/Code envoyé à/).fill(hint!.match(/\d{6}/)![0]);
  await page.getByRole("button", { name: "Valider" }).click();
  await expect(page).toHaveURL(/\/fr\/espace/);
});

test("un mauvais code est refusé avec le nombre d'essais restants", async ({ page }) => {
  await page.goto("/fr/connexion");
  await page.getByLabel("Ton adresse e-mail").fill(`e2e-wrong-${stamp()}@ocdlive.test`);
  await page.getByRole("button", { name: "Recevoir mon code" }).click();
  await page.getByLabel(/Code envoyé à/).fill("000000");
  await page.getByLabel("Ton numéro WhatsApp").fill(`+2376${stamp().slice(-8)}`);
  await page.getByRole("button", { name: "Valider" }).click();
  await expect(page.getByText(/Il te reste 4 essai/)).toBeVisible();
});
