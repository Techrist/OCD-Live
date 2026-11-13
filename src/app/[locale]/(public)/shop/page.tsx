import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, BadgeCheck, MapPin, MessageCircle, ShieldCheck, Store } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProductCard, productImage } from "@/components/shop/product-card";
import { ShopFilterForm } from "@/components/shop/filter-form";
import { CategoryIcon } from "@/components/ui/category-icon";
import { Flag } from "@/components/ui/flag";
import { Link } from "@/i18n/navigation";
import { parseShopFilters, shopQuery } from "@/lib/shop";
import { getCategories, getCountries } from "@/server/services/catalog";
import { categoryCounts, listProducts, shopFacets, topShops } from "@/server/services/shop";

export const dynamic = "force-dynamic";

const PAGE = 12;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const t = await getTranslations({ locale: (await params).locale, namespace: "shop" });
  return { title: t("title"), description: t("subtitle") };
}

/** SHP-04 : catalogue public, navigable par pays, ville, catégorie et prix. La commande passe par WhatsApp. */
export default async function ShopPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("shop");
  const sp = await searchParams;
  const filters = parseShopFilters(sp);
  const pages = Math.min(10, Math.max(1, Number(Array.isArray(sp.n) ? sp.n[0] : sp.n) || 1));
  const active = Object.values(filters).some((v) => v !== undefined);

  const [products, facets, countries, categories, counts] = await Promise.all([
    listProducts(filters, PAGE * pages + 1),
    shopFacets(),
    getCountries(),
    getCategories(),
    categoryCounts(),
  ]);
  const hasMore = products.length > PAGE * pages;
  const shown = products.slice(0, PAGE * pages);
  const countryOptions = countries.filter((c) => facets.countries.includes(c.code) || c.code === filters.country);
  const categoryOptions = categories.filter((c) => facets.categories.includes(c.id) || c.slug === filters.category);

  // Sections éditoriales : seulement quand aucun filtre n'est actif.
  const [fresh, cheap, shops] = active ? [[], [], []] : await Promise.all([listProducts({}, 5), listProducts({ max: 5000 }, 5), topShops(6)]);
  const ranked = categories.map((c) => ({ ...c, n: counts.get(c.id) ?? 0 })).sort((a, b) => b.n - a.n);
  const featured = fresh[0];

  return (
    <div className="flex w-full flex-col">
      {!active && (
        <section aria-label={t("hero.label")} className="band grid gap-4 pt-6 pb-10 md:grid-cols-3 md:pt-10">
          <div className="relative flex min-h-72 flex-col justify-center gap-3 overflow-hidden rounded-3xl bg-[image:var(--hero)] p-7 text-white md:col-span-2 md:min-h-80 md:p-10">
            <p className="w-fit rounded-full bg-white/20 px-3 py-1 text-sm font-bold">{t("hero.eyebrow")}</p>
            <h1 className="max-w-md text-[2.2rem] leading-[1.05] md:text-6xl">{t("title")}</h1>
            <p className="max-w-sm text-lg font-semibold">{t("hero.text")}</p>
            <a href="#catalogue" className="mt-2 flex min-h-14 w-fit items-center gap-2 rounded-2xl bg-white px-7 text-lg font-bold text-copper-800">{t("hero.cta")} <ArrowRight aria-hidden="true" className="size-5" /></a>
            {featured && (
              <Link href={`/shop/${featured.id}`} aria-label={featured.name} className="absolute -right-6 -bottom-6 hidden size-64 rotate-6 overflow-hidden rounded-3xl border-4 border-white shadow-2xl md:block">
                <Image src={productImage(featured)} alt="" fill sizes="256px" className="object-cover" unoptimized={!!featured.photoUrl} />
              </Link>
            )}
          </div>
          <div className="grid gap-4">
            <div className="flex flex-col justify-center gap-2 rounded-3xl bg-ink p-6 text-white">
              <h2 className="text-2xl">{t("hero.sellTitle")}</h2>
              <p className="font-semibold text-white/80">{t("hero.sellText")}</p>
              <Link href="/espace/produits" className="grad-btn mt-1 flex min-h-12 w-fit items-center rounded-2xl px-6 font-bold">{t("hero.sellCta")}</Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {ranked.slice(0, 2).map((c) => (
                <Link key={c.id} href={`/shop${shopQuery({ category: c.slug })}#catalogue`} className="relative flex min-h-32 flex-col justify-end overflow-hidden rounded-3xl p-4 text-white">
                  <Image src={`/images/cat-${c.slug}.webp`} alt="" fill sizes="25vw" className="object-cover" />
                  <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
                  <span className="relative text-lg leading-tight font-bold">{c.name}</span>
                  <span className="relative text-sm font-semibold">{t("sections.items", { count: c.n })}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {active && (
        <header className="band flex flex-col gap-2 pt-10 pb-4 md:pt-14">
          <h1 className="text-[2rem] leading-tight font-bold md:text-5xl">{t("title")}</h1>
          <p className="max-w-2xl text-lg text-ink/80">{t("subtitle")}</p>
        </header>
      )}

      {!active && fresh.length > 0 && (
        <section aria-labelledby="fresh" className="band flex flex-col gap-6 bg-ink py-12 text-white md:py-16">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="fresh" className="text-3xl">{t("sections.freshTitle")}</h2>
              <p className="text-white/70">{t("sections.freshSub")}</p>
            </div>
            <ul className="flex flex-wrap gap-2" aria-label={t("sections.byCategory")}>
              {ranked.filter((c) => c.n > 0).slice(0, 5).map((c) => (
                <li key={c.id}><Link href={`/shop${shopQuery({ category: c.slug })}#catalogue`} className="inline-flex min-h-10 items-center rounded-full border border-white/30 px-4 text-sm font-bold hover:bg-white/10">{c.name}</Link></li>
              ))}
            </ul>
          </div>
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            {fresh.map((p) => <ProductCard key={p.id} product={p} />)}
          </ul>
        </section>
      )}

      {!active && (
        <section aria-labelledby="cats" className="band flex flex-col gap-8 bg-white py-12 md:py-16">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-2 text-center">
            <h2 id="cats" className="text-3xl">{t("sections.byCategory")}</h2>
            <p className="text-lg text-ink/70">{t("sections.byCategorySub")}</p>
          </div>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {ranked.map((c) => (
              <li key={c.id}>
                <Link href={`/shop${shopQuery({ category: c.slug })}#catalogue`} className="flex h-full flex-col items-center gap-2 rounded-3xl border border-ink/10 p-4 text-center transition hover:border-copper hover:shadow-md">
                  <span aria-hidden="true" className="grid size-16 place-items-center rounded-full bg-amber-soft text-copper-800"><CategoryIcon name={c.icon} className="size-8" /></span>
                  <span className="font-bold">{c.name}</span>
                  <span className="text-sm font-semibold text-ink/60">{t("sections.items", { count: c.n })}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section id="catalogue" aria-labelledby="catalogue-title" className={`band flex scroll-mt-24 flex-col gap-6 py-12 md:py-16 ${active ? "bg-white" : "bg-[#fffaf2]"}`}>
        <div className="flex flex-col gap-1">
          <h2 id="catalogue-title" className="text-3xl">{t("sections.popular")}</h2>
          {!active && <p className="text-lg text-ink/70">{t("sections.popularSub")}</p>}
        </div>
        <ShopFilterForm
          filters={filters}
          countries={countryOptions.map((c) => ({ code: c.code, name: c.name }))}
          categories={categoryOptions.map((c) => ({ slug: c.slug, name: c.name }))}
          cities={facets.cities}
          active={active}
        />
        <p className="font-bold text-ink/70" aria-live="polite">{t("count", { count: shown.length })}</p>
        {shown.length === 0 ? (
          <div className="soft flex flex-col items-start gap-3 rounded-3xl p-6">
            <p className="font-semibold">{t("empty")}</p>
            <Link href="/espace/produits" className="font-bold text-copper-800 underline">{t("sellCta")} →</Link>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {shown.map((p) => <ProductCard key={p.id} product={p} />)}
          </ul>
        )}
        {hasMore && (
          <Link href={`/shop${shopQuery(filters)}${shopQuery(filters) ? "&" : "?"}n=${pages + 1}#catalogue`} scroll={false} className="mx-auto flex min-h-14 items-center rounded-2xl border-2 border-copper px-8 text-lg font-bold text-copper-800">{t("sections.more")}</Link>
        )}
      </section>

      {!active && cheap.length > 0 && (
        <section aria-labelledby="cheap" className="band flex flex-col gap-6 bg-white py-12 md:py-16">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="cheap" className="text-3xl">{t("sections.cheapTitle")}</h2>
              <p className="text-ink/70">{t("sections.cheapSub")}</p>
            </div>
            <Link href={`/shop${shopQuery({ max: 5000 })}#catalogue`} className="font-bold text-copper-800 underline">{t("sections.seeAll")} →</Link>
          </div>
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            {cheap.map((p) => <ProductCard key={p.id} product={p} />)}
          </ul>
        </section>
      )}

      {!active && shops.length > 0 && (
        <section aria-labelledby="shops" className="band flex flex-col gap-8 bg-[#fffaf2] py-12 md:py-16">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-2 text-center">
            <h2 id="shops" className="text-3xl">{t("sections.shopsTitle")}</h2>
            <p className="text-lg text-ink/70">{t("sections.shopsSub")}</p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shops.map((s) => (
              <li key={s.slug}>
                <Link href={`/v/${s.slug}`} className="flex items-center gap-4 rounded-3xl border border-ink/10 bg-white p-4 transition hover:border-copper hover:shadow-md">
                  <span aria-hidden="true" className="grid size-14 shrink-0 place-items-center rounded-full grad-btn"><CategoryIcon name={s.icon} className="size-7" /></span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="flex items-center gap-1 truncate text-lg font-bold">{s.shop}{s.verified && <BadgeCheck aria-label={t("verified")} className="size-4 shrink-0 text-copper-800" />}</span>
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-ink/70">
                      {s.countryCode && <Flag code={s.countryCode} className="h-3.5 w-5 rounded-sm ring-1 ring-ink/30" />}
                      {s.city && <><MapPin aria-hidden="true" className="size-3.5" />{s.city}</>}
                    </span>
                    <span className="text-sm font-bold text-copper-800">{t("sections.items", { count: s.count })}</span>
                  </span>
                  <ArrowRight aria-hidden="true" className="size-5 shrink-0 text-ink/40" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-label={t("sections.reassure")} className="band grid gap-4 bg-white py-12 md:grid-cols-3 md:py-16">
        {([
          { key: "wa", icon: MessageCircle },
          { key: "verified", icon: ShieldCheck },
          { key: "direct", icon: Store },
        ] as const).map(({ key, icon: Icon }) => (
          <div key={key} className="flex items-start gap-4 rounded-3xl bg-amber-soft/50 p-5">
            <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-full grad-btn"><Icon className="size-6" /></span>
            <div>
              <h3 className="text-lg font-bold">{t(`sections.reassureItems.${key}.title`)}</h3>
              <p className="font-semibold text-ink/70">{t(`sections.reassureItems.${key}.text`)}</p>
            </div>
          </div>
        ))}
      </section>
      <p className="band bg-white pb-10 text-sm font-semibold text-ink/60">{t("note")}</p>
    </div>
  );
}
