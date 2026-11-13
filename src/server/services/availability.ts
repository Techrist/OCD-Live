import { dayKey } from "@/lib/time";

export type SlotRow = {
  id: string;
  startsAt: Date;
  endsAt: Date;
  mode: "ONSITE" | "REMOTE";
  capacity: number;
  status: "OPEN" | "CLOSED";
};

export type SlotView = { id: string; startsAt: string; endsAt: string; remaining: number };
export type DayView = { date: string; free: number; slots: SlotView[] };

/** Places restantes : créneau fermé ou passé => 0 ; sinon capacité moins les réservations actives. */
export function remainingPlaces(slot: SlotRow, taken: number, now: Date): number {
  if (slot.status !== "OPEN" || slot.startsAt <= now) return 0;
  return Math.max(0, slot.capacity - taken);
}

/** Regroupe les créneaux par jour (fuseau du studio) avec le nombre de créneaux libres (RES-03/04). */
export function summarizeDays(
  slots: SlotRow[],
  takenBySlot: Map<string, number>,
  studioTz: string,
  now: Date,
): DayView[] {
  const days = new Map<string, DayView>();
  for (const slot of [...slots].sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())) {
    const key = dayKey(slot.startsAt, studioTz);
    const day = days.get(key) ?? { date: key, free: 0, slots: [] };
    const remaining = remainingPlaces(slot, takenBySlot.get(slot.id) ?? 0, now);
    if (remaining > 0) day.free += 1;
    day.slots.push({ id: slot.id, startsAt: slot.startsAt.toISOString(), endsAt: slot.endsAt.toISOString(), remaining });
    days.set(key, day);
  }
  return [...days.values()];
}
