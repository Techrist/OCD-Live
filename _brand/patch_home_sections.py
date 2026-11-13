def edit(path, pairs):
    s = open(path, encoding="utf-8").read()
    for a, b in pairs:
        if a not in s:
            print("MISSING in", path, ":", a[:80])
        s = s.replace(a, b)
    open(path, "w", encoding="utf-8").write(s)

P = "src/components/home/sections.tsx"

edit(P, [
    # imports
    ('import { CalendarCheck, ChevronDown, Clapperboard, HeartHandshake, Megaphone, MousePointerClick, ShieldCheck, Smartphone } from "lucide-react";',
     'import { ArrowRight, CalendarCheck, ChevronDown, Clapperboard, ExternalLink, Lightbulb, Lock, MessageCircle, MousePointerClick, Radio, ShieldCheck, Smartphone, Wallet } from "lucide-react";'),
    ('import { CategoryIcon } from "@/components/ui/category-icon";',
     'import { CategoryIcon } from "@/components/ui/category-icon";\nimport { Flag } from "@/components/ui/flag";'),
    ('import { getCategories, getPackages, getSetting } from "@/server/services/catalog";',
     'import { getCategories, getCountries, getPackages, getSetting } from "@/server/services/catalog";\nimport { liveCountsByCountry } from "@/server/services/directory";'),
    # Section header with eyebrow + optional link
    ('''function Section({ id, title, subtitle, children }: { id: string; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4">
      <div>
        <h2 id={id} className="text-2xl leading-tight font-semibold">{title}</h2>
        {subtitle && <p className="font-semibold text-ink/70">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}''', '''function Section({ id, title, subtitle, eyebrow, center, children }: { id: string; title: string; subtitle?: string; eyebrow?: string; center?: boolean; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-5">
      <div className={center ? "mx-auto max-w-2xl text-center" : undefined}>
        {eyebrow && <p className="text-sm font-bold tracking-wide text-copper-800 uppercase">{eyebrow}</p>}
        <h2 id={id} className="text-3xl leading-tight font-bold md:text-4xl">{title}</h2>
        {subtitle && <p className="mt-1 text-lg text-ink/80">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

/** Bandeau « En direct maintenant » : pays avec le nombre de lives en cours (données réelles de l'annuaire). */
export async function LiveTicker() {
  const [t, counts, countries] = await Promise.all([getTranslations("home.ticker"), liveCountsByCountry(), getCountries()]);
  const live = countries.filter((c) => (counts.get(c.code) ?? 0) > 0).sort((a, b) => (counts.get(b.code) ?? 0) - (counts.get(a.code) ?? 0));
  if (live.length === 0) return null;
  return (
    <section aria-label={t("title")} className="-mx-5 bg-ink px-5 py-4 text-white md:rounded-3xl md:mx-0">
      <div className="mx-auto flex max-w-6xl items-center gap-3 overflow-x-auto">
        <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-sm font-bold uppercase"><Radio aria-hidden="true" className="size-4" /> {t("title")}</span>
        <ul className="flex flex-1 items-center gap-2">
          {live.map((c) => (
            <li key={c.code}>
              <Link href={`/lives/${c.code.toLowerCase()}`} className="flex min-h-11 items-center gap-2 rounded-full bg-white/10 px-3 font-bold whitespace-nowrap hover:bg-white/20">
                <Flag code={c.code} className="h-4 w-6 rounded-sm" /> {c.name}
                <span className="rounded-full bg-wa px-2 text-sm">{t("count", { count: counts.get(c.code) ?? 0 })}</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/lives" className="inline-flex min-h-11 shrink-0 items-center gap-1 font-bold underline">{t("all")} <ArrowRight aria-hidden="true" className="size-4" /></Link>
      </div>
    </section>
  );
}'''),
    # numbered cards
    ('''    <Section id="how" title={t("title")} subtitle={t("subtitle")}>
      <ol className="grid gap-3 md:grid-cols-3">
        {steps.map(({ icon: Icon, key }, i) => (
          <li key={key} className="soft flex items-start gap-4 rounded-[2rem] p-5">
            <span aria-hidden="true" className="grad-btn grid size-14 shrink-0 place-items-center rounded-full">
              <Icon className="size-7" />
            </span>
            <div>
              <p className="text-sm font-bold text-copper-800">{i + 1}</p>
              <h3 className="text-lg leading-tight font-bold">{t(`${key}.title`)}</h3>
              <p className="mt-1 text-ink/80">{t(`${key}.text`)}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>''', '''    <Section id="how" eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} center>
      <ol className="grid gap-4 md:grid-cols-3">
        {steps.map(({ icon: Icon, key }, i) => (
          <li key={key} className="soft relative flex flex-col gap-3 overflow-hidden rounded-[2rem] p-6">
            <span aria-hidden="true" className="absolute top-3 right-5 text-5xl font-bold text-ink/10">{String(i + 1).padStart(2, "0")}</span>
            <span aria-hidden="true" className="grad-btn grid size-14 place-items-center rounded-2xl">
              <Icon className="size-7" />
            </span>
            <h3 className="text-xl leading-tight font-bold">{i + 1}. {t(`${key}.title`)}</h3>
            <p className="text-ink/80">{t(`${key}.text`)}</p>
          </li>
        ))}
      </ol>
    </Section>'''),
    ('''    { icon: CalendarCheck, key: "s2" },''', '''    { icon: Wallet, key: "s2" },'''),
    # offers: eyebrow + link in header
    ('''    <Section id="offers" title={t("title")} subtitle={t("subtitle")}>''', '''    <Section id="offers" eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")}>'''),
    ('''      <Link href="/reserver" className="grad-btn flex min-h-14 w-full items-center justify-center rounded-full px-6 text-lg font-bold md:w-fit">{t("cta")}</Link>''',
     '''      <Link href="/reserver" className="grad-btn flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl px-6 text-lg font-bold md:w-fit">{t("cta")} <ArrowRight aria-hidden="true" className="size-5" /></Link>'''),
])

# Remplace WhyUs par « L'idée derrière OCD Live » et refait l'appel final.
s = open(P, encoding="utf-8").read()
a = s.index("export async function WhyUs()")
b = s.index("export async function Faq()")
idea = '''/** « L'idée derrière OCD Live » : le principe du porteur (le marketing avant la vente), sans citation inventée. */
export async function Idea() {
  const t = await getTranslations("home.idea");
  const trust = [
    { icon: Smartphone, key: "mobile" },
    { icon: ShieldCheck, key: "trust" },
  ] as const;
  return (
    <section aria-labelledby="idea" className="soft grid gap-6 rounded-[2.5rem] p-6 md:grid-cols-[1.4fr_1fr] md:p-10">
      <div className="flex flex-col gap-3">
        <p className="flex items-center gap-2 text-sm font-bold tracking-wide text-copper-800 uppercase"><Lightbulb aria-hidden="true" className="size-5" /> {t("eyebrow")}</p>
        <h2 id="idea" className="text-3xl leading-tight font-bold md:text-4xl">{t("title")}</h2>
        <p className="text-lg leading-relaxed text-ink/80">{t("text")}</p>
        <a href="https://www.tiktok.com/@houseofchallenge" target="_blank" rel="noopener noreferrer" className="soft inline-flex min-h-12 w-fit items-center gap-2 rounded-2xl px-4 font-bold">
          {t("tiktok")} <ExternalLink aria-hidden="true" className="size-4" />
        </a>
      </div>
      <ul className="flex flex-col gap-3">
        {trust.map(({ icon: Icon, key }) => (
          <li key={key} className="flex gap-3 rounded-2xl bg-wall-2 p-4">
            <Icon aria-hidden="true" className="size-7 shrink-0 text-copper-800" />
            <div>
              <h3 className="font-bold">{t(`${key}.title`)}</h3>
              <p className="text-ink/80">{t(`${key}.text`)}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

'''
s = s[:a] + idea + s[b:]
c = s.index("export async function FinalCta()")
cta = '''export async function FinalCta() {
  const [t, tw] = await Promise.all([getTranslations("home.cta"), getTranslations("whatsapp")]);
  return (
    <section aria-labelledby="cta" className="grad-btn -mx-5 flex flex-col items-center gap-5 px-5 py-12 text-center md:mx-0 md:rounded-[2.5rem]">
      <h2 id="cta" className="max-w-3xl text-3xl leading-tight font-bold md:text-5xl">{t("title")}</h2>
      <p className="pill">{t("subtitle")}</p>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Link href="/reserver" className="flex min-h-16 items-center justify-center gap-2 rounded-2xl bg-white px-8 text-xl font-bold text-copper-800">{t("book")} <ArrowRight aria-hidden="true" className="size-6" /></Link>
        <a href={whatsappLink(tw("message"))} target="_blank" rel="noopener noreferrer" className="flex min-h-16 items-center justify-center gap-2 rounded-2xl bg-ink px-8 text-xl font-bold text-white"><MessageCircle aria-hidden="true" className="size-6" /> {t("advisor")}</a>
      </div>
      <ul className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm font-bold">
        <li className="inline-flex items-center gap-1"><Lock aria-hidden="true" className="size-4" /> {t("trust1")}</li>
        <li className="inline-flex items-center gap-1"><MessageCircle aria-hidden="true" className="size-4" /> {t("trust2")}</li>
        <li className="inline-flex items-center gap-1"><CalendarCheck aria-hidden="true" className="size-4" /> {t("trust3")}</li>
      </ul>
    </section>
  );
}
'''
s = s[:c] + cta
open(P, "w", encoding="utf-8").write(s)

# Accueil : hero + ordre des sections du design.
edit("src/app/[locale]/(public)/page.tsx", [
    ('import { Categories, Faq, FinalCta, HowItWorks, Offers, WhyUs } from "@/components/home/sections";', 'import { Categories, Faq, FinalCta, HowItWorks, Idea, LiveTicker, Offers } from "@/components/home/sections";'),
    ('''      <HowItWorks />
      <Offers />
      <WhyUs />
      <Categories />
      <Faq />
      <FinalCta />''', '''      <LiveTicker />
      <HowItWorks />
      <Offers />
      <Idea />
      <Categories />
      <Faq />
      <FinalCta />'''),
    ('''        <div className="mx-auto flex w-full max-w-md flex-col gap-5 md:mx-0 md:max-w-none">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-base font-semibold text-ink/70">{t("home.greeting")}</p>
              <h1 className="text-[1.7rem] leading-tight font-semibold md:text-4xl">{t("home.title")}</h1>
            </div>''', '''        <div className="mx-auto flex w-full max-w-md flex-col gap-5 md:mx-0 md:max-w-none">
          <p className="pill w-fit"><span className="size-2.5 rounded-full bg-wa" aria-hidden="true" /> {t("home.launch")}</p>
          <div className="flex items-end justify-between gap-3">
            <div>
              <h1 className="text-[2rem] leading-tight font-bold md:text-5xl">{t("home.title")}</h1>
              <p className="mt-2 text-lg text-ink/80">{t("home.lead")}</p>
            </div>'''),
])
print("ok")
