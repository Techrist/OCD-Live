import "server-only";
import { detectPlatform } from "@/lib/platform";
import { currentWindow, nextWindow, type WindowSpan } from "@/lib/windows";
import { db } from "@/server/db";
import { getStudioTimezone } from "./catalog";
import { notifyLiveDecision } from "./notifications";
import { activeSubscriptionEnd } from "./subscriptions";

// Annuaire des lives (module 4). Règles : abonné actif, fenêtre de validation ouverte, un live expire en fin de fenêtre.

async function activeWindows() {
  return db.validationWindow.findMany({ where: { active: true }, orderBy: { startTime: "asc" } });
}

export type SubmitResult =
  | { ok: true; id: string; expiresAt: Date }
  | { ok: false; reason: "NO_PROFILE" | "NO_SUBSCRIPTION" | "INVALID_URL" | "DUPLICATE" }
  | { ok: false; reason: "OUTSIDE_WINDOW"; next: WindowSpan | null };

/** POST /api/lives : un seul champ à coller (ANN-02). Pays et catégorie viennent du profil. */
export async function submitLive(sellerId: string, rawUrl: string, now: Date = new Date()): Promise<SubmitResult> {
  const user = await db.user.findUnique({ where: { id: sellerId }, include: { sellerProfile: true } });
  if (!user?.sellerProfile || !user.countryCode) return { ok: false, reason: "NO_PROFILE" };
  if (!(await activeSubscriptionEnd(sellerId, now))) return { ok: false, reason: "NO_SUBSCRIPTION" };

  const [windows, tz] = await Promise.all([activeWindows(), getStudioTimezone()]);
  const open = currentWindow(windows, now, tz);
  if (!open) return { ok: false, reason: "OUTSIDE_WINDOW", next: nextWindow(windows, now, tz) };

  const detected = detectPlatform(rawUrl);
  if (!detected) return { ok: false, reason: "INVALID_URL" };
  const duplicate = await db.liveSubmission.count({
    where: { sellerId, url: detected.url, status: { in: ["PENDING", "PUBLISHED"] }, expiresAt: { gt: now } },
  });
  if (duplicate) return { ok: false, reason: "DUPLICATE" };

  const created = await db.liveSubmission.create({
    data: {
      sellerId,
      url: detected.url,
      platform: detected.platform,
      countryCode: user.countryCode,
      categoryId: user.sellerProfile.categoryId,
      status: "PENDING",
      expiresAt: open.end,
    },
  });
  return { ok: true, id: created.id, expiresAt: open.end };
}

export const REJECT_REASONS = ["PROHIBITED", "BAD_LINK", "NOT_LIVE", "OTHER"] as const;

export type DecisionResult = { ok: true } | { ok: false; reason: "NOT_FOUND" | "WINDOW_CLOSED" | "REASON_REQUIRED" };

/** POST /api/admin/lives/[id]/decision : valider ou refuser avec motif (ANN-03). */
export async function decideLive(
  id: string,
  actorId: string,
  decision: "VALIDATE" | "REJECT",
  reason: string | undefined,
  now: Date = new Date(),
): Promise<DecisionResult> {
  const live = await db.liveSubmission.findFirst({ where: { id, status: "PENDING" } });
  if (!live) return { ok: false, reason: "NOT_FOUND" };
  if (decision === "REJECT" && !reason?.trim()) return { ok: false, reason: "REASON_REQUIRED" };
  if (live.expiresAt && live.expiresAt <= now) {
    await db.liveSubmission.update({ where: { id }, data: { status: "ARCHIVED" } });
    return { ok: false, reason: "WINDOW_CLOSED" };
  }
  await db.liveSubmission.update({
    where: { id },
    data:
      decision === "VALIDATE"
        ? { status: "PUBLISHED", publishedAt: now, validatedById: actorId, rejectReason: null }
        : { status: "REJECTED", rejectReason: reason!.trim(), validatedById: actorId },
  });
  await db.auditLog.create({
    data: { actorId, action: decision === "VALIDATE" ? "live.validate" : "live.reject", entity: "LiveSubmission", entityId: id, data: { reason } },
  });
  await notifyLiveDecision(id);
  return { ok: true };
}

/** Lives visibles dans l'annuaire : publiés et pas encore expirés. */
export function publishedWhere(now: Date) {
  return { status: "PUBLISHED" as const, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] };
}

export async function liveCountsByCountry(now: Date = new Date()): Promise<Map<string, number>> {
  const rows = await db.liveSubmission.groupBy({ by: ["countryCode"], where: publishedWhere(now), _count: { _all: true } });
  return new Map(rows.map((r) => [r.countryCode, r._count._all]));
}

export function publishedLives(filter: { countryCode?: string; categoryId?: string }, now: Date = new Date()) {
  return db.liveSubmission.findMany({
    where: { ...publishedWhere(now), ...(filter.countryCode ? { countryCode: filter.countryCode } : {}), ...(filter.categoryId ? { categoryId: filter.categoryId } : {}) },
    include: {
      category: { select: { id: true, slug: true, name: true, icon: true } },
      seller: {
        select: {
          id: true, phone: true, city: true,
          sellerProfile: { select: { shopName: true, slug: true, verified: true, photoUrl: true } },
          products: { where: { active: true, photoKey: { not: null } }, orderBy: { createdAt: "desc" }, take: 1, select: { photoKey: true } },
        },
      },
    },
  });
}

/** Archive les lives dont la fenêtre est terminée (cron) : un live n'est jamais affiché hors direct (règle 5). */
export async function archiveExpiredLives(now: Date = new Date(), onlySellerIds?: string[]): Promise<number> {
  const res = await db.liveSubmission.updateMany({
    where: { status: { in: ["PUBLISHED", "PENDING"] }, expiresAt: { lte: now }, ...(onlySellerIds ? { sellerId: { in: onlySellerIds } } : {}) },
    data: { status: "ARCHIVED" },
  });
  return res.count;
}

/** File du validateur triée par heure de soumission, avec les indices pour repérer les cas douteux (ANN-08). */
export async function validationQueue(now: Date = new Date()) {
  const pending = await db.liveSubmission.findMany({
    where: { status: "PENDING", OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
    orderBy: { createdAt: "asc" },
    include: {
      category: { select: { name: true } },
      country: { select: { name: true } },
      seller: { select: { phone: true, name: true, sellerProfile: { select: { shopName: true, verified: true } } } },
    },
  });
  return Promise.all(
    pending.map(async (p) => {
      const [sameLink, previous] = await Promise.all([
        db.liveSubmission.count({ where: { url: p.url, id: { not: p.id }, status: { in: ["PENDING", "PUBLISHED"] } } }),
        db.liveSubmission.count({ where: { sellerId: p.sellerId, status: "PUBLISHED" } }),
      ]);
      return { ...p, flags: { duplicate: sameLink > 0, firstLive: previous === 0, verified: !!p.seller.sellerProfile?.verified } };
    }),
  );
}
