import "dotenv/config";
import { Client } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

async function dbReachable() {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await c.connect();
    const r = await c.query('SELECT 1 FROM "Category" LIMIT 1');
    return (r.rowCount ?? 0) > 0;
  } catch {
    return false;
  } finally {
    await c.end().catch(() => {});
  }
}
const reachable = await dbReachable();

const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(32)]);

describe.skipIf(!reachable)("OCD Shop V2 : catalogue, filtres, fiche live (SHP-01 à SHP-04)", () => {
  let db: typeof import("@/server/db").db;
  let shop: typeof import("@/server/services/shop");
  const stamp = String(Date.now());
  const made: string[] = [];
  let sellerA = "";
  let sellerB = "";
  let categories: { id: string; slug: string }[] = [];

  async function newSeller(phone: string, countryCode: string, city: string, categoryId: string) {
    const u = await db.user.create({ data: { phone, role: "SELLER", name: "Shop Test", countryCode, city } });
    made.push(u.id);
    await db.sellerProfile.create({ data: { userId: u.id, slug: `shop-test-${u.id.slice(-8)}`, shopName: "Boutique Shop", activity: "Test", categoryId } });
    return u.id;
  }

  beforeAll(async () => {
    ({ db } = await import("@/server/db"));
    shop = await import("@/server/services/shop");
    categories = await db.category.findMany({ where: { active: true }, select: { id: true, slug: true }, take: 2, orderBy: { order: "asc" } });
    sellerA = await newSeller(`+${stamp.slice(-11)}`, "CM", "ZzDouala", categories[0].id);
    sellerB = await newSeller(`+${stamp.slice(-10)}0`, "TG", "ZzLomé", categories[1].id);
  });

  afterAll(async () => {
    if (!reachable) return;
    const products = await db.product.findMany({ where: { sellerId: { in: made } } });
    for (const p of products) await shop.deleteProduct(p.sellerId, p.id);
    await db.sellerProfile.deleteMany({ where: { userId: { in: made } } });
    await db.user.deleteMany({ where: { id: { in: made } } });
  });

  it("crée un produit avec photo, le catégorise par défaut selon le profil", async () => {
    const res = await shop.createProduct(sellerA, { name: "Robe Zz", price: 12000, stock: 5 }, PNG);
    expect(res.ok).toBe(true);
    const [p] = await shop.productsOfSeller(sellerA);
    expect(p.photoUrl).toMatch(/^\/api\/files\/products\/[a-z0-9]+\.png$/);
    expect(p.category.id).toBe(categories[0].id);
  });

  it("refuse une photo qui n'est pas une image, trop lourde, ou une catégorie inconnue", async () => {
    expect(await shop.createProduct(sellerA, { name: "Faux", price: 1 }, Buffer.from("<script>alert(1)</script>"))).toEqual({ ok: false, reason: "INVALID_IMAGE" });
    expect(await shop.createProduct(sellerA, { name: "Gros", price: 1 }, Buffer.concat([PNG, Buffer.alloc(shop.MAX_PHOTO_BYTES)]))).toEqual({ ok: false, reason: "TOO_BIG" });
    expect(await shop.createProduct(sellerA, { name: "Cat", price: 1, categoryId: "inconnue" })).toEqual({ ok: false, reason: "INVALID_CATEGORY" });
    expect((await shop.productsOfSeller(sellerA)).map((p) => p.name)).toEqual(["Robe Zz"]);
  });

  it("filtre par pays, ville, catégorie, prix et nom ; masque les produits inactifs", async () => {
    await shop.createProduct(sellerB, { name: "Sac Zz", price: 30000 });
    const all = await shop.listProducts({ q: "Zz" });
    expect(all.map((p) => p.name).sort()).toEqual(["Robe Zz", "Sac Zz"]);
    expect((await shop.listProducts({ q: "Zz", country: "TG" })).map((p) => p.name)).toEqual(["Sac Zz"]);
    expect((await shop.listProducts({ q: "Zz", city: "zzdouala" })).map((p) => p.name)).toEqual(["Robe Zz"]);
    expect((await shop.listProducts({ q: "Zz", category: categories[1].slug })).map((p) => p.name)).toEqual(["Sac Zz"]);
    expect((await shop.listProducts({ q: "Zz", min: 20000 })).map((p) => p.name)).toEqual(["Sac Zz"]);
    expect((await shop.listProducts({ q: "Zz", max: 20000 })).map((p) => p.name)).toEqual(["Robe Zz"]);

    const [sac] = await shop.productsOfSeller(sellerB);
    await shop.updateProduct(sellerB, sac.id, { active: false });
    expect((await shop.listProducts({ q: "Zz", country: "TG" }))).toHaveLength(0);
    expect((await shop.productsOfSeller(sellerB, { onlyActive: true }))).toHaveLength(0);
  });

  it("un vendeur ne peut modifier ni supprimer le produit d'un autre", async () => {
    const [robe] = await shop.productsOfSeller(sellerA);
    expect((await shop.updateProduct(sellerB, robe.id, { price: 1 })).ok).toBe(false);
    expect((await shop.deleteProduct(sellerB, robe.id)).ok).toBe(false);
    expect((await shop.productsOfSeller(sellerA))[0].price).toBe(12000);
  });

  it("la fiche du live alimente la vitrine sans doublon (SHP-03)", async () => {
    const first = await shop.syncProductsFromSheet(sellerA, [{ name: "Pagne Zz", price: 5000, quantity: 10 }, { name: "robe zz", price: 13000, quantity: 3 }]);
    expect(first).toEqual({ created: 1, updated: 1 });
    const again = await shop.syncProductsFromSheet(sellerA, [{ name: "Pagne Zz", price: 5500, quantity: 8 }]);
    expect(again).toEqual({ created: 0, updated: 1 });
    const mine = await shop.productsOfSeller(sellerA);
    expect(mine.map((p) => p.name).sort()).toEqual(["Pagne Zz", "Robe Zz"]);
    expect(mine.find((p) => p.name === "Robe Zz")).toMatchObject({ price: 13000, stock: 3 });
    expect(mine.find((p) => p.name === "Pagne Zz")).toMatchObject({ price: 5500, stock: 8 });
  });

  it("limite le catalogue à 50 produits par vendeur", async () => {
    const category = categories[0].id;
    const have = await db.product.count({ where: { sellerId: sellerA } });
    await db.product.createMany({ data: Array.from({ length: shop.MAX_PRODUCTS - have }, (_, i) => ({ sellerId: sellerA, categoryId: category, name: `Lot ${i}`, price: 100 })) });
    expect(await shop.createProduct(sellerA, { name: "En trop", price: 1 })).toEqual({ ok: false, reason: "LIMIT" });
    const sync = await shop.syncProductsFromSheet(sellerA, [{ name: "Aussi en trop", price: 1, quantity: 1 }]);
    expect(sync.created).toBe(0);
  });

  it("supprime le produit et sa photo", async () => {
    const [robe] = await shop.productsOfSeller(sellerA);
    expect((await shop.deleteProduct(sellerA, robe.id)).ok).toBe(true);
    expect(await db.product.findUnique({ where: { id: robe.id } })).toBeNull();
  });
});
