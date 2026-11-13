"use client";

import { ArrowRight, CalendarRange, Check, Clapperboard, Megaphone, MessageCircle, ShieldCheck, Sparkles, Star, Video, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { formatDuration, formatPrice, pricePerHour } from "@/lib/format";
import { packageFitsMode } from "@/lib/booking-draft";
import { cn } from "@/lib/utils";
import { useStepGuard } from "./use-booking-draft";

export type PackageView = {
  slug: string; name: string; mode: "ONSITE" | "REMOTE" | "BOTH"; durationMinutes: number; liveCount: number;
  price: number; features: string[]; highlighted: boolean; quoteOnly: boolean;
};

// Pictogramme par offre (le texte reste court : l'image porte le sens).
const ICONS: Record<string, LucideIcon> = {
  essai: Sparkles, "studio-long": Clapperboard, "pack-4-lives": Video, "annonce-bovan": Megaphone,
  mensuel: CalendarRange, "sur-mesure": MessageCircle,
};

/** Écran 3 (PKG-01, PKG-02) : une carte par offre, la plus choisie est mise en avant ; « sur mesure » passe par WhatsApp. */
export function PackageStep({ packages, whatsappHref }: { packages: PackageView[]; whatsappHref: string }) {
  const t = useTranslations("booking.package");
  const router = useRouter();
  const { draft, update, allowed } = useStepGuard("package");
  if (!allowed || !draft.mode) return null;
  const mode = draft.mode;

  return (
    <div className="flex flex-col gap-6">
      <ul className="grid gap-5 pt-3 md:grid-cols-2 lg:grid-cols-3">
        {packages.filter((p) => packageFitsMode(p.mode, mode)).map((p) => {
          const Icon = ICONS[p.slug] ?? Sparkles;
          const hour = pricePerHour(p.price, p.liveCount, p.durationMinutes);
          return (
            <li key={p.slug} className={cn("soft relative flex flex-col gap-4 rounded-[2rem] p-5", p.highlighted && "ring-2 ring-copper")}>
              {p.highlighted && (
                <span className="grad-btn absolute -top-3 left-5 inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold">
                  <Star aria-hidden="true" className="size-4" /> {t("mostChosen")}
                </span>
              )}
              <div className="flex items-start justify-between gap-2">
                <span aria-hidden="true" className={cn("grid size-14 place-items-center rounded-2xl", p.highlighted ? "grad-btn" : "bg-wall-2 text-copper-800")}>
                  <Icon className="size-7" />
                </span>
                <span className="pill !bg-wall-2 !shadow-none">{p.quoteOnly ? t("custom") : t("live", { count: p.liveCount })}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{p.name}</h2>
                {!p.quoteOnly && <p className="font-semibold text-ink/70">{t("duration", { duration: formatDuration(p.durationMinutes) })}</p>}
              </div>
              <div>
                <p className={cn("text-4xl font-bold tabular-nums", p.quoteOnly ? "text-wa" : "text-copper-800")}>
                  {p.quoteOnly ? t("quote") : <>{formatPrice(p.price).replace(/ F$/, "")} <span className="text-lg">FCFA</span></>}
                </p>
                {hour && !p.quoteOnly && <p className="text-sm font-bold text-ink/70">{t("perHour", { price: formatPrice(hour) })}</p>}
              </div>
              <ul className="flex flex-1 flex-col gap-2">
                {p.features.slice(0, 3).map((f) => (
                  <li key={f} className="flex items-start gap-2 font-semibold">
                    <Check aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-wa" /> {f}
                  </li>
                ))}
              </ul>
              {p.quoteOnly ? (
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-wa text-lg font-bold text-white">
                  <MessageCircle aria-hidden="true" className="size-5" /> {t("quoteCta")}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => { update({ packageSlug: p.slug }); router.push("/reserver/creneau"); }}
                  className={cn("flex min-h-14 items-center justify-center gap-2 rounded-2xl text-lg font-bold", p.highlighted ? "grad-btn" : "soft")}
                >
                  {t("chooseNamed", { name: p.name })} <ArrowRight aria-hidden="true" className="size-5" />
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <section className="soft flex items-start gap-4 rounded-[2rem] p-5" aria-label={t("guaranteeTitle")}>
        <ShieldCheck aria-hidden="true" className="size-8 shrink-0 text-copper-800" />
        <div>
          <h2 className="text-lg font-bold">{t("guaranteeTitle")}</h2>
          <p className="text-ink/80">{t("guaranteeText")}</p>
        </div>
      </section>
    </div>
  );
}
