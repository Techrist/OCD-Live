import "dotenv/config";
import { Client } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

async function dbReachable() {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await c.connect();
    const r = await c.query("SELECT 1 FROM \"User\" WHERE role = 'ADMIN' LIMIT 1");
    return (r.rowCount ?? 0) > 0;
  } catch {
    return false;
  } finally {
    await c.end().catch(() => {});
  }
}
const reachable = await dbReachable();

describe.skipIf(!reachable)("back-office (étape 8)", () => {
  let db: typeof import("@/server/db").db;
  let admin: typeof import("@/server/services/admin");
  const phone = `+${String(Date.now()).slice(-11)}`;
  let actorId = "";
  const slotIds: string[] = [];

  beforeAll(async () => {
    ({ db } = await import("@/server/db"));
    admin = await import("@/server/services/admin");
    actorId = (await db.user.findFirstOrThrow({ where: { role: "ADMIN" } })).id;
  });

  afterAll(async () => {
    if (!reachable) return;
    const user = await db.user.findUnique({ where: { phone } });
    const bookings = await db.booking.findMany({ where: { sellerId: user?.id ?? "-" }, select: { id: true } });
    const ids = bookings.map((b) => b.id);
    await db.notification.deleteMany({ where: { OR: ids.map((id) => ({ payload: { path: ["bookingId"], equals: id } })) } });
    const payments = await db.payment.findMany({ where: { bookingId: { in: ids } }, select: { id: true } });
    await db.receipt.deleteMany({ where: { paymentId: { in: payments.map((p) => p.id) } } });
    await db.payment.deleteMany({ where: { id: { in: payments.map((p) => p.id) } } });
    await db.booking.deleteMany({ where: { id: { in: ids } } });
    await db.auditLog.deleteMany({ where: { entityId: { in: [...ids, "2099-3", "2099-03-02"] } } });
    await db.slot.deleteMany({ where: { startsAt: { gte: new Date(Date.UTC(2099, 0, 1)) } } });
    if (user) await db.user.delete({ where: { id: user.id } });
  });

  it("ouvre un mois sans écraser l'existant, ferme et rouvre un jour", async () => {
    const first = await admin.openMonth(2099, 3, actorId);
    expect(first).toBeGreaterThan(0);
    expect(await admin.openMonth(2099, 3, actorId)).toBe(0);
    expect(await admin.setDayClosed("2099-03-02", true, actorId)).toBeGreaterThan(0);
    const closed = await db.slot.count({ where: { startsAt: { gte: new Date(Date.UTC(2099, 2, 2)), lt: new Date(Date.UTC(2099, 2, 3)) }, status: "CLOSED" } });
    expect(closed).toBeGreaterThan(0);
    await admin.setDayClosed("2099-03-02", false, actorId);
    const slot = await db.slot.findFirstOrThrow({ where: { startsAt: { gte: new Date(Date.UTC(2099, 2, 3)) }, mode: "ONSITE", status: "OPEN" }, orderBy: { startsAt: "asc" } });
    slotIds.push(slot.id);
  });

  it("réservation assistée bloquée 24 h, puis encaissement au studio : confirmée avec reçu", async () => {
    const res = await admin.createAssistedBooking({ phone, packageSlug: "essai", slotId: slotIds[0], actorId });
    if (!res.ok) throw new Error(res.reason);
    const held = await db.booking.findUniqueOrThrow({ where: { id: res.id } });
    expect(held.status).toBe("HELD");
    expect(held.holdExpiresAt!.getTime()).toBeGreaterThan(Date.now() + 23 * 3_600_000);

    expect(await admin.recordStudioPayment(res.id, actorId)).toEqual({ ok: true });
    const done = await db.booking.findUniqueOrThrow({ where: { id: res.id }, include: { payments: { include: { receipt: true } } } });
    expect(done.status).toBe("CONFIRMED");
    expect(done.payments[0].method).toBe("CASH");
    expect(done.payments[0].receipt?.number).toMatch(/^R-\d{4}-\d{6}$/);
  });

  it("refuse une deuxième réservation sur un créneau présentiel complet", async () => {
    const res = await admin.createAssistedBooking({ phone: `+1${phone.slice(2)}`, packageSlug: "essai", slotId: slotIds[0], actorId });
    expect(res).toEqual({ ok: false, reason: "SLOT_FULL" });
  });
});
