import "dotenv/config";
import { Client } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

async function dbReachable() {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await c.connect();
    const r = await c.query("SELECT 1 FROM \"ValidationWindow\" LIMIT 1");
    return (r.rowCount ?? 0) > 0;
  } catch {
    return false;
  } finally {
    await c.end().catch(() => {});
  }
}
const reachable = await dbReachable();

describe.skipIf(!reachable)("V1 : abonnement, annuaire, report, check-in (étapes 11 à 14)", () => {
  let db: typeof import("@/server/db").db;
  let booking: typeof import("@/server/services/booking");
  let subs: typeof import("@/server/services/subscriptions");
  let dir: typeof import("@/server/services/directory");
  let stats: typeof import("@/server/services/stats");
  let res: typeof import("@/server/services/reservations");
  let notif: typeof import("@/server/services/notifications");
  const stamp = String(Date.now());
  const made = { users: [] as string[], slots: [] as string[] };
  let sellerId = "";
  let adminId = "";
  const NOW = new Date("2099-01-05T09:00:00Z"); // 09:00 à Lomé : fenêtre « Matin » ouverte
  const LATER = new Date("2099-01-05T14:00:00Z"); // entre les deux fenêtres

  beforeAll(async () => {
    ({ db } = await import("@/server/db"));
    booking = await import("@/server/services/booking");
    subs = await import("@/server/services/subscriptions");
    dir = await import("@/server/services/directory");
    stats = await import("@/server/services/stats");
    res = await import("@/server/services/reservations");
    notif = await import("@/server/services/notifications");
    adminId = (await db.user.findFirstOrThrow({ where: { role: "ADMIN" } })).id;
    const category = await db.category.findFirstOrThrow();
    const user = await db.user.create({ data: { phone: `+${stamp.slice(-11)}`, role: "SELLER", name: "V1 Test", countryCode: "CM", city: "Douala" } });
    made.users.push(user.id);
    sellerId = user.id;
    await db.sellerProfile.create({ data: { userId: user.id, slug: `v1-test-${stamp}`, shopName: "Boutique V1", activity: "Test", categoryId: category.id } });
  });

  afterAll(async () => {
    if (!reachable) return;
    const bookings = await db.booking.findMany({ where: { sellerId: { in: made.users } }, select: { id: true } });
    const bIds = bookings.map((b) => b.id);
    const subRows = await db.subscription.findMany({ where: { sellerId: { in: made.users } }, select: { id: true } });
    const payments = await db.payment.findMany({ where: { OR: [{ bookingId: { in: bIds } }, { subscriptionId: { in: subRows.map((s) => s.id) } }] }, select: { id: true } });
    await db.notification.deleteMany({ where: { OR: [...bIds, ...subRows.map((s) => s.id)].flatMap((id) => [{ payload: { path: ["bookingId"], equals: id } }, { payload: { path: ["subscriptionId"], equals: id } }]) } });
    await db.notification.deleteMany({ where: { template: { in: ["live_validated", "live_rejected", "waitlist_slot_free"] }, to: { in: (await db.user.findMany({ where: { id: { in: made.users } } })).map((u) => u.phone) } } });
    await db.receipt.deleteMany({ where: { paymentId: { in: payments.map((p) => p.id) } } });
    await db.payment.deleteMany({ where: { id: { in: payments.map((p) => p.id) } } });
    await db.booking.deleteMany({ where: { id: { in: bIds } } });
    await db.subscription.deleteMany({ where: { id: { in: subRows.map((s) => s.id) } } });
    await db.liveSubmission.deleteMany({ where: { sellerId: { in: made.users } } });
    await db.statEvent.deleteMany({ where: { sellerId: { in: made.users } } });
    await db.waitlistEntry.deleteMany({ where: { sellerId: { in: made.users } } });
    await db.auditLog.deleteMany({ where: { entityId: { in: bIds } } });
    await db.slot.deleteMany({ where: { id: { in: made.slots } } });
    await db.sellerProfile.deleteMany({ where: { userId: { in: made.users } } });
    await db.user.deleteMany({ where: { id: { in: made.users } } });
  });

  async function slot(startsAt: Date, capacity = 1) {
    const s = await db.slot.create({ data: { startsAt, endsAt: new Date(startsAt.getTime() + 5_400_000), mode: "ONSITE", capacity } });
    made.slots.push(s.id);
    return s;
  }
  async function confirmedBooking(startsAt: Date, createdAt?: Date) {
    const pkg = await db.package.findFirstOrThrow({ where: { slug: "essai" } });
    const s = await slot(startsAt);
    const b = await db.booking.create({
      data: { reference: `TEST-${stamp}-${made.slots.length}`, sellerId, slotId: s.id, packageId: pkg.id, mode: "ONSITE", amount: 15000, status: "CONFIRMED", createdAt },
    });
    const p = await db.payment.create({ data: { bookingId: b.id, provider: "mock", method: "WAVE", amount: 15000, status: "SUCCEEDED", providerRef: `mock_v1_${stamp}_${b.id}`, payerPhone: "+22890000009" } });
    return { b, s, p };
  }

  it("l'abonnement s'active 30 jours après paiement, une seule fois, et un renouvellement s'ajoute à la suite", async () => {
    const mk = async (ref: string) => {
      const sub = await db.subscription.create({ data: { sellerId, status: "PENDING", startsAt: new Date(), endsAt: new Date() } });
      await db.payment.create({ data: { subscriptionId: sub.id, provider: "mock", method: "WAVE", amount: 5000, providerRef: ref, payerPhone: "+22890000009" } });
      return sub;
    };
    const first = await mk(`mock_sub1_${stamp}`);
    expect(await booking.processPaymentResult(`mock_sub1_${stamp}`, "SUCCEEDED", {})).toMatchObject({ outcome: "CONFIRM" });
    expect(await booking.processPaymentResult(`mock_sub1_${stamp}`, "SUCCEEDED", {})).toMatchObject({ outcome: "IGNORE" });
    const a = await db.subscription.findUniqueOrThrow({ where: { id: first.id } });
    expect(a.status).toBe("ACTIVE");
    expect(Math.round((a.endsAt.getTime() - a.startsAt.getTime()) / 86_400_000)).toBe(30);
    expect(await db.receipt.count({ where: { payment: { subscriptionId: first.id } } })).toBe(1);
    expect(await subs.activeSubscriptionEnd(sellerId)).not.toBeNull();

    const second = await mk(`mock_sub2_${stamp}`);
    await booking.processPaymentResult(`mock_sub2_${stamp}`, "SUCCEEDED", {});
    const b = await db.subscription.findUniqueOrThrow({ where: { id: second.id } });
    expect(b.startsAt.getTime()).toBe(a.endsAt.getTime()); // renouvellement à la suite, sans perdre de jours
    await db.subscription.updateMany({ where: { sellerId }, data: { status: "CANCELLED" } }); // repart de zéro pour la suite
  });

  it("un abonnement expiré bloque la soumission ; hors fenêtre, refus avec l'heure de la prochaine fenêtre", async () => {
    expect(await dir.submitLive(sellerId, "https://www.tiktok.com/@x/live", NOW)).toMatchObject({ ok: false, reason: "NO_SUBSCRIPTION" });
    await db.subscription.create({ data: { sellerId, status: "ACTIVE", startsAt: new Date("2099-01-01T00:00:00Z"), endsAt: new Date("2099-02-01T00:00:00Z") } });

    const outside = await dir.submitLive(sellerId, "https://www.tiktok.com/@x/live", LATER);
    expect(outside).toMatchObject({ ok: false, reason: "OUTSIDE_WINDOW" });
    if (!outside.ok && outside.reason === "OUTSIDE_WINDOW") expect(outside.next?.start.toISOString()).toBe("2099-01-05T18:00:00.000Z");

    expect(await dir.submitLive(sellerId, "pas un lien", NOW)).toMatchObject({ ok: false, reason: "INVALID_URL" });
    const ok = await dir.submitLive(sellerId, "https://www.tiktok.com/@x/live", NOW);
    expect(ok).toMatchObject({ ok: true });
    expect(await dir.submitLive(sellerId, "https://www.tiktok.com/@x/live", NOW)).toMatchObject({ ok: false, reason: "DUPLICATE" });
  });

  it("validation : refus avec motif obligatoire, publication visible dans le pays et la catégorie, archivage en fin de fenêtre", async () => {
    const live = await db.liveSubmission.findFirstOrThrow({ where: { sellerId, status: "PENDING" } });
    expect(await dir.decideLive(live.id, adminId, "REJECT", "", NOW)).toMatchObject({ reason: "REASON_REQUIRED" });
    expect(await dir.decideLive(live.id, adminId, "VALIDATE", undefined, NOW)).toEqual({ ok: true });

    const visible = await dir.publishedLives({ countryCode: "CM", categoryId: live.categoryId }, NOW);
    expect(visible.some((l) => l.id === live.id)).toBe(true);
    expect((await dir.publishedLives({ countryCode: "TG" }, NOW)).some((l) => l.id === live.id)).toBe(false);
    expect(await db.notification.count({ where: { template: "live_validated", payload: { path: ["submissionId"], equals: live.id } } })).toBe(1);

    const afterWindow = new Date("2099-01-05T11:30:00Z");
    expect(await dir.archiveExpiredLives(afterWindow, made.users)).toBeGreaterThanOrEqual(1);
    expect((await dir.publishedLives({ countryCode: "CM" }, afterWindow)).some((l) => l.id === live.id)).toBe(false);
  });

  it("chaque clic est compté une fois par visiteur et par jour", async () => {
    expect(await stats.recordEvent(sellerId, "LIVE_CLICK", "visiteur-a", NOW)).toBe(true);
    expect(await stats.recordEvent(sellerId, "LIVE_CLICK", "visiteur-a", NOW)).toBe(false);
    expect(await stats.recordEvent(sellerId, "LIVE_CLICK", "visiteur-b", NOW)).toBe(true);
    expect(await stats.recordEvent(sellerId, "VIEW", "visiteur-a", NOW)).toBe(true);
    expect((await stats.sellerStats(sellerId, 30, new Date())).liveClicks).toBe(2);
  });

  it("un report à moins de 48 h est refusé avec un message clair, au-delà il est accepté", async () => {
    const soon = await confirmedBooking(new Date(Date.now() + 10 * 3_600_000));
    const target = await slot(new Date(Date.now() + 9 * 86_400_000));
    expect(await res.rescheduleBooking(soon.b.id, sellerId, target.id)).toMatchObject({ ok: false, reason: "TOO_LATE", freeHours: 48 });

    const far = await confirmedBooking(new Date(Date.now() + 6 * 86_400_000));
    expect(await res.rescheduleBooking(far.b.id, sellerId, target.id)).toEqual({ ok: true });
    expect((await db.booking.findUniqueOrThrow({ where: { id: far.b.id } })).slotId).toBe(target.id);
  });

  it("annulation : remboursée à plus de 48 h, sans remboursement en dessous", async () => {
    const far = await confirmedBooking(new Date(Date.now() + 7 * 86_400_000));
    expect(await res.cancelBySeller(far.b.id, sellerId)).toEqual({ ok: true, refunded: true });
    expect((await db.payment.findUniqueOrThrow({ where: { id: far.p.id } })).status).toBe("REFUNDED");

    const soon = await confirmedBooking(new Date(Date.now() + 12 * 3_600_000));
    expect(await res.cancelBySeller(soon.b.id, sellerId)).toEqual({ ok: true, refunded: false });
    expect((await db.payment.findUniqueOrThrow({ where: { id: soon.p.id } })).status).toBe("SUCCEEDED");
  });

  it("liste d'attente : un désistement prévient le vendeur inscrit", async () => {
    const full = await confirmedBooking(new Date(Date.now() + 8 * 86_400_000));
    const other = await db.user.create({ data: { phone: `+${stamp.slice(-10)}7`, role: "SELLER" } });
    made.users.push(other.id);
    expect(await res.joinWaitlist(full.s.id, other.id)).toEqual({ ok: true });
    const spare = await slot(new Date(Date.now() + 8.5 * 86_400_000));
    expect(await res.joinWaitlist(spare.id, other.id)).toMatchObject({ ok: false, reason: "NOT_FULL" });

    await res.cancelBySeller(full.b.id, sellerId);
    expect(await db.notification.count({ where: { template: "waitlist_slot_free", to: other.phone } })).toBe(1);
    expect(await db.waitlistEntry.count({ where: { slotId: full.s.id } })).toBe(0);
    expect(await notif.notifyWaitlist(full.s.id)).toBe(0);
  });

  it("check-in par QR : trop tôt refusé, puis enregistré ; après le créneau : terminé ou absent", async () => {
    const early = await confirmedBooking(new Date(Date.now() + 5 * 3_600_000));
    expect(await res.checkIn(early.b.reference, adminId)).toMatchObject({ ok: false, reason: "TOO_EARLY" });

    const now = await confirmedBooking(new Date(Date.now() + 30 * 60_000));
    expect(await res.checkIn(now.b.reference, adminId)).toEqual({ ok: true, alreadyDone: false });
    expect(await res.checkIn(now.b.reference, adminId)).toEqual({ ok: true, alreadyDone: true });

    const missed = await confirmedBooking(new Date(Date.now() - 3 * 3_600_000));
    const finished = await res.completeFinishedBookings(new Date());
    expect(finished.noShow).toBeGreaterThanOrEqual(1);
    expect((await db.booking.findUniqueOrThrow({ where: { id: missed.b.id } })).status).toBe("NO_SHOW");
  });
});
