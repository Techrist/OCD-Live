import type { Metadata } from "next";
import { Building2, Clock, Headphones, MapPin, ShieldCheck, Smartphone, Radio } from "lucide-react";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AfricaMap } from "@/components/brand/africa-map";
import { Link } from "@/i18n/navigation";
import { whatsappLink } from "@/lib/whatsapp";
import { getSetting } from "@/server/services/catalog";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const t = await getTranslations({ locale: (await params).locale, namespace: "legal.about" });
  return { title: t("title"), description: t("p1") };
}

const hh = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tw] = await Promise.all([getTranslations("legal.about"), getTranslations("whatsapp")]);

  // Horaires du studio lus dans les réglages (jamais écrits en dur).
  const [startHours, duration, closed] = await Promise.all([
    getSetting<number[]>("studio.startHours"),
    getSetting<number>("booking.slotDurationMinutes"),
    getSetting<number[]>("studio.closedWeekdays"),
  ]);
  const from = hh(Math.min(...startHours) * 60);
  const to = hh(Math.max(...startHours) * 60 + duration);
  const dayNames = Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(locale, { weekday: "long", timeZone: "UTC" }).format(new Date(Date.UTC(2026, 0, 4 + i))));
  const closedDays = closed.map((d) => dayNames[d]).join(", ");

  const offers = [
    { icon: Building2, key: "studio" },
    { icon: Headphones, key: "remote" },
    { icon: Smartphone, key: "payment" },
    { icon: Radio, key: "directory" },
  ] as const;

  return (
    <div className="flex w-full flex-col">
      <section className="band grid items-center gap-6 py-10 md:grid-cols-[1.2fr_1fr] md:py-16">
        <div className="flex flex-col gap-3">
          <h1 className="text-[2rem] leading-tight font-semibold md:text-5xl">{t("title")}</h1>
          <p className="text-lg leading-relaxed">{t("p1")}</p>
          <p className="text-lg leading-relaxed text-ink/80">{t("p2")}</p>
        </div>
        <div className="soft mx-auto w-full max-w-xs rounded-[2.5rem] p-4">
          <AfricaMap className="w-full" />
        </div>
      </section>

      <section aria-labelledby="principle" className="band bg-[image:var(--hero)] py-14 text-white md:py-16">
        <h2 id="principle" className="text-2xl leading-tight font-semibold">{t("principleTitle")}</h2>
        <p className="mt-2 max-w-3xl text-lg font-semibold">{t("principleText")}</p>
      </section>

      <section aria-labelledby="offer" className="band flex flex-col gap-4 bg-white py-14 md:py-16">
        <h2 id="offer" className="text-2xl font-semibold">{t("offerTitle")}</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {offers.map(({ icon: Icon, key }) => (
            <li key={key} className="soft flex gap-4 rounded-[2rem] p-5">
              <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-full bg-wall-2 text-copper-800"><Icon className="size-6" /></span>
              <div>
                <h3 className="text-lg leading-tight font-bold">{t(`offer.${key}.title`)}</h3>
                <p className="mt-1 text-ink/80">{t(`offer.${key}.text`)}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="studio" className="band flex flex-col gap-4 bg-[#fffaf2] py-14 md:py-16">
        <h2 id="studio" className="text-2xl font-semibold">{t("studioTitle")}</h2>
        <p className="text-lg">{t("studioText")}</p>
        <div className="relative aspect-[3/2] overflow-hidden rounded-2xl"><Image src="/images/studio.webp" alt="" fill sizes="(min-width: 1024px) 960px, 100vw" className="object-cover" /></div>
        <ul className="flex flex-wrap gap-2">
          <li className="pill"><MapPin aria-hidden="true" className="size-4" /> {t("studioPlace")}</li>
          <li className="pill"><Clock aria-hidden="true" className="size-4" /> {t("studioHours", { from, to })}</li>
          {closedDays && <li className="pill">{t("studioClosed", { days: closedDays })}</li>}
        </ul>
      </section>

      <section aria-labelledby="commit" className="band flex flex-col gap-4 bg-white py-14 md:py-16">
        <h2 id="commit" className="text-2xl font-semibold">{t("commitTitle")}</h2>
        <ul className="grid gap-3 md:grid-cols-3">
          {(["real", "contact", "respect"] as const).map((k) => (
            <li key={k} className="soft flex flex-col gap-2 rounded-[2rem] p-5">
              <ShieldCheck aria-hidden="true" className="size-8 text-copper-800" />
              <h3 className="text-lg leading-tight font-bold">{t(`commit.${k}.title`)}</h3>
              <p className="text-ink/80">{t(`commit.${k}.text`)}</p>
            </li>
          ))}
        </ul>
        <Link href="/conditions" className="w-fit font-bold text-copper-800 underline">{t("commitLink")}</Link>
      </section>

      <section aria-labelledby="who" className="band bg-[#fffaf2] py-14 md:py-16">
        <h2 id="who" className="text-2xl font-semibold">{t("whoTitle")}</h2>
        <p className="mt-2 max-w-3xl text-lg">{t("p3")}</p>
      </section>

      <section aria-labelledby="contact" className="band flex flex-col items-start gap-4 bg-[image:var(--hero)] py-14 text-white md:flex-row md:items-center md:justify-between">
        <div>
          <h2 id="contact" className="text-2xl leading-tight font-semibold">{t("contactTitle")}</h2>
          <p className="pill mt-2 w-fit">{t("contactText")}</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
          <a href={whatsappLink(tw("message"))} target="_blank" rel="noopener noreferrer" className="flex min-h-14 items-center justify-center rounded-full bg-ink px-6 text-lg font-bold text-white">{tw("float")}</a>
          <Link href="/reserver" className="flex min-h-14 items-center justify-center rounded-full bg-white px-6 text-lg font-bold text-copper-800">{t("contactBook")}</Link>
        </div>
      </section>
    </div>
  );
}
