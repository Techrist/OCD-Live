"use client";

import { useEffect } from "react";
import { useBookingDraft } from "./use-booking-draft";

/** Une fois la réservation confirmée, le parcours repart de zéro (le vendeur reste connecté). */
export function ClearDraft() {
  const { ready, clear } = useBookingDraft();
  useEffect(() => {
    if (ready) clear();
  }, [ready, clear]);
  return null;
}
