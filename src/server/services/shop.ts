import "server-only";
import { z } from "zod";
import { getStorage, sniffImage } from "@/server/adapters/storage";
import { db } from "@/server/db";
import type { ShopFilters } from "@/lib/shop";

// OCD Shop, version simple (V2) : catalogue par vendeur, navigation publique, commande par WhatsApp (aucun paiement sur le site).

export const MAX_PRODUCTS = 50;
export const MAX_PHOTO_BYTES = 3 * 1024 * 1024;

const include = {
  category: { select: { id: true, slug: true, name: true, icon: true } },
  seller: { select: { id: true, city: true, countryCode: true, sellerProfile: { select: { shopName: true, slug: true, verified: true } } } },
} as const;

export type ShopProduct = {
  id: string;
  name: string;
  price: number;
  currency: string;
  stock: number | null;
  active: boolean;
  photoUrl: string | null;
  category: { id: string; slug: string; name: string; icon: string };
  seller: { id: string; city: string | null; countryCode: string | null; shop: string; slug: string | null; verified: boolean };
};

type Row = Awaited<ReturnType<typeof listRows>>[number];

async function toProduct(r: Row): Promise<ShopProduct> {
  return {
    id: r.id,
    name: r.name,
    price: r.price,
    currency: r.currency,
    stock: r.stock,
    active: r.active,
    photoUrl: r.photoKey ? (r.photoKey.startsWith("/") ? r.photoKey : await getStorage().getUrl(r.photoKey)) : null,
    category: r.category,
    seller: {
      id: r.seller.id,
      city: r.seller.city,
      countryCode: r.seller.countryCode,
      shop: r.seller.sellerProfile?.shopName ?? "—",
      slug: r.seller.sellerProfile?.slug ?? null,
      verified: !!r.seller.sellerProfile?.verified,
    },
  };
}

function listRows(where: object, take: number) {
  return db.product.findMany({ where, orderBy: { createdAt: "desc" }, take, include });
}

/** SHP-04 : navigation par pays, ville, catégorie et prix (produits actifs de vendeurs ayant un profil). */
export async function listProducts(f: ShopFilters = {}, take = 48, excludeId?: string): Promise<ShopProduct[]> {
  const seller: Record<string, unknown> = { sellerProfile: { isNot: null } };
  if (f.country) seller.countryCode = f.country;
  if (f.city) seller.city = { contains: f.city, mode: "insensitive" };
  const rows = await listRows(
    {
      active: true,
      ...(excludeId ? { id: { not: excludeId } } : {}),
      seller,
      ...(f.category ? { category: { OR: [{ slug: f.category }, { id: f.category }] } } : {}),
      ...(f.min !== undefined || f.max !== undefined ? { price: { ...(f.min !== undefined ? { gte: f.min } : {}), ...(f.max !== undefined ? { lte: f.max } : {}) } } : {}),
      ...(f.q ? { name: { contains: f.q, mode: "insensitive" } } : {}),
    },
    take,
  );
  return Promise.all(rows.map(toProduct));
}

export async function productsOfSeller(sellerId: string, opts: { onlyActive?: boolean } = {}): Promise<ShopProduct[]> {
  const rows = await listRows({ sellerId, ...(opts.onlyActive ? { active: true } : {}) }, MAX_PRODUCTS);
  return Promise.all(rows.map(toProduct));
}

/** Pays, villes et catégories qui ont au moins un produit (pour les filtres). */
export async function shopFacets() {
  const rows = await db.product.findMany({
    where: { active: true, seller: { sellerProfile: { isNot: null } } },
    select: { categoryId: true, seller: { select: { city: true, countryCode: true } } },
  });
  const countries = new Set<string>();
  const cities = new Set<string>();
  const categories = new Set<string>();
  for (const r of rows) {
    if (r.seller.countryCode) countries.add(r.seller.countryCode);
    if (r.seller.city) cities.add(r.seller.city);
    categories.add(r.categoryId);
  }
  return { countries: [...countries], cities: [...cities].sort(), categories: [...categories] };
}

export const productInput = z.object({
  name: z.string().trim().min(1).max(80),
  price: z.coerce.number().int().min(0).max(100_000_000),
  stock: z.preprocess((v) => (v === "" || v === null || v === undefined ? undefined : v), z.coerce.number().int().min(0).max(100_000).optional()),
  categoryId: z.string().min(1).optional(),
});

export type CreateResult =
  | { ok: true; id: string }
  | { ok: false; reason: "NO_PROFILE" | "LIMIT" | "INVALID_CATEGORY" | "INVALID_IMAGE" | "TOO_BIG" };

/** SHP-01 : ajout d'un produit en 3 champs (nom, prix, photo) ; stock indicatif et catégorie facultatifs. */
export async function createProduct(sellerId: string, input: z.infer<typeof productInput>, photo?: Buffer): Promise<CreateResult> {
  const profile = await db.sellerProfile.findUnique({ where: { userId: sellerId } });
  if (!profile) return { ok: false, reason: "NO_PROFILE" };
  if ((await db.product.count({ where: { sellerId } })) >= MAX_PRODUCTS) return { ok: false, reason: "LIMIT" };
  const categoryId = input.categoryId ?? profile.categoryId;
  if (!(await db.category.findFirst({ where: { id: categoryId, active: true } }))) return { ok: false, reason: "INVALID_CATEGORY" };

  let image: ReturnType<typeof sniffImage> = null;
  if (photo && photo.length > 0) {
    if (photo.length > MAX_PHOTO_BYTES) return { ok: false, reason: "TOO_BIG" };
    image = sniffImage(photo);
    if (!image) return { ok: false, reason: "INVALID_IMAGE" };
  }
  const product = await db.product.create({ data: { sellerId, name: input.name, price: input.price, stock: input.stock ?? null, categoryId } });
  if (photo && image) {
    const photoKey = `products/${product.id.toLowerCase()}.${image.ext}`;
    await getStorage().put(photoKey, photo, image.contentType);
    await db.product.update({ where: { id: product.id }, data: { photoKey } });
  }
  return { ok: true, id: product.id };
}

export async function updateProduct(sellerId: string, id: string, patch: { name?: string; price?: number; stock?: number | null; active?: boolean }) {
  const res = await db.product.updateMany({ where: { id, sellerId }, data: patch });
  return { ok: res.count > 0 };
}

export async function deleteProduct(sellerId: string, id: string) {
  const product = await db.product.findFirst({ where: { id, sellerId } });
  if (!product) return { ok: false };
  await db.product.delete({ where: { id } });
  if (product.photoKey && !product.photoKey.startsWith("/")) await getStorage().remove(product.photoKey).catch(() => {});
  return { ok: true };
}

/**
 * SHP-03 : les produits de la fiche du live (RES-11) alimentent automatiquement la vitrine.
 * Un produit déjà présent (même nom) est mis à jour au lieu d'être dupliqué.
 */
export async function syncProductsFromSheet(sellerId: string, products: { name: string; price: number; quantity: number }[]) {
  const profile = await db.sellerProfile.findUnique({ where: { userId: sellerId } });
  if (!profile || products.length === 0) return { created: 0, updated: 0 };
  let created = 0;
  let updated = 0;
  let count = await db.product.count({ where: { sellerId } });
  for (const p of products) {
    const existing = await db.product.findFirst({ where: { sellerId, name: { equals: p.name, mode: "insensitive" } } });
    if (existing) {
      await db.product.update({ where: { id: existing.id }, data: { price: p.price, stock: p.quantity, active: true } });
      updated++;
    } else if (count < MAX_PRODUCTS) {
      await db.product.create({ data: { sellerId, name: p.name, price: p.price, stock: p.quantity, categoryId: profile.categoryId } });
      count++;
      created++;
    }
  }
  return { created, updated };
}

/** Fiche d'un produit actif (page de détail). */
export async function getProduct(id: string): Promise<ShopProduct | null> {
  const row = await db.product.findFirst({ where: { id, active: true, seller: { sellerProfile: { isNot: null } } }, include });
  return row ? toProduct(row) : null;
}

/** Nombre de produits actifs par catégorie. */
export async function categoryCounts(): Promise<Map<string, number>> {
  const rows = await db.product.groupBy({ by: ["categoryId"], where: { active: true, seller: { sellerProfile: { isNot: null } } }, _count: { _all: true } });
  return new Map(rows.map((r) => [r.categoryId, r._count._all]));
}

/** Boutiques qui ont le plus de produits en ligne (section « vendeurs populaires »). */
export async function topShops(take = 6) {
  const rows = await db.product.groupBy({ by: ["sellerId"], where: { active: true, seller: { sellerProfile: { isNot: null } } }, _count: { _all: true }, orderBy: { _count: { sellerId: "desc" } }, take });
  const profiles = await db.sellerProfile.findMany({
    where: { userId: { in: rows.map((r) => r.sellerId) } },
    include: { category: { select: { icon: true } }, user: { select: { city: true, countryCode: true } } },
  });
  return rows.flatMap((r) => {
    const p = profiles.find((x) => x.userId === r.sellerId);
    return p ? [{ slug: p.slug, shop: p.shopName, verified: p.verified, icon: p.category.icon, city: p.user.city, countryCode: p.user.countryCode, count: r._count._all }] : [];
  });
}
