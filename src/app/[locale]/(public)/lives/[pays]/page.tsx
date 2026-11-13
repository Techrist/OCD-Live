import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LiveCard } from "@/components/lives/live-card";
import { Flag } from "@/components/ui/flag";
import { Link } from "@/i18n/navigation";
import { shuffle } from "@/lib/shuffle";
import { cn } from "@/lib/utils";
import { db } from "@/server/db";
import { publishedLives } from "@/server/services/directory";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ pays: string }> }): Promise<Metadata> {
  const country = await db.country.findUnique({ where: { code: (await params).pays.toUpperCase() } });
  return { title: country ? `Lives — ${country.name}` : "Lives" };
}

/** ANN-04 / ANN-05 : catégories du pays, puis fiches live. L'ordre tourne à chaque chargement (ANN-13). */
export default async function CountryLivesPage({ params, searchParams }: { params: Promise<{ locale: string; pays: string }>; searchParams: Promise<{ c?: string }> }) {
  const { locale, pays } = await params;
  setRequestLocale(locale);
  const country = await db.country.findFirst({ where: { code: pays.toUpperCase(), active: true } });
  if (!country) notFound();
  const { c: categoryId } = await searchParams;
  const t = await getTranslations("lives");
  const all = await publishedLives({ countryCode: country.code });

  const cats = new Map<string, { id: string; name: string; count: number }>();
  for (const l of all) {
    const e = cats.get(l.category.id) ?? { id: l.category.id, name: l.category.name, count: 0 };
    e.count++;
    cats.set(l.category.id, e);
  }
  const shown = shuffle(categoryId ? all.filter((l) => l.categoryId === categoryId) : all);
  const waMessage = t("waMessage");
  const chip = "soft inline-flex min-h-12 items-center rounded-full px-4 font-bold whitespace-nowrap";

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5 px-5 pt-2">
      <div className="flex items-center gap-3">
        <Flag code={country.code} className="h-8 w-12 rounded-sm ring-1 ring-ink/30" />
        <h1 className="text-[1.7rem] leading-tight font-semibold">{country.name}</h1>
      </div>
      <p className="pill w-fit">{t("liveCount", { count: all.length })}</p>
      <nav aria-label={t("categories")} className="-mx-5 overflow-x-auto px-5 pb-1">
        <ul className="flex w-max gap-2">
          <li><Link href={`/lives/${pays}`} aria-current={!categoryId ? "true" : undefined} className={cn(chip, !categoryId && "grad-btn")}>{t("all")}</Link></li>
          {[...cats.values()].map((cat) => (
            <li key={cat.id}>
              <Link href={`/lives/${pays}?c=${cat.id}`} aria-current={categoryId === cat.id ? "true" : undefined} className={cn(chip, categoryId === cat.id && "grad-btn")}>{cat.name} · {cat.count}</Link>
            </li>
          ))}
        </ul>
      </nav>
      {shown.length === 0 ? (
        <p className="soft rounded-3xl p-5 font-semibold">{t("empty")}</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {shown.map((l) => (
            <LiveCard
              key={l.id}
              waMessage={waMessage}
              live={{
                id: l.id, sellerId: l.seller.id, shop: l.seller.sellerProfile?.shopName ?? "—", city: l.seller.city,
                category: l.category, slug: l.seller.sellerProfile?.slug ?? null, verified: !!l.seller.sellerProfile?.verified,
              }}
            />
          ))}
        </ul>
      )}
      <Link href="/lives" className="text-center font-bold text-copper-800 underline">{t("allCountries")}</Link>
    </div>
  );
}
