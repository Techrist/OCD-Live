import type { Metadata } from "next";
import Image from "next/image";
import { BadgeCheck, MapPin, MessageCircle, Package, Play, Tag } from "lucide-react";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProductCard } from "@/components/shop/product-card";
import { CategoryIcon } from "@/components/ui/category-icon";
import { Flag } from "@/components/ui/flag";
import { ViewBeacon } from "@/components/view-beacon";
import { Link } from "@/i18n/navigation";
import { liveImage } from "@/lib/live-image";
import { db } from "@/server/db";
import { publishedWhere } from "@/server/services/directory";
import { productsOfSeller } from "@/server/services/shop";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await db.sellerProfile.findUnique({ where: { slug: (await params).slug } });
  return { title: p?.shopName ?? "OCD Live", description: p?.description ?? p?.activity };
}

/** ANN-12 : vitrine permanente du vendeur, même hors live. Compte une vue par visiteur et par jour (ANN-16). */
export default async function ShowcasePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const profile = await db.sellerProfile.findUnique({
    where: { slug },
    include: { category: true, user: { select: { id: true, city: true, countryCode: true, country: { select: { name: true } } } } },
  });
  if (!profile) notFound();
  const [t, ts, products, live] = await Promise.all([
    getTranslations("showcase"),
    getTranslations("shop"),
    productsOfSeller(profile.userId, { onlyActive: true }),
    db.liveSubmission.findFirst({ where: { sellerId: profile.userId, ...publishedWhere(new Date()) }, orderBy: { publishedAt: "desc" } }),
  ]);
  const place = [profile.user.city, profile.user.country?.name].filter(Boolean).join(", ");
  const cover = `/images/cat-${profile.category.slug}.webp`;
  const preview = liveImage({ profilePhoto: profile.photoUrl, productPhotoKey: null, categorySlug: profile.category.slug });
  const waHref = `/api/go?t=wa&id=${profile.userId}&m=${encodeURIComponent(t("waMessage", { shop: profile.shopName }))}`;

  return (
    <div className="flex w-full flex-col">
      <ViewBeacon slug={slug} />

      <header className="relative isolate overflow-hidden bg-[image:var(--hero)] text-white">
        <Image src={cover} alt="" fill priority sizes="100vw" className="-z-20 scale-110 object-cover opacity-40 blur-sm" />
        <span aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-[#7a3510]/70 to-[#b4541a]/60" />
        <div className="band flex flex-col items-start gap-5 pt-10 pb-12 md:flex-row md:items-end md:gap-8 md:pt-14 md:pb-14">
          {profile.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.photoUrl} alt={profile.shopName} className="size-28 shrink-0 rounded-full border-4 border-white object-cover shadow-xl md:size-36" />
          ) : (
            <span aria-hidden="true" className="grid size-28 shrink-0 place-items-center rounded-full border-4 border-white bg-white text-copper-800 shadow-xl md:size-36"><CategoryIcon name={profile.category.icon} className="size-14 md:size-16" /></span>
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-sm font-bold text-copper-800"><CategoryIcon name={profile.category.icon} className="size-4" /> {profile.category.name}</span>
              {profile.verified && <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-sm font-bold text-copper-800"><BadgeCheck aria-hidden="true" className="size-4" /> {t("verified")}</span>}
              {live && <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-sm font-bold"><span aria-hidden="true" className="size-2 animate-pulse rounded-full bg-white" /> {t("liveBadge")}</span>}
            </div>
            <h1 className="text-[2.2rem] leading-[1.05] text-white md:text-6xl">{profile.shopName}</h1>
            <p className="max-w-2xl text-lg font-semibold text-white/90">{profile.activity}</p>
            {place && (
              <p className="flex items-center gap-2 font-bold text-white/90">
                {profile.user.countryCode && <Flag code={profile.user.countryCode} className="h-4 w-6 rounded-sm ring-1 ring-white/50" />}
                <MapPin aria-hidden="true" className="size-4" /> {place}
              </p>
            )}
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row md:flex-col lg:flex-row">
            {live && (
              <a href={`/api/go?t=live&id=${live.id}`} target="_blank" rel="noopener noreferrer" className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-white px-6 text-lg font-bold text-copper-800">
                <Play aria-hidden="true" className="size-5" /> {t("watch")}
              </a>
            )}
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-wa px-6 text-lg font-bold text-white">
              <MessageCircle aria-hidden="true" className="size-5" /> {t("contact")}
            </a>
          </div>
        </div>
      </header>

      <section aria-label={t("figures")} className="band grid grid-cols-2 gap-3 bg-white py-6 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-2xl bg-amber-soft/50 p-4">
          <Package aria-hidden="true" className="size-6 text-copper-800" />
          <span className="flex flex-col"><span className="text-2xl leading-none font-bold">{products.length}</span><span className="text-sm font-semibold text-ink/70">{t("productsCount")}</span></span>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-amber-soft/50 p-4">
          <Tag aria-hidden="true" className="size-6 text-copper-800" />
          <span className="flex flex-col"><span className="text-lg leading-tight font-bold">{profile.category.name}</span><span className="text-sm font-semibold text-ink/70">{t("category")}</span></span>
        </div>
        <div className="col-span-2 flex items-center gap-3 rounded-2xl bg-amber-soft/50 p-4 sm:col-span-1">
          <span aria-hidden="true" className={`size-3 rounded-full ${live ? "animate-pulse bg-red-600" : "bg-ink/30"}`} />
          <span className="flex flex-col"><span className="text-lg leading-tight font-bold">{live ? t("liveNow") : t("noLive")}</span><span className="text-sm font-semibold text-ink/70">{t("status")}</span></span>
        </div>
      </section>

      {(profile.description || live) && (
        <section aria-labelledby="about" className={`band grid gap-8 bg-white pb-12 md:items-start ${profile.description && live ? "md:grid-cols-2" : "md:grid-cols-1"}`}>
          {profile.description && (
            <div className="flex flex-col gap-3">
              <h2 id="about" className="text-3xl">{t("about")}</h2>
              <p className="text-lg leading-relaxed text-ink/80">{profile.description}</p>
            </div>
          )}
          {live && (
            <a href={`/api/go?t=live&id=${live.id}`} target="_blank" rel="noopener noreferrer" aria-label={t("watch")} className="group relative block aspect-video w-full max-w-3xl overflow-hidden rounded-3xl bg-amber-soft shadow-lg">
              <Image src={preview.src} alt="" fill sizes="(min-width: 768px) 36rem, 100vw" className="object-cover transition duration-300 group-hover:scale-105" unoptimized={preview.src.startsWith("/api/files/")} />
              <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-ink/10" />
              <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-sm font-bold text-white"><span aria-hidden="true" className="size-2 animate-pulse rounded-full bg-white" /> {t("liveBadge")}</span>
              <span aria-hidden="true" className="absolute right-4 bottom-4 grid size-16 place-items-center rounded-full bg-white/95 text-copper-800 shadow-lg transition group-hover:scale-110"><Play className="size-8 translate-x-0.5" /></span>
            </a>
          )}
        </section>
      )}

      <section aria-labelledby="products" className="band flex flex-col gap-6 bg-[#fffaf2] py-12 md:py-16">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="products" className="text-3xl">{ts("title")}</h2>
            <p className="text-lg text-ink/70">{t("productsSub", { shop: profile.shopName })}</p>
          </div>
          <Link href="/shop" className="font-bold text-copper-800 underline">{t("allShop")} →</Link>
        </div>
        {products.length === 0 ? (
          <p className="soft rounded-3xl p-6 font-semibold">{t("noProducts")}</p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {products.map((p) => <ProductCard key={p.id} product={p} showSeller={false} />)}
          </ul>
        )}
      </section>

      <section aria-label={t("contactTitle")} className="band flex flex-col items-center gap-4 bg-[image:var(--hero)] py-14 text-center text-white">
        <h2 className="text-3xl text-white md:text-4xl">{t("contactTitle", { shop: profile.shopName })}</h2>
        <p className="max-w-xl text-lg font-semibold text-white/90">{t("contactText")}</p>
        <a href={waHref} target="_blank" rel="noopener noreferrer" className="flex min-h-14 items-center gap-2 rounded-2xl bg-white px-8 text-lg font-bold text-copper-800">
          <MessageCircle aria-hidden="true" className="size-5" /> {t("contact")}
        </a>
      </section>
    </div>
  );
}
