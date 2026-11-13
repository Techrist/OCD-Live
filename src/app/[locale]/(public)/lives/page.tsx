import type { Metadata } from "next";
import { ArrowRight, CalendarCheck, Eye, Link2, Radio } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LiveCard } from "@/components/lives/live-card";
import { liveImage } from "@/lib/live-image";
import { ProductCard } from "@/components/shop/product-card";
import { Flag } from "@/components/ui/flag";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/format";
import { shuffle } from "@/lib/shuffle";
import { currentWindow, nextWindow } from "@/lib/windows";
import { db } from "@/server/db";
import { getCountries, getPackages, getStudioTimezone } from "@/server/services/catalog";
import { liveCountsByCountry, publishedLives } from "@/server/services/directory";
import { listProducts } from "@/server/services/shop";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const t = await getTranslations({ locale: (await params).locale, namespace: "lives" });
  return { title: t("title"), description: t("subtitle") };
}

/**
 * ANN-04 : lives en cours, programme du jour (créneaux de validation) et pays avec le nombre de lives.
 * Sections inspirées de la maquette « Lives en cours » ; les données sont celles de l'annuaire.
 */
export default async function LivesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("lives");
  const now = new Date();
  const [countries, counts, tz, windows, lives, packages, products] = await Promise.all([
    getCountries(),
    liveCountsByCountry(),
    getStudioTimezone(),
    db.validationWindow.findMany({ where: { active: true }, orderBy: { startTime: "asc" } }),
    publishedLives({}),
    getPackages(),
    listProducts({}, 4),
  ]);
  const open = currentWindow(windows, now, tz);
  const next = nextWindow(windows, now, tz);
  const names = new Map(countries.map((c) => [c.code, c.name]));
  const shown = shuffle(lives).slice(0, 6);
  const sorted = [...countries].sort((a, b) => (counts.get(b.code) ?? 0) - (counts.get(a.code) ?? 0) || a.name.localeCompare(b.name));
  const trial = packages.find((p) => !p.quoteOnly);
  const timeFmt = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", timeZone: tz });
  const dayFmt = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: tz });
  const today = dayFmt.format(now);

  return (
    <div className="flex w-full flex-col">
      <header className="band flex flex-col gap-2 py-10 md:py-14">
        <h1 className="text-[2rem] leading-tight font-bold md:text-5xl">{t("title")}</h1>
        <p className="max-w-2xl text-lg text-ink/80">{t("subtitle")}</p>
        <div className="flex flex-wrap gap-2 pt-2">
          <span className="pill">{t("liveCount", { count: lives.length })}</span>
          <span className="pill">{t("statCountries", { count: sorted.filter((c) => (counts.get(c.code) ?? 0) > 0).length })}</span>
          {next && !open && <span className="pill">{t("next", { time: timeFmt.format(next.start) })}</span>}
        </div>
      </header>

      <section aria-labelledby="current" className="band flex flex-col gap-4 bg-white py-12 md:py-16">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="current" className="text-2xl font-bold md:text-3xl">{t("current")}</h2>
            <p className="text-ink/80">{t("currentSub")}</p>
          </div>
          <span className="pill">{t("liveCount", { count: lives.length })}</span>
        </div>
        {shown.length === 0 ? (
          <p className="soft rounded-3xl p-5 font-semibold">{t("noneNow")}</p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {shown.map((l) => (
              <LiveCard
                key={l.id}
                waMessage={t("waMessage")}
                live={{
                  id: l.id, sellerId: l.seller.id, shop: l.seller.sellerProfile?.shopName ?? "—", city: l.seller.city,
                  category: l.category, slug: l.seller.sellerProfile?.slug ?? null, verified: !!l.seller.sellerProfile?.verified,
                  country: { code: l.countryCode, name: names.get(l.countryCode) ?? l.countryCode },
                  image: liveImage({ profilePhoto: l.seller.sellerProfile?.photoUrl, productPhotoKey: l.seller.products[0]?.photoKey, categorySlug: l.category.slug }).src,
                }}
              />
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="countries" className="band flex flex-col gap-4 bg-[#fffaf2] py-12 md:py-16">
        <h2 id="countries" className="text-2xl font-bold md:text-3xl">{t("byCountry")}</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {sorted.map((c) => {
            const n = counts.get(c.code) ?? 0;
            return (
              <li key={c.code}>
                <Link href={`/lives/${c.code.toLowerCase()}`} className="soft flex h-full flex-col items-center gap-2 rounded-[2rem] p-3 text-center">
                  <Flag code={c.code} className="h-8 w-12 rounded-sm ring-1 ring-ink/30" />
                  <span className="text-lg leading-tight font-bold">{c.name}</span>
                  <span className={n > 0 ? "pill !bg-red-600 !text-white" : "pill"}>
                    {n > 0 && <Radio aria-hidden="true" className="size-4" />} {t("liveCount", { count: n })}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {windows.length > 0 && (
        <section aria-labelledby="program" className="band flex flex-col gap-4 bg-white py-12 md:py-16">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-sm font-bold tracking-wide text-copper-800 uppercase">{t("programEyebrow")}</p>
              <h2 id="program" className="text-2xl font-bold md:text-3xl">{t("program")}</h2>
              <p className="text-ink/80">{today.charAt(0).toUpperCase() + today.slice(1)} · {t("programSub")}</p>
            </div>
            <span className="pill !bg-wall-2 !shadow-none">{t("zone")}</span>
          </div>
          <ul className="grid gap-3 md:grid-cols-2">
            {windows.map((w) => {
              const isOpen = open?.label === w.label;
              return (
                <li key={w.id} className={`flex flex-col gap-1 rounded-2xl p-4 ${isOpen ? "grad-btn" : "bg-wall-2"}`}>
                  <span className="text-xl font-bold tabular-nums">{w.startTime} – {w.endTime}</span>
                  <span className="font-bold">{w.label}</span>
                  <span className={isOpen ? "pill w-fit" : "text-sm font-semibold text-ink/70"}>{isOpen ? t("windowOpen") : next?.label === w.label ? t("windowNext") : t("windowLater")}</span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section aria-labelledby="how" className="band flex flex-col gap-8 bg-white py-12 md:py-16">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-2 text-center">
          <h2 id="how" className="text-3xl">{t("how.title")}</h2>
          <p className="text-lg text-ink/70">{t("how.subtitle")}</p>
        </div>
        <ol className="grid gap-4 md:grid-cols-3">
          {([CalendarCheck, Link2, Eye] as const).map((Icon, i) => (
            <li key={i} className="flex flex-col gap-3 rounded-3xl border border-ink/10 p-6">
              <span aria-hidden="true" className="grid size-12 place-items-center rounded-full grad-btn"><Icon className="size-6" /></span>
              <h3 className="text-xl font-bold">{t(`how.s${i + 1}.title`)}</h3>
              <p className="font-semibold text-ink/70">{t(`how.s${i + 1}.text`)}</p>
            </li>
          ))}
        </ol>
      </section>

      {products.length > 0 && (
        <section aria-labelledby="lives-shop" className="band flex flex-col gap-6 bg-[#fffaf2] py-12 md:py-16">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 id="lives-shop" className="text-3xl">{t("shop.title")}</h2>
              <p className="text-lg text-ink/70">{t("shop.subtitle")}</p>
            </div>
            <Link href="/shop" className="font-bold text-copper-800 underline">{t("shop.cta")} →</Link>
          </div>
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </ul>
        </section>
      )}

      <section aria-labelledby="sellers" className="band flex flex-col gap-4 bg-[image:var(--hero)] py-14 text-white">
        <p className="text-sm font-bold tracking-wide uppercase">{t("cta.eyebrow")}</p>
        <h2 id="sellers" className="max-w-3xl text-3xl leading-tight font-bold md:text-4xl">{t("cta.title")}</h2>
        <p className="max-w-2xl text-lg">{t("cta.text")}</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/reserver" className="flex min-h-16 items-center justify-center gap-2 rounded-2xl bg-white px-8 text-xl font-bold text-copper-800">
            {t("cta.button")}
            {trial && <span className="rounded-full bg-wall-2 px-3 text-sm">{t("cta.from", { price: formatPrice(trial.price) })}</span>}
            <ArrowRight aria-hidden="true" className="size-6" />
          </Link>
          <Link href="/espace/abonnement" className="flex min-h-16 items-center justify-center rounded-2xl bg-ink px-8 text-lg font-bold text-white">{t("cta.subscribe")}</Link>
        </div>
      </section>
    </div>
  );
}
