import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers";

// Petit PNG valide (1 pixel) : le serveur reconnaît le type par les premiers octets.
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");

test("OCD Shop : le catalogue s'affiche et se filtre par pays, catégorie et prix (SHP-04)", async ({ page }) => {
  await page.goto("/fr/shop");
  await expect(page.getByRole("heading", { name: "OCD Shop", level: 1 })).toBeVisible();
  const cards = page.getByTestId("product-card");
  await expect(cards.first()).toBeVisible();
  const total = await cards.count();
  expect(total).toBeGreaterThan(2);

  await page.goto("/fr/shop?pays=TG");
  await expect(cards.first()).toBeVisible();
  expect(await cards.count()).toBeLessThan(total + 1);
  await expect(page.getByText("Lomé").first()).toBeVisible();

  await page.goto("/fr/shop?min=100000");
  await expect(page.getByText("Aucun produit ne correspond pour l'instant.")).toBeVisible();

  await page.goto("/fr/shop");
  await page.locator("#catalogue").getByLabel("Catégorie").selectOption({ index: 1 });
  await page.getByRole("button", { name: "Filtrer" }).click();
  await expect(page).toHaveURL(/categorie=/);
  await expect(cards.first()).toBeVisible();
});

test("la fiche produit permet de commander par WhatsApp, sans paiement sur le site (SHP-02)", async ({ page }) => {
  await page.goto("/fr/shop");
  await page.getByTestId("product-card").first().getByRole("link").first().click();
  await expect(page).toHaveURL(/\/fr\/shop\/[a-z0-9]+$/);
  await expect(page.getByTestId("product-price")).toBeVisible();
  await page.getByRole("button", { name: "Plus" }).click();
  await expect(page.locator("main output").first()).toHaveText("2");
  const href = await page.getByTestId("order-link").first().getAttribute("href");
  expect(href).toMatch(/^\/api\/go\?t=wa&id=/);
  const message = decodeURIComponent(new URL(href!, "http://x").searchParams.get("m")!);
  expect(message).toMatch(/commander 2 × /);
  expect(message).toMatch(/OCD Shop/);
  await expect(page.getByText("Vendu par")).toBeVisible();
});

test("la fiche propose des produits similaires, filtrables par catégorie, pays et prix", async ({ page }) => {
  await page.goto("/fr/shop");
  await page.getByTestId("product-card").first().getByRole("link").first().click();
  const similar = page.locator("#similaires");
  await expect(similar.getByRole("heading", { name: "Produits similaires" })).toBeVisible();
  await expect(similar.getByLabel("Catégorie")).not.toHaveValue("all");
  await similar.getByLabel("Catégorie").selectOption("all");
  await similar.getByLabel("Prix max.").fill("100000");
  await similar.getByRole("button", { name: "Filtrer" }).click();
  await expect(page).toHaveURL(/categorie=all/);
  await expect(similar.getByTestId("product-card").first()).toBeVisible();
  await page.goto(`${page.url().split("?")[0]}?max=1`);
  await expect(page.getByText("Aucun produit similaire avec ces filtres.")).toBeVisible();
});

test("une fiche inconnue renvoie une page 404", async ({ page }) => {
  const res = await page.goto("/fr/shop/inconnu");
  expect(res?.status()).toBe(404);
});

test("un vendeur ajoute puis supprime un produit avec photo, visible dans le shop (SHP-01)", async ({ page }) => {
  const name = `Produit test ${Date.now()}`;
  await loginAs(page, "+237690000005");
  await page.goto("/fr/espace/produits");
  await expect(page.getByRole("heading", { name: "Mes produits", level: 1 })).toBeVisible();
  await page.getByLabel("Nom du produit").fill(name);
  await page.getByLabel("Prix (FCFA)").first().fill("7500");
  await page.getByLabel(/^Photo/).setInputFiles({ name: "photo.png", mimeType: "image/png", buffer: PNG });
  await page.getByRole("button", { name: "Ajouter", exact: true }).click();
  await expect(page.getByText("Produit ajouté.")).toBeVisible();
  await expect(page.getByTestId("my-product").filter({ hasText: name })).toBeVisible();

  await page.goto(`/fr/shop?q=${encodeURIComponent(name)}`);
  const card = page.getByTestId("product-card").filter({ hasText: name });
  await expect(card).toBeVisible();
  await expect(card.getByText("7 500 F")).toBeVisible();
  const src = await card.locator("img").getAttribute("src");
  expect(src).toContain("/api/files/products/");
  expect((await page.request.get(src!)).status()).toBe(200);

  await page.goto("/fr/espace/produits");
  page.once("dialog", (d) => d.accept());
  await page.getByTestId("my-product").filter({ hasText: name }).getByRole("button", { name: "Supprimer" }).click();
  await expect(page.getByTestId("my-product").filter({ hasText: name })).toHaveCount(0);
});

test("un fichier qui n'est pas une image est refusé", async ({ page }) => {
  await loginAs(page, "+237690000005");
  await page.goto("/fr/espace/produits");
  await page.getByLabel("Nom du produit").fill("Faux produit");
  await page.getByLabel("Prix (FCFA)").first().fill("100");
  await page.getByLabel(/^Photo/).setInputFiles({ name: "x.png", mimeType: "image/png", buffer: Buffer.from("<script>alert(1)</script>") });
  await page.getByRole("button", { name: "Ajouter", exact: true }).click();
  await expect(page.getByText(/Photo non reconnue/)).toBeVisible();
});

test("la page produits d'un vendeur est réservée aux vendeurs connectés", async ({ page }) => {
  await page.goto("/fr/espace/produits");
  await expect(page).not.toHaveURL(/\/espace\/produits/);
  const res = await page.request.post("/api/seller/products", { multipart: { name: "x", price: "1" } });
  expect(res.status()).toBe(403);
});
