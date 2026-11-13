"use client";

import { RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { firstIncompleteStep, stepNumber, STEP_COUNT } from "@/lib/booking-draft";
import { useBookingDraft } from "./use-booking-draft";

/** Bouton « Reprendre ma réservation » sur l'accueil quand un parcours est en cours (RES-06). */
export function ResumeBanner() {
  const t = useTranslations();
  const { draft, ready } = useBookingDraft();
  if (!ready || !draft.mode) return null;
  const step = firstIncompleteStep(draft);
  return (
    <Link
      href={`/reserver/${step}`}
      className="flex min-h-14 w-full items-center justify-center gap-3 rounded-3xl soft px-4 font-bold"
    >
      <RotateCcw className="size-5" aria-hidden="true" />
      {t("home.resume")} · {t("booking.step", { current: stepNumber(step), total: STEP_COUNT })}
    </Link>
  );
}
