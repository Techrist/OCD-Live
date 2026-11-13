import { describe, expect, it } from "vitest";
import { canEnter, firstIncompleteStep, packageFitsMode, parseDraft } from "@/lib/booking-draft";
import { slotTimes } from "@/lib/time";
import { remainingPlaces, summarizeDays, type SlotRow } from "@/server/services/availability";

describe("reprise automatique (RES-06)", () => {
  it("un rechargement à l'étape 4 ramène à l'étape 4 avec les choix déjà faits", () => {
    const saved = JSON.stringify({ mode: "REMOTE", sellerDone: true, packageSlug: "essai", countryCode: "CM" });
    const draft = parseDraft(saved);
    expect(draft.packageSlug).toBe("essai");
    expect(firstIncompleteStep(draft)).toBe("creneau");
    expect(canEnter("creneau", draft)).toBe(true);
    expect(canEnter("paiement", draft)).toBe(false);
  });

  it("ignore un état corrompu", () => {
    expect(parseDraft("{pas du json")).toEqual({});
    expect(parseDraft(JSON.stringify({ mode: "AUTRE" }))).toEqual({});
    expect(firstIncompleteStep({})).toBe("mode");
  });

  it("filtre les packages selon le mode", () => {
    expect(packageFitsMode("BOTH", "REMOTE")).toBe(true);
    expect(packageFitsMode("ONSITE", "REMOTE")).toBe(false);
  });
});

describe("disponibilité des créneaux (RES-03/04)", () => {
  const now = new Date("2026-11-30T00:00:00Z");
  const mk = (id: string, iso: string, capacity: number, status: "OPEN" | "CLOSED" = "OPEN"): SlotRow => ({
    id, startsAt: new Date(iso), endsAt: new Date(new Date(iso).getTime() + 90 * 60_000), mode: "ONSITE", capacity, status,
  });

  it("un créneau plein ou fermé n'a plus de place", () => {
    expect(remainingPlaces(mk("a", "2026-12-01T08:00:00Z", 1), 1, now)).toBe(0);
    expect(remainingPlaces(mk("a", "2026-12-01T08:00:00Z", 2), 1, now)).toBe(1);
    expect(remainingPlaces(mk("a", "2026-12-01T08:00:00Z", 1, "CLOSED"), 0, now)).toBe(0);
    expect(remainingPlaces(mk("a", "2026-11-29T08:00:00Z", 1), 0, now)).toBe(0);
  });

  it("compte les créneaux libres par jour", () => {
    const slots = [mk("a", "2026-12-01T08:00:00Z", 1), mk("b", "2026-12-01T10:00:00Z", 1), mk("c", "2026-12-02T08:00:00Z", 1)];
    const days = summarizeDays(slots, new Map([["a", 1]]), "Africa/Lome", now);
    expect(days.map((d) => [d.date, d.free])).toEqual([["2026-12-01", 1], ["2026-12-02", 1]]);
    expect(days[0].slots[0].remaining).toBe(0);
  });
});

describe("fuseaux (RES-10)", () => {
  it("affiche l'heure locale seulement quand elle diffère de Lomé", () => {
    const t = new Date("2026-12-01T08:00:00Z");
    expect(slotTimes(t, "Africa/Lome", "Africa/Douala")).toEqual({ studio: "08:00", local: "09:00" });
    expect(slotTimes(t, "Africa/Lome", "Africa/Abidjan")).toEqual({ studio: "08:00", local: null });
  });
});
