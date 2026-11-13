import type { Metadata } from "next";
import { BadgeCheck, MapPin, MessageCircle, Play } from "lucide-react";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CategoryIcon } from "@/components/ui/category-icon";
import { ProductCard } from "@/components/shop/product-card";
import { ViewBeacon } from "@/components/view-beacon";
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
    include: { category: true, user: { select: { id: true, city: true, country: { select: { name: true } } } } },
  });
  if (!profile) notFound();
  const [t, ts, products] = await Promise.all([getTranslations("showcase"), getTranslations("shop"), productsOfSeller(profile.userId, { onlyActive: true })]);
  const live =await db.liveSubmission.findFirst({ where: { sellerId: profile.userId, ...publishedWhere(new Date()) }, orderBy: { publishedAt: "desc" } });
  const where = [profile.user.city, profile.user.country?.name].filter(Boolean).join(", ");

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5 px-5 pt-2">
      <ViewBeacon slug={slug} />
      <section className="soft flex flex-col gap-3 rounded-[2.5rem] p-6">
        <span aria-hidden="true" className="grid size-16 place-items-center rounded-full grad-btn"><CategoryIcon name={profile.category.icon} className="size-8" /></span>
        <h1 className="text-[1.7rem] leading-tight font-semibold">{profile.shopName}</h1>
        {profile.verified && <p className="flex items-center gap-1 font-bold text-copper-800"><BadgeCheck aria-hidden="true" className="size-5" /> {t("verified")}</p>}
        <p className="font-semibold">{profile.activity}</p>
        {profile.description && <p className="leading-relaxed">{profile.description}</p>}
        {where && <p className="flex items-center gap-1 text-sm font-semibold text-ink/70"><MapPin aria-hidden="true" className="size-4" /> {where}</p>}
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="live-now">
        <h2 id="live-now" className="text-lg font-bold">{live ? t("liveNow") : t("noLive")}</h2>
        {live && (
          <a href={`/api/go?t=live&id=${live.id}`} target="_blank" rel="noopener noreferrer" className="grad-btn flex min-h-16 items-center justify-center gap-2 rounded-3xl text-xl font-bold">
            <Play aria-hidden="true" className="size-6" /> {t("watch")}
          </a>
        )}
        <a href={`/api/go?t=wa&id=${profile.userId}&m=${encodeURIComponent(t("waMessage", { shop: profile.shopName }))}`} target="_blank" rel="noopener noreferrer" className="flex min-h-16 items-center justify-center gap-2 rounded-3xl bg-wa text-xl font-bold text-white">
          <MessageCircle aria-hidden="true" className="size-6" /> {t("contact")}
        </a>
      </section>

      {products.length > 0 && (
        <section className="flex flex-col gap-3" aria-labelledby="products">
          <h2 id="products" className="text-lg font-bold">{ts("title")}</h2>
          <ul className="grid grid-cols-2 gap-3">
            {products.map((p) => <ProductCard key={p.id} product={p} showSeller={false} />)}
          </ul>
        </section>
      )}
    </div>
  );
}
