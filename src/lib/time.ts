import { formatInTimeZone } from "date-fns-tz";

/** Jour calendaire (AAAA-MM-JJ) d'un instant UTC dans un fuseau donné. */
export function dayKey(date: Date, timeZone: string): string {
  return formatInTimeZone(date, timeZone, "yyyy-MM-dd");
}

export function hourLabel(date: Date, timeZone: string): string {
  return formatInTimeZone(date, timeZone, "HH:mm");
}

/**
 * Horaire affiché à l'heure de Lomé et à l'heure du pays du vendeur quand elles diffèrent (RES-10).
 * `local` vaut null quand les deux heures sont identiques.
 */
export function slotTimes(startsAt: Date, studioTz: string, sellerTz?: string | null) {
  const studio = hourLabel(startsAt, studioTz);
  const local = sellerTz ? hourLabel(startsAt, sellerTz) : null;
  return { studio, local: local && local !== studio ? local : null };
}
