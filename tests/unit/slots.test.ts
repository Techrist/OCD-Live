import { describe, expect, it } from "vitest";
import { generateMonthSlots, type SlotConfig } from "@/server/services/slots";

const config: SlotConfig = {
  timezone: "Africa/Lome",
  startHours: [8, 10, 12, 14, 16, 18],
  durationMinutes: 90,
  closedWeekdays: [0],
  capacity: { ONSITE: 1, REMOTE: 2 },
};

describe("génération des créneaux (ADM-03, RES-03/04)", () => {
  const slots = generateMonthSlots(2026, 12, config);

  it("ouvre 6 créneaux x 2 modes par jour, sauf le dimanche", () => {
    // Décembre 2026 : 31 jours dont 4 dimanches (6, 13, 20, 27) => 27 jours ouverts.
    expect(slots).toHaveLength(27 * 6 * 2);
    expect(slots.some((s) => s.startsAt.getUTCDay() === 0)).toBe(false);
  });

  it("applique la capacité par mode (1 en présentiel, 2 à distance)", () => {
    expect(slots.filter((s) => s.mode === "ONSITE").every((s) => s.capacity === 1)).toBe(true);
    expect(slots.filter((s) => s.mode === "REMOTE").every((s) => s.capacity === 2)).toBe(true);
  });

  it("dure 1h30 et stocke en UTC (Lomé = UTC+0)", () => {
    const first = slots[0];
    expect(first.startsAt.toISOString()).toBe("2026-12-01T08:00:00.000Z");
    expect(first.endsAt.getTime() - first.startsAt.getTime()).toBe(90 * 60_000);
  });

  it("convertit correctement un fuseau décalé (Douala = UTC+1)", () => {
    const douala = generateMonthSlots(2026, 12, { ...config, timezone: "Africa/Douala" });
    expect(douala[0].startsAt.toISOString()).toBe("2026-12-01T07:00:00.000Z");
  });
});
