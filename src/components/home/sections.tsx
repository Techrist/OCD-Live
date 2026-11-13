import { ArrowRight, Check, ChevronDown, Clapperboard, ExternalLink, Headset, MessageCircle, MousePointerClick, Radio, ShieldCheck, Smartphone, Wallet } from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ProductCard } from "@/components/shop/product-card";
import { CategoryIcon } from "@/components/ui/category-icon";
import { Flag } from "@/components/ui/flag";
import { Link } from "@/i18n/navigation";
import { formatDuration, formatPrice } from "@/lib/format";
import { whatsappLink } from "@/lib/whatsapp";
import { getCategories, getCountries, getPackages, getSetting } from "@/server/services/catalog";
import { liveCountsByCountry } from "@/server/services/directory";
import { listProducts } from "@/server/services/shop";

// Sections de l'accueil, dans l'esprit épuré de la maquette : titre centré, petite pastille numérotée au-dessus,
// grandes feuilles blanches arrondies. Les prix, délais et nombres de lives viennent de la base.

function Heading({ title, subtitle, id }: { title: string; subtitle?: string; id: string }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-2 text-center">
      <h2 id={id}>{title}</h2>
      {subtitle && <p className="text-lg text-ink/70">{subtitle}</p>}
    </div>
  );
}

/** 01 — Catégories populaires : cartes image avec le nom en pastille blanche. */
export async function Popular() {
  const [t, categories] = await Promise.all([getTranslations("home.popular"), getCategories()]);
  return (
    <section aria-labelledby="popular" className="band relative -mt-10 flex flex-col gap-8 bg-[linear-gradient(180deg,#fbe3b5_0,#fbe3b5_5rem,#fdf1da_9rem,#fff_17rem)] pt-28 pb-14 md:pt-36 md:pb-20">
      <Heading id="popular" title={t("title")} subtitle={t("subtitle")} />
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {categories.map((c) => (
          <li key={c.id}>
            <Link href="/lives" className="group relative block aspect-[4/3] overflow-hidden rounded-2xl">
              <Image src={`/images/cat-${c.slug}.webp`} alt="" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover transition-transform duration-300 group-hover:scale-105" />
              <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-bold shadow">
                <CategoryIcon name={c.icon} className="size-4 text-copper-800" /> {c.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/lives" className="grad-btn mx-auto flex min-h-14 items-center gap-2 px-8 text-lg font-bold">{t("cta")} <ArrowRight aria-hidden="true" className="size-5" /></Link>
    </section>
  );
}

/** 02 — Réserve en 3 étapes. */
export async function Steps() {
  const [t, th] = await Promise.all([getTranslations("home.steps"), getTranslations("home.how")]);
  const steps = [
    { key: "s1", icon: MousePointerClick, img: "/images/step-1.webp" },
    { key: "s2", icon: Wallet, img: "/images/step-2.webp" },
    { key: "s3", icon: Clapperboard, img: "/images/step-3.webp" },
  ] as const;
  return (
    <section aria-labelledby="steps" className="band flex flex-col gap-8 bg-[#fffaf2] py-14 md:py-20">
      <Heading id="steps" title={t("title")} subtitle={t("subtitle")} />
      <ol className="grid gap-4 md:grid-cols-3">
        {steps.map(({ key, icon: Icon, img }, i) => (
          <li key={key} className="flex flex-col gap-3">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
              <Image src={img} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
              <span className="absolute top-3 left-3 grid size-9 place-items-center rounded-full bg-white font-bold">{String(i + 1).padStart(2, "0")}</span>
            </div>
            <div className="flex items-start gap-3">
              <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-soft text-copper-800"><Icon className="size-5" /></span>
              <div>
                <h3 className="text-lg leading-tight font-bold">{th(`${key}.title`)}</h3>
                <p className="text-ink/70">{th(`${key}.text`)}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** 03 — Pourquoi OCD Live : quatre arguments et deux images. */
export async function Why() {
  const t = await getTranslations("home.why");
  const items = [
    { icon: Radio, key: "marketing" },
    { icon: Smartphone, key: "mobile" },
    { icon: Headset, key: "support" },
    { icon: ShieldCheck, key: "trust" },
  ] as const;
  return (
    <section aria-labelledby="why" className="band flex flex-col gap-8 bg-white py-14 md:py-20">
      <Heading id="why" title={t("title")} subtitle={t("subtitle")} />
      <div className="grid items-center gap-6 md:grid-cols-[1.2fr_1fr]">
        <ul className="grid gap-4 sm:grid-cols-2">
          {items.map(({ icon: Icon, key }) => (
            <li key={key} className="flex flex-col gap-2 rounded-2xl bg-wall-2/60 p-5">
              <span aria-hidden="true" className="grid size-11 place-items-center rounded-xl bg-white text-copper-800"><Icon className="size-6" /></span>
              <h3 className="text-lg leading-tight font-bold">{t(`${key}.title`)}</h3>
              <p className="text-ink/70">{t(`${key}.text`)}</p>
            </li>
          ))}
        </ul>
        <div className="grid grid-cols-2 gap-3">
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl"><Image src="/images/why-1.webp" alt="" fill sizes="(min-width: 768px) 20vw, 50vw" className="object-cover" /></div>
          <div className="relative mt-8 aspect-[3/4] overflow-hidden rounded-2xl"><Image src="/images/why-2.webp" alt="" fill sizes="(min-width: 768px) 20vw, 50vw" className="object-cover" /></div>
        </div>
      </div>
    </section>
  );
}

/** Bande ondulée ambre : les pays où le service est ouvert, avec leur drapeau. */
export async function CountriesBand() {
  const [t, countries] = await Promise.all([getTranslations("home.countriesBand"), getCountries()]);
  return (
    <section aria-label={t("title", { count: countries.length })} className="wave-band band flex flex-col items-center gap-4 py-16">
      <p className="text-center text-lg font-bold">{t("title", { count: countries.length })}</p>
      <ul className="mx-auto flex max-w-4xl flex-wrap justify-center gap-2">
        {countries.map((c) => (
          <li key={c.code} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-bold shadow-sm">
            <Flag code={c.code} className="h-4 w-6 rounded-sm ring-1 ring-ink/20" /> {c.name}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** 04 — Nos offres : trois cartes simples avec les vrais prix. */
export async function Offers() {
  const [t, tp, packages] = await Promise.all([getTranslations("home.offers"), getTranslations("booking.package"), getPackages()]);
  const shown = packages.filter((p) => !p.quoteOnly).slice(0, 3);
  return (
    <section aria-labelledby="offers" className="band flex flex-col gap-8 bg-white py-14 md:py-20">
      <Heading id="offers" title={t("title")} subtitle={t("subtitle")} />
      <ul className="grid gap-4 md:grid-cols-3">
        {shown.map((p) => (
          <li key={p.slug} className={`relative flex flex-col gap-2 rounded-2xl border p-6 ${p.highlighted ? "border-copper bg-amber-soft/40" : "border-ink/10"}`}>
            {p.highlighted && <span className="grad-btn absolute -top-3 left-5 rounded-full px-3 py-1 text-sm font-bold">{tp("mostChosen")}</span>}
            <h3 className="text-xl font-bold">{p.name}</h3>
            <p className="font-semibold text-ink/70">{tp("live", { count: p.liveCount })} · {formatDuration(p.durationMinutes)}</p>
            <p className="mt-2 text-4xl font-bold text-copper-800 tabular-nums">{formatPrice(p.price).replace(/ F$/, "")} <span className="text-lg">FCFA</span></p>
            <ul className="mt-2 flex flex-col gap-1.5">
              {p.features.slice(0, 3).map((f) => (
                <li key={f} className="flex items-start gap-2 font-semibold"><Check aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-wa" /> {f}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <Link href="/reserver" className="grad-btn mx-auto flex min-h-14 items-center gap-2 px-8 text-lg font-bold">{t("cta")} <ArrowRight aria-hidden="true" className="size-5" /></Link>
    </section>
  );
}

/** 05 — Le studio : image, principe du porteur et lives en direct par pays (données réelles). */
export async function StudioLive() {
  const [t, tt, counts, countries] = await Promise.all([getTranslations("home.idea"), getTranslations("home.ticker"), liveCountsByCountry(), getCountries()]);
  const live = countries.filter((c) => (counts.get(c.code) ?? 0) > 0).sort((a, b) => (counts.get(b.code) ?? 0) - (counts.get(a.code) ?? 0));
  return (
    <section aria-labelledby="studio" className="band flex flex-col gap-8 bg-[#fffaf2] py-14 md:py-20">
      <Heading id="studio" title={t("title")} />
      <div className="grid items-center gap-6 md:grid-cols-2">
        <div className="relative aspect-[3/2] overflow-hidden rounded-2xl"><Image src="/images/studio.webp" alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" /></div>
        <div className="flex flex-col gap-4">
          <p className="text-lg leading-relaxed text-ink/80">{t("text")}</p>
          <a href="https://www.tiktok.com/@houseofchallenge" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 w-fit items-center gap-2 rounded-xl border border-ink/15 px-4 font-bold">
            {t("tiktok")} <ExternalLink aria-hidden="true" className="size-4" />
          </a>
        </div>
      </div>
      {live.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl bg-ink p-5 text-white">
          <p className="inline-flex items-center gap-2 font-bold uppercase"><span aria-hidden="true" className="size-2.5 rounded-full bg-red-500" /> {tt("title")}</p>
          <ul className="flex flex-wrap gap-2">
            {live.map((c) => (
              <li key={c.code}>
                <Link href={`/lives/${c.code.toLowerCase()}`} className="flex min-h-11 items-center gap-2 rounded-full bg-white/10 px-3 font-bold hover:bg-white/20">
                  <Flag code={c.code} className="h-4 w-6 rounded-sm" /> {c.name}
                  <span className="rounded-full bg-wa px-2 text-sm">{tt("count", { count: counts.get(c.code) ?? 0 })}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/lives" className="inline-flex items-center gap-1 font-bold underline">{tt("all")} <ArrowRight aria-hidden="true" className="size-4" /></Link>
        </div>
      )}
    </section>
  );
}

/** 06 — Questions fréquentes : lignes simples qui se déplient. */
export async function Faq() {
  const t = await getTranslations("home.faq");
  const [packages, hours, subscription] = await Promise.all([
    getPackages(),
    getSetting<number>("booking.cancelFreeHoursBefore"),
    getSetting<number>("subscription.priceFcfa"),
  ]);
  const trial = packages.find((p) => !p.quoteOnly);
  const params = { price: trial ? formatPrice(trial.price) : "—", duration: trial ? formatDuration(trial.durationMinutes) : "—", hours, sub: formatPrice(subscription) };
  const keys = ["price", "pay", "cancel", "remote", "directory"] as const;
  return (
    <section aria-labelledby="faq" className="band flex flex-col gap-6 bg-white py-14 md:py-20">
      <Heading id="faq" title={t("title")} subtitle={t("subtitle")} />
      <div className="mx-auto flex w-full max-w-3xl flex-col divide-y divide-ink/10">
        {keys.map((k) => (
          <details key={k} className="group py-1">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 text-lg font-bold">
              {t(`${k}.q`)}
              <ChevronDown aria-hidden="true" className="size-5 shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <p className="pb-4 text-ink/70">{t(`${k}.a`, params)}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/** Appel final : même dégradé cuivre que le héros. */
export async function FinalCta() {
  const [t, tw] = await Promise.all([getTranslations("home.cta"), getTranslations("whatsapp")]);
  return (
    <section aria-labelledby="cta" className="band relative isolate flex w-full flex-col items-center gap-5 overflow-hidden bg-[image:var(--hero)] py-24 text-center text-white">
      <Image src="/images/cta.webp" alt="" fill sizes="100vw" className="-z-20 object-cover" />
      <span aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-[#7a3510]/85 via-[#b4541a]/75 to-[#7a3510]/85" />
      <h2 id="cta" className="max-w-3xl text-white">{t("title")}</h2>
      <p className="text-lg text-white/90">{t("subtitle")}</p>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Link href="/reserver" className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-white px-8 text-lg font-bold text-copper-800">{t("book")} <ArrowRight aria-hidden="true" className="size-5" /></Link>
        <a href={whatsappLink(tw("message"))} target="_blank" rel="noopener noreferrer" className="flex min-h-14 items-center justify-center gap-2 rounded-xl border border-white/60 px-8 text-lg font-bold"><MessageCircle aria-hidden="true" className="size-5" /> {t("advisor")}</a>
      </div>
    </section>
  );
}

/** OCD Shop : aperçu des derniers produits des vendeurs (données réelles) avec accès au catalogue complet. */
export async function ShopTeaser() {
  const [t, products] = await Promise.all([getTranslations("home.shop"), listProducts({}, 4)]);
  if (products.length === 0) return null;
  return (
    <section aria-labelledby="shop" className="band flex flex-col gap-8 bg-[#fffaf2] py-14 md:py-20">
      <Heading id="shop" title={t("title")} subtitle={t("subtitle")} />
      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {products.map((p) => <ProductCard key={p.id} product={p} />)}
      </ul>
      <Link href="/shop" className="grad-btn mx-auto flex min-h-14 items-center gap-2 px-8 text-lg font-bold">{t("cta")} <ArrowRight aria-hidden="true" className="size-5" /></Link>
    </section>
  );
}
