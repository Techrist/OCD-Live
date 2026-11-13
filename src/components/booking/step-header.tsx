import { ArrowLeft, Check } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { AudioHint } from "@/components/ui/audio-hint";
import { Link } from "@/i18n/navigation";
import { STEPS, STEP_COUNT, stepNumber, type Step } from "@/lib/booking-draft";
import { cn } from "@/lib/utils";

/** Indicateur des 5 étapes : Mode, Vendeur, Offre, Date, Paiement (validée, en cours, à venir). */
export function Stepper({ step, allDone = false }: { step: Step; allDone?: boolean }) {
  const t = useTranslations("booking.steps");
  const current = stepNumber(step);
  return (
    <ol className="soft flex w-full items-start rounded-3xl px-3 py-4 sm:px-6" aria-label={t("label")}>
      {STEPS.map((s, i) => {
        const n = i + 1;
        const done = allDone || n < current;
        const active = !allDone && n === current;
        return (
          <li key={s} aria-current={active ? "step" : undefined} className="relative flex flex-1 flex-col items-center gap-1 text-center">
            {i > 0 && (
              <span aria-hidden="true" className={cn("absolute top-[1.125rem] right-1/2 h-0.5 w-full", n <= current || allDone ? "bg-wa" : "bg-ink/10")} />
            )}
            <span
              className={cn(
                "relative grid size-9 place-items-center rounded-full text-base font-bold",
                done && "bg-wa text-white",
                active && "grad-btn",
                !done && !active && "bg-wall-2 text-ink/50",
              )}
            >
              {done ? <Check aria-hidden="true" className="size-5" /> : n}
            </span>
            <span className={cn("text-xs font-bold sm:text-sm", active ? "text-copper-800" : done ? "text-ink" : "text-ink/50", !active && "max-sm:sr-only")}>
              {t(s)}
            </span>
            <span className={cn("hidden text-xs font-semibold sm:block", done ? "text-wa" : active ? "text-copper-800" : "text-ink/40")}>
              {done ? t("done") : active ? t("current") : t("upcoming")}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** En-tête commun des écrans : retour, « Étape X sur 5 », indicateur d'étapes, question unique, bouton audio. */
export function StepHeader({ step, title, audio, eyebrow, subtitle }: { step: Step; title: string; audio: string; eyebrow?: string; subtitle?: string }) {
  const t = useTranslations();
  const locale = useLocale();
  const current = stepNumber(step);
  const previous = current > 1 ? STEPS[current - 2] : null;
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <Link href={previous ? `/reserver/${previous}` : "/"} className="inline-flex min-h-12 items-center gap-2 font-bold">
          <ArrowLeft aria-hidden="true" className="size-5" /> {t("booking.back")}
        </Link>
        <p className="pill">{t("booking.stepOf", { current, total: STEP_COUNT })}</p>
      </div>
      <Stepper step={step} />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="max-w-2xl">
          {eyebrow && <p className="text-sm font-bold tracking-wide text-copper-800 uppercase">{eyebrow}</p>}
          <h1 className="text-[1.9rem] leading-tight font-bold md:text-4xl">{title}</h1>
          {subtitle && <p className="mt-1 text-lg text-ink/80">{subtitle}</p>}
        </div>
        <AudioHint
          text={audio}
          lang={locale === "fr" ? "fr-FR" : "en-US"}
          listenLabel={t("audio.listen")}
          stopLabel={t("audio.stop")}
          label={t("audio.short")}
        />
      </div>
    </div>
  );
}
