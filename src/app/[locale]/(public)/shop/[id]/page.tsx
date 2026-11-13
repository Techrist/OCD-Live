import type { Metadata } from "next";
import Image from "next/image";
import { BadgeCheck, ChevronRight, MapPin, MessageCircle, PackageCheck, Truck } from "lucide-react";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { OrderButton } from "@/components/shop/order-button";
import { ShopFilterForm } from "@/components/shop/filter-form";
import { ProductCard, productImage } from "@/components/shop/product-card";
import { Flag } from "@/components/ui/flag";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/format";
import { parseShopFilters } from "@/lib/shop";
import { getCategories, getCountries } from "@/server/services/catalog";
import { getProduct, listProducts, productsOfSeller, shopFacets } from "@/server/services/shop";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const p = await getProduct((await params).id);
  return { title: p ? `${p.name} · OCD Shop` : "OCD Shop", description: p ? `${p.name} — ${formatPrice(p.price)} · ${p.seller.shop}` : undefined };
}

/** Fiche d'un produit : photo, prix, vendeur, commande WhatsApp, autres produits de la boutique et produits similaires filtrables. */
export default async function ProductPage({ params, searchParams }: { params: Promise<{ locale: string; id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const product = await getProduct(id);
  if (!product) notFound();
  const t = await getTranslations("shop");
  const sp = await searchParams;

  // Produits similaires : par défaut la même catégorie ; « all » les ouvre à toutes les catégories (pays et prix au choix).
  const raw = parseShopFilters(sp);
  const category = raw.category === "all" ? undefined : (raw.category ?? product.category.slug);
  const filters = { ...raw, category };
  const touched = raw.country !== undefined || raw.min !== undefined || raw.max !== undefined || raw.category !== undefined;
  const [similar, facets, countries, categories, sellerProducts] = await Promise.all([
    listProducts(filters, 8, product.id),
    shopFacets(),
    getCountries(),
    getCategories(),
    productsOfSeller(product.seller.id, { onlyActive: true }),
  ]);
  const others = sellerProducts.filter((p) => p.id !== product.id).slice(0, 4);
  const soldOut = product.stock !== null && product.stock <= 0;
  const countryName = countries.find((c) => c.code === product.seller.countryCode)?.name;

  return (
    <div className="flex w-full flex-col">
      <nav aria-label={t("detail.breadcrumb")} className="band flex flex-wrap items-center gap-1 pt-6 pb-2 text-sm font-semibold text-ink/70">
        <Link href="/shop" className="hover:text-copper-800">{t("title")}</Link>
        <ChevronRight aria-hidden="true" className="size-4" />
        <Link href={`/shop?categorie=${product.category.slug}`} className="hover:text-copper-800">{product.category.name}</Link>
        <ChevronRight aria-hidden="true" className="size-4" />
        <span aria-current="page" className="text-ink">{product.name}</span>
      </nav>

      <section aria-labelledby="product-name" className="band grid gap-8 pt-4 pb-12 lg:grid-cols-2 lg:gap-12">
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-amber-soft">
          <Image src={productImage(product)} alt={product.photoUrl ? product.name : ""} fill priority sizes="(min-width: 1024px) 36rem, 100vw" className="object-cover" unoptimized={!!product.photoUrl} />
        </div>
        <div className="flex flex-col gap-5">
          <Link href={`/shop?categorie=${product.category.slug}`} className="w-fit rounded-full bg-amber-soft px-3 py-1 text-sm font-bold text-copper-800">{product.category.name}</Link>
          <h1 id="product-name" className="text-[2rem] leading-tight md:text-5xl">{product.name}</h1>
          <p className="text-4xl font-bold text-copper-800 tabular-nums" data-testid="product-price">{formatPrice(product.price)}</p>
          <p className={`flex items-center gap-2 font-bold ${soldOut ? "text-red-700" : "text-wa"}`}>
            <PackageCheck aria-hidden="true" className="size-5" />
            {soldOut ? t("soldOut") : product.stock !== null ? t("stock", { count: product.stock }) : t("detail.available")}
          </p>

          <div className="flex flex-col gap-2 rounded-3xl border border-ink/10 p-4">
            <p className="text-sm font-bold text-ink/60">{t("detail.soldBy")}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {product.seller.slug ? <Link href={`/v/${product.seller.slug}`} className="flex items-center gap-1 text-xl font-bold text-copper-800 underline">{product.seller.shop}{product.seller.verified && <BadgeCheck aria-label={t("verified")} className="size-5" />}</Link> : <span className="text-xl font-bold">{product.seller.shop}</span>}
              <span className="flex items-center gap-1.5 text-sm font-semibold text-ink/70">
                {product.seller.countryCode && <Flag code={product.seller.countryCode} className="h-4 w-6 rounded-sm ring-1 ring-ink/30" />}
                <MapPin aria-hidden="true" className="size-4" />{[product.seller.city, countryName].filter(Boolean).join(", ")}
              </span>
            </div>
          </div>

          <div className="flex max-w-sm flex-col gap-3">
            <OrderButton sellerId={product.seller.id} name={product.name} price={product.price} stock={product.stock} />
          </div>

          <ol className="grid gap-3 rounded-3xl bg-amber-soft/50 p-5" aria-label={t("detail.howTitle")}>
            <li className="text-lg font-bold">{t("detail.howTitle")}</li>
            {([MessageCircle, Truck, PackageCheck] as const).map((Icon, i) => (
              <li key={i} className="flex items-start gap-3">
                <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full grad-btn"><Icon className="size-5" /></span>
                <span className="font-semibold">{t(`detail.how${i + 1}`)}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {others.length > 0 && (
        <section aria-labelledby="others" className="band flex flex-col gap-6 bg-white py-12">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 id="others" className="text-3xl">{t("detail.others", { shop: product.seller.shop })}</h2>
            {product.seller.slug && <Link href={`/v/${product.seller.slug}`} className="font-bold text-copper-800 underline">{t("sections.viewShop")} →</Link>}
          </div>
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {others.map((p) => <ProductCard key={p.id} product={p} showSeller={false} />)}
          </ul>
        </section>
      )}

      <section id="similaires" aria-labelledby="similar" className="band flex scroll-mt-24 flex-col gap-6 bg-[#fffaf2] py-12 md:py-16">
        <div>
          <h2 id="similar" className="text-3xl">{t("detail.similar")}</h2>
          <p className="text-lg text-ink/70">{t("detail.similarSub")}</p>
        </div>
        <ShopFilterForm
          compact
          allValue="all"
          action={`/shop/${product.id}#similaires`}
          filters={{ ...filters, category: category ?? "all" }}
          countries={countries.filter((c) => facets.countries.includes(c.code) || c.code === raw.country).map((c) => ({ code: c.code, name: c.name }))}
          categories={categories.filter((c) => facets.categories.includes(c.id) || c.slug === category).map((c) => ({ slug: c.slug, name: c.name }))}
          active={touched}
        />
        {similar.length === 0 ? (
          <p className="soft rounded-3xl p-6 font-semibold">{t("detail.similarEmpty")}</p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {similar.map((p) => <ProductCard key={p.id} product={p} />)}
          </ul>
        )}
      </section>
    </div>
  );
}
