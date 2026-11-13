"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Building2, Check, Home, Lightbulb, LockKeyhole, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { firstIncompleteStep, type BookingDraft } from "@/lib/booking-draft";
import { cn } from "@/lib/utils";
import { useBookingDraft } from "./use-booking-draft";

type Mode = "ONSITE" | "REMOTE";

/** Écran 1 (RES-01) : deux grandes cartes à choisir, puis « Continuer ». L'accueil envoie ?mode= pour passer directement. */
export function ModeChoice() {
  const t = useTranslations("booking.mode");
  const router = useRouter();
  const param = useSearchParams().get("mode");
  const { draft, ready, update } = useBookingDraft();
  const [picked, setPicked] = useState<Mode>();

  const fromHome: Mode | null = param === "ONSITE" || param === "REMOTE" ? param : null;
  const selected = picked ?? draft.mode;

  function save(mode: Mode) {
    const changed = draft.mode && draft.mode !== mode;
    const patch: Partial<BookingDraft> = { mode, ...(changed ? { slotId: undefined, bookingId: undefined } : {}) };
    update(patch);
    return firstIncompleteStep({ ...draft, ...patch });
  }

  useEffect(() => {
    if (!ready || !fromHome) return;
    router.replace(`/reserver/${save(fromHome)}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, fromHome]);

  const cards: { mode: Mode; icon: typeof Home; key: "studio" | "remote" }[] = [
    { mode: "ONSITE", icon: Building2, key: "studio" },
    { mode: "REMOTE", icon: Home, key: "remote" },
  ];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <ul className="flex flex-col gap-4" role="radiogroup" aria-label={t("label")}>
        {cards.map(({ mode, icon: Icon, key }) => {
          const on = selected === mode;
          return (
            <li key={mode}>
              <button
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setPicked(mode)}
                className={cn("soft flex w-full items-start gap-4 rounded-[2rem] p-5 text-left", on && "ring-2 ring-copper")}
              >
                <span aria-hidden="true" className={cn("grid size-16 shrink-0 place-items-center rounded-3xl", on ? "grad-btn" : "bg-wall-2 text-copper-800")}>
                  <Icon className="size-8" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-2">
                  <span className="text-2xl leading-tight font-bold">{t(`${key}.title`)}</span>
                  <span className="text-lg text-ink/80">{t(`${key}.text`)}</span>
                  <span className="flex flex-wrap gap-2">
                    {(["tag1", "tag2"] as const).map((tag) => (
                      <span key={tag} className="pill !bg-wall-2 !shadow-none"><Check aria-hidden="true" className="size-4 text-wa" /> {t(`${key}.${tag}`)}</span>
                    ))}
                  </span>
                </span>
                <span aria-hidden="true" className={cn("mt-1 grid size-8 shrink-0 place-items-center rounded-full", on ? "grad-btn" : "bg-wall-2")}>
                  {on && <Check className="size-5" />}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="soft flex items-center gap-3 rounded-3xl p-4 font-semibold">
        <Lightbulb aria-hidden="true" className="size-6 shrink-0 text-copper-800" /> {t("tip")}
      </p>

      <button
        type="button"
        disabled={!selected}
        onClick={() => selected && router.push(`/reserver/${save(selected)}`)}
        className="grad-btn flex min-h-16 w-full items-center justify-center gap-3 rounded-3xl text-xl font-bold disabled:opacity-50"
      >
        {t("continue")} <ArrowRight aria-hidden="true" className="size-6" />
      </button>

      <p className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm font-semibold text-ink/70">
        <span className="inline-flex items-center gap-1"><LockKeyhole aria-hidden="true" className="size-4 text-wa" /> {t("secure")}</span>
        <span className="inline-flex items-center gap-1"><MessageCircle aria-hidden="true" className="size-4 text-copper-800" /> {t("assist")}</span>
      </p>
    </div>
  );
}
