import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers";

// Petit PNG valide (1 pixel) : le serveur reconnaît le type par les premiers octets.
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");

test("les directs en cours affichent un aperçu et le badge « En direct »", async ({ page }) => {
  await page.goto("/fr/lives");
  const card = page.locator("li", { has: page.getByRole("link", { name: /Voir le live/ }) }).first();
  await expect(card.locator("img").first()).toBeVisible();
  await expect(card.getByText("En direct").first()).toBeVisible();
});

test("un vendeur ajoute puis retire la photo de son compte, visible sur sa vitrine", async ({ page }) => {
  await loginAs(page, "+237690000005");
  await page.goto("/fr/espace/vitrine");
  await page.locator("input[type=file]").setInputFiles({ name: "avatar.png", mimeType: "image/png", buffer: PNG });
  await expect(page.getByText("Photo enregistrée.")).toBeVisible();
  const photo = page.getByRole("img", { name: "Photo de ton compte" });
  await expect(photo).toBeVisible();
  const src = await photo.getAttribute("src");
  expect(src).toContain("/api/files/profiles/");
  expect((await page.request.get(src!)).status()).toBe(200);

  await page.goto("/fr/v/chez-aicha");
  await expect(page.locator(`img[src="${src}"]`)).toBeVisible();

  await page.goto("/fr/espace/vitrine");
  await page.getByRole("button", { name: "Retirer la photo" }).click();
  await expect(page.getByRole("img", { name: "Photo de ton compte" })).toHaveCount(0);
});

test("un fichier qui n'est pas une image est refusé comme photo de compte", async ({ page }) => {
  await loginAs(page, "+237690000005");
  await page.goto("/fr/espace/vitrine");
  await page.locator("input[type=file]").setInputFiles({ name: "x.png", mimeType: "image/png", buffer: Buffer.from("<script>alert(1)</script>") });
  await expect(page.getByText(/Photo non reconnue/)).toBeVisible();
});
