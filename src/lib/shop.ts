// Logique pure du shop (SHP-02, SHP-04) : filtres de navigation et message WhatsApp prérempli.

export type ShopFilters = { country?: string; city?: string; category?: string; min?: number; max?: number; q?: string };

type Params = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
const amount = (v: string | undefined) => {
  if (!v) return undefined;
  const n = Number(v.replace(/\s/g, ""));
  return Number.isFinite(n) && n >= 0 && n <= 100_000_000 ? Math.floor(n) : undefined;
};

/** Lit les filtres de l'URL (pays, ville, catégorie, prix, recherche) en ignorant les valeurs invalides. */
export function parseShopFilters(sp: Params): ShopFilters {
  const country = first(sp.pays)?.toUpperCase();
  let min = amount(first(sp.min));
  let max = amount(first(sp.max));
  if (min !== undefined && max !== undefined && min > max) [min, max] = [max, min];
  return {
    country: country && /^[A-Z]{2}$/.test(country) ? country : undefined,
    city: first(sp.ville)?.slice(0, 60),
    category: first(sp.categorie)?.slice(0, 40),
    min,
    max,
    q: first(sp.q)?.slice(0, 60),
  };
}

/** Adresse de la page /shop avec les filtres actifs (les valeurs vides sont omises). */
export function shopQuery(f: ShopFilters): string {
  const p = new URLSearchParams();
  if (f.country) p.set("pays", f.country);
  if (f.city) p.set("ville", f.city);
  if (f.category) p.set("categorie", f.category);
  if (f.min !== undefined) p.set("min", String(f.min));
  if (f.max !== undefined) p.set("max", String(f.max));
  if (f.q) p.set("q", f.q);
  const s = p.toString();
  return s ? `?${s}` : "";
}

/** Lien de commande : ouvre WhatsApp chez le vendeur avec le produit, la quantité et le prix (aucun paiement sur le site). */
export function orderHref(sellerId: string, message: string): string {
  return `/api/go?t=wa&id=${encodeURIComponent(sellerId)}&m=${encodeURIComponent(message.slice(0, 300))}`;
}

/** Quantité commandable : au moins 1, au plus le stock indicatif s'il existe (sinon 99). */
export function clampQuantity(qty: number, stock: number | null | undefined): number {
  const max = stock && stock > 0 ? Math.min(stock, 99) : 99;
  return Math.min(max, Math.max(1, Math.floor(Number.isFinite(qty) ? qty : 1)));
}
