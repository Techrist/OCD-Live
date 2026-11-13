"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { firstIncompleteStep } from "@/lib/booking-draft";
import { useBookingDraft } from "./use-booking-draft";

/** /reserver : reprend exactement à l'étape en cours (rechargement, coupure réseau). */
export function ResumeRedirect() {
  const router = useRouter();
  const { draft, ready } = useBookingDraft();
  useEffect(() => {
    if (ready) router.replace(`/reserver/${firstIncompleteStep(draft)}`);
  }, [ready, draft, router]);
  return null;
}
