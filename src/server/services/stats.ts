import "server-only";
import { randomUUID } from "node:crypto";
import { todayKey } from "@/lib/format";
import { db } from "@/server/db";
import { getStudioTimezone } from "./catalog";

export const VISITOR_COOKIE = "ocd_vid";

export type StatKind = "VIEW" | "LIVE_CLICK" | "WHATSAPP_CLICK";

/** Identifiant anonyme du visiteur : lu dans le cookie, sinon créé (à poser sur la réponse). */
export function visitorFrom(req: Request): { id: string; isNew: boolean } {
  const cookie = req.headers.get("cookie")?.match(new RegExp(`(?:^|; )${VISITOR_COOKIE}=([^;]+)`))?.[1];
  return cookie ? { id: cookie, isNew: false } : { id: randomUUID(), isNew: true };
}

/** Un événement est compté une seule fois par visiteur, par jour et par type (contrainte unique en base). */
export async function recordEvent(sellerId: string, type: StatKind, visitorId: string, now: Date = new Date()): Promise<boolean> {
  const day = todayKey(await getStudioTimezone(), now);
  const res = await db.statEvent.createMany({ data: [{ sellerId, type, visitorId, day }], skipDuplicates: true });
  return res.count > 0;
}

/** Vues de la fiche, clics vers le live et vers WhatsApp sur les `days` derniers jours (ANN-16). */
export async function sellerStats(sellerId: string, days = 30, now: Date = new Date()) {
  const since = new Date(now.getTime() - days * 86_400_000);
  const rows = await db.statEvent.groupBy({ by: ["type"], where: { sellerId, createdAt: { gte: since } }, _count: { _all: true } });
  const count = (t: StatKind) => rows.find((r) => r.type === t)?._count._all ?? 0;
  return { views: count("VIEW"), liveClicks: count("LIVE_CLICK"), whatsappClicks: count("WHATSAPP_CLICK") };
}
