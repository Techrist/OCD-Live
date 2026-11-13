import { describe, expect, it } from "vitest";
import { cancellationPolicy, slotSpacingProblem } from "@/lib/cancellation";
import { detectPlatform } from "@/lib/platform";
import { shuffle } from "@/lib/shuffle";
import { currentWindow, nextWindow, type ValidationWindow } from "@/lib/windows";

const windows: ValidationWindow[] = [
  { label: "Matin", startTime: "08:00", endTime: "11:00" },
  { label: "Soir", startTime: "18:00", endTime: "21:00" },
];
const TZ = "Africa/Lome";

describe("fenêtres de validation (ANN-01, règle 4)", () => {
  it("détecte la fenêtre ouverte", () => {
    expect(currentWindow(windows, new Date("2026-12-01T09:30:00Z"), TZ)?.label).toBe("Matin");
    expect(currentWindow(windows, new Date("2026-12-01T19:00:00Z"), TZ)?.label).toBe("Soir");
    expect(currentWindow(windows, new Date("2026-12-01T14:00:00Z"), TZ)).toBeNull();
  });

  it("donne l'heure de la prochaine fenêtre hors créneau", () => {
    const n = nextWindow(windows, new Date("2026-12-01T14:00:00Z"), TZ)!;
    expect(n.label).toBe("Soir");
    expect(n.start.toISOString()).toBe("2026-12-01T18:00:00.000Z");
    // Après 21h : demain matin.
    expect(nextWindow(windows, new Date("2026-12-01T22:00:00Z"), TZ)!.start.toISOString()).toBe("2026-12-02T08:00:00.000Z");
  });

  it("respecte le fuseau (Douala = UTC+1 pour un studio à Douala)", () => {
    expect(currentWindow(windows, new Date("2026-12-01T07:30:00Z"), "Africa/Douala")?.label).toBe("Matin");
  });
});

describe("détection de plateforme par l'URL (ANN-02, ANN-09)", () => {
  it("reconnaît TikTok, Facebook, Instagram, YouTube", () => {
    expect(detectPlatform("https://www.tiktok.com/@mamarose/live")?.platform).toBe("TIKTOK");
    expect(detectPlatform("https://vm.tiktok.com/ZMabc/")?.platform).toBe("TIKTOK");
    expect(detectPlatform("https://fb.watch/xyz")?.platform).toBe("FACEBOOK");
    expect(detectPlatform("https://www.instagram.com/live")?.platform).toBe("INSTAGRAM");
    expect(detectPlatform("https://youtu.be/abc")?.platform).toBe("YOUTUBE");
  });

  it("refuse les liens mal formés ou d'autres sites (ANN-08)", () => {
    expect(detectPlatform("pas un lien")).toBeNull();
    expect(detectPlatform("javascript:alert(1)")).toBeNull();
    expect(detectPlatform("https://faux-tiktok.com/x")).toBeNull();
    expect(detectPlatform("https://tiktok.com.evil.org/x")).toBeNull();
  });
});

describe("rotation équitable (ANN-13)", () => {
  it("garde les mêmes éléments et change l'ordre selon le hasard", () => {
    const items = [1, 2, 3, 4, 5, 6];
    const a = shuffle(items, () => 0.1);
    const b = shuffle(items, () => 0.9);
    expect([...a].sort()).toEqual(items);
    expect(a).not.toEqual(b);
    expect(items).toEqual([1, 2, 3, 4, 5, 6]); // l'original n'est pas modifié
  });
});

describe("report et annulation (RES-13)", () => {
  const start = new Date("2026-12-10T08:00:00Z");
  it("report et remboursement jusqu'à 48 h avant", () => {
    expect(cancellationPolicy(start, new Date("2026-12-08T07:00:00Z"), 48)).toMatchObject({ canReschedule: true, refundable: true });
  });
  it("refuse le report à moins de 48 h", () => {
    const p = cancellationPolicy(start, new Date("2026-12-08T09:00:00Z"), 48);
    expect(p.canReschedule).toBe(false);
    expect(p.refundable).toBe(false);
  });
});

describe("battement entre créneaux (RES-08)", () => {
  it("accepte 1h30 + 30 min toutes les 2 h, refuse un écart trop court", () => {
    expect(slotSpacingProblem([8, 10, 12, 14, 16, 18], 90, 30)).toBeNull();
    expect(slotSpacingProblem([8, 9, 12], 90, 30)).toMatch(/trop proches/);
  });
});
