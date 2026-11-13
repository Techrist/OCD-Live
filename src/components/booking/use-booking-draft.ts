"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { useRouter } from "@/i18n/navigation";
import { canEnter, DRAFT_KEY, firstIncompleteStep, parseDraft, type BookingDraft, type Step } from "@/lib/booking-draft";

const EVENT = "ocd-draft";

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
function read(): string | null {
  try {
    return localStorage.getItem(DRAFT_KEY);
  } catch {
    return null;
  }
}

/** État du parcours de réservation, persistant (localStorage) et partagé entre les écrans. */
export function useBookingDraft() {
  // `undefined` côté serveur : permet de savoir quand le navigateur a lu l'état (ready).
  const raw = useSyncExternalStore(subscribe, read, () => undefined);
  const ready = raw !== undefined;
  const draft = useMemo(() => parseDraft(raw ?? null), [raw]);

  const update = useCallback((patch: Partial<BookingDraft>) => {
    const next = { ...parseDraft(read()), ...patch };
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
    } catch {
      /* stockage indisponible : l'état reste valable le temps de la page */
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { draft, ready, update, clear };
}

/** Garde d'étape : renvoie à la première étape incomplète si on arrive trop loin (ex. lien direct). */
export function useStepGuard(step: Step) {
  const router = useRouter();
  const { draft, ready, update } = useBookingDraft();
  const allowed = ready && canEnter(step, draft);
  useEffect(() => {
    if (ready && !canEnter(step, draft)) router.replace(`/reserver/${firstIncompleteStep(draft)}`);
  }, [ready, draft, step, router]);
  return { draft, update, allowed };
}
