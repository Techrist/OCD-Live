import { fromZonedTime } from "date-fns-tz";
import { dayKey } from "./time";

// Fenêtres de validation de l'annuaire (ANN-01) : deux créneaux par jour, à l'heure du studio.
export type ValidationWindow = { label: string; startTime: string; endTime: string; active?: boolean };
export type WindowSpan = { label: string; start: Date; end: Date };

function spanOn(w: ValidationWindow, date: string, tz: string): WindowSpan {
  return { label: w.label, start: fromZonedTime(`${date}T${w.startTime}:00`, tz), end: fromZonedTime(`${date}T${w.endTime}:00`, tz) };
}

function addDays(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** Fenêtre ouverte à cet instant, ou null. */
export function currentWindow(windows: ValidationWindow[], now: Date, tz: string): WindowSpan | null {
  const today = dayKey(now, tz);
  for (const w of windows.filter((x) => x.active !== false)) {
    const span = spanOn(w, today, tz);
    if (span.start <= now && now < span.end) return span;
  }
  return null;
}

/** Prochaine ouverture (aujourd'hui plus tard, sinon demain). */
export function nextWindow(windows: ValidationWindow[], now: Date, tz: string): WindowSpan | null {
  const today = dayKey(now, tz);
  const spans = [0, 1].flatMap((offset) =>
    windows.filter((x) => x.active !== false).map((w) => spanOn(w, addDays(today, offset), tz)),
  );
  return spans.filter((s) => s.start > now).sort((a, b) => a.start.getTime() - b.start.getTime())[0] ?? null;
}
