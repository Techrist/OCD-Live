import { ArrowRight, Building2, Home } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { AfricaMap } from "@/components/brand/africa-map";
import { ResumeBanner } from "@/components/booking/resume";
import { AudioHint } from "@/components/ui/audio-hint";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { Link } from "@/i18n/navigation";

// Cinq portraits de vendeurs (public/images/hero-1..5.webp, voir PROMPTS-IMAGES.md) : carrousel en arc de cercle.
const PORTRAITS = [1, 2, 3, 4, 5].map((n) => `/images/hero-${n}.webp`);

/** Héros : dégradé cuivre, grand titre, barre de choix du mode (studio ou chez soi) et carrousel en arc de portraits. */
export async function Hero({ locale }: { locale: string }) {
  const t = await getTranslations();
  return (
    <section aria-labelledby="hero" className="relative z-20 bg-[image:var(--hero)] pt-28 text-white"> {/* z-20 : le carrousel déborde sur la section blanche suivante */}
      {/* Fond : formes en contour fin (la carte lumineuse du studio), discrètes, coupées par les bords. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent via-[#f7c987]/60 to-[#fbe3b5]" /> {/* fondu vers la section suivante, sans trait */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <AfricaMap glow={false} fill="none" stroke="#fbe3b5" className="absolute -top-24 -right-40 w-[44rem] max-w-none rotate-12 opacity-30" />
        <AfricaMap glow={false} fill="none" stroke="#fbe3b5" className="absolute -bottom-40 -left-52 w-[38rem] max-w-none -rotate-12 opacity-20" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-5 px-5 text-center">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold backdrop-blur">
          <span aria-hidden="true" className="size-2.5 rounded-full bg-white" /> {t("home.launch")}
        </p>
        <h1 id="hero" className="text-white">{t("home.heroTitle")}</h1>
        <p className="max-w-xl text-lg text-white/90">{t("home.lead")}</p>

        {/* Barre de réservation : les deux modes de live puis le bouton principal. */}
        <div className="flex w-full max-w-2xl flex-col gap-2 rounded-2xl bg-white p-2 text-ink shadow-xl sm:flex-row sm:items-center">
          <Link
            href="/reserver/mode?mode=ONSITE"
            aria-label={t("home.studio")}
            className="flex min-h-14 flex-1 items-center gap-3 rounded-xl px-4 text-left font-bold hover:bg-wall-2"
          >
            <Building2 aria-hidden="true" className="size-6 shrink-0 text-copper-800" />
            <span className="leading-tight">{t("home.bar.studio")}<span className="block text-sm font-semibold text-ink/60">{t("home.studioHint")}</span></span>
          </Link>
          <span aria-hidden="true" className="hidden h-8 w-px bg-ink/10 sm:block" />
          <Link
            href="/reserver/mode?mode=REMOTE"
            aria-label={t("home.remote")}
            className="flex min-h-14 flex-1 items-center gap-3 rounded-xl px-4 text-left font-bold hover:bg-wall-2"
          >
            <Home aria-hidden="true" className="size-6 shrink-0 text-copper-800" />
            <span className="leading-tight">{t("home.bar.remote")}<span className="block text-sm font-semibold text-ink/60">{t("home.remoteHint")}</span></span>
          </Link>
          <Link href="/reserver" className="grad-btn flex min-h-14 items-center justify-center gap-2 px-6 text-lg font-bold">
            {t("home.bar.cta")} <ArrowRight aria-hidden="true" className="size-5" />
          </Link>
        </div>

        <div className="flex flex-col items-center gap-2">
          <ResumeBanner />
          <AudioHint
            text={t("home.audio")}
            lang={locale === "fr" ? "fr-FR" : "en-US"}
            listenLabel={t("audio.listen")}
            stopLabel={t("audio.stop")}
            label={t("audio.short")}
          />
        </div>
      </div>

      <HeroCarousel images={PORTRAITS} />
    </section>
  );
}
