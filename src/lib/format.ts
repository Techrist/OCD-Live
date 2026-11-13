import { formatInTimeZone } from "date-fns-tz";

/** Majuscule à la première lettre seulement (les jours et mois s'écrivent en minuscules en français). */
export const ucfirst = (s: string): string => (s ? s[0].toUpperCase() + s.slice(1) : s);

/** 90 -> « 1h30 », 240 -> « 4 h ». */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h}h${String(m).padStart(2, "0")}`;
}

/** 15000 -> « 15 000 F » (espaces insécables, FCFA sous-entendu). */
export function formatPrice(amount: number): string {
  return `${new Intl.NumberFormat("fr-FR").format(amount).replace(/[  ]/g, " ")} F`;
}

/** Prix de l'heure de live quand le package en contient plusieurs (PKG-02), sinon null. */
export function pricePerHour(price: number, liveCount: number, durationMinutes: number): number | null {
  const totalHours = (liveCount * durationMinutes) / 60;
  return totalHours > 1.5 ? Math.round(price / totalHours) : null;
}

/** Date et heure dans un fuseau donné, ex. « 01/12/2026 08:00 ». */
export function formatDateTime(date: Date, timeZone: string): string {
  return formatInTimeZone(date, timeZone, "dd/MM/yyyy HH:mm");
}

export function todayKey(timeZone: string, now: Date = new Date()): string {
  return formatInTimeZone(now, timeZone, "yyyy-MM-dd");
}
