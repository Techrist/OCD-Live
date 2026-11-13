import { addMinutes } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

// Logique métier pure (aucune dépendance à React ni à la base) : testable seule.

export type SlotConfig = {
  /** Fuseau du studio, ex. "Africa/Lome". */
  timezone: string;
  /** Heures de début de chaque créneau, heure du studio (ex. [8, 10, 12, 14, 16, 18]). */
  startHours: number[];
  durationMinutes: number;
  /** Jours fermés, 0 = dimanche. */
  closedWeekdays: number[];
  /** Capacité par mode : présentiel 1, distance = nombre d'assistantes. */
  capacity: { ONSITE: number; REMOTE: number };
};

export type GeneratedSlot = { startsAt: Date; endsAt: Date; mode: "ONSITE" | "REMOTE"; capacity: number };

/** Génère les créneaux d'un mois (« ouvrir un mois », ADM-03). Horaires stockés en UTC (règle 7). */
export function generateMonthSlots(year: number, month: number, config: SlotConfig): GeneratedSlot[] {
  const slots: GeneratedSlot[] = [];
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  for (let day = 1; day <= daysInMonth; day++) {
    // Jour de la semaine du calendrier (indépendant du fuseau).
    const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
    if (config.closedWeekdays.includes(weekday)) continue;
    for (const hour of config.startHours) {
      const local = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:00:00`;
      const startsAt = fromZonedTime(local, config.timezone);
      const endsAt = addMinutes(startsAt, config.durationMinutes);
      for (const mode of ["ONSITE", "REMOTE"] as const) {
        slots.push({ startsAt, endsAt, mode, capacity: config.capacity[mode] });
      }
    }
  }
  return slots;
}
