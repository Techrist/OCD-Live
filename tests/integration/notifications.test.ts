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

describe.skipIf(!reachable)("notifications et rappels (étape 7)", () => {
  let db: typeof import("@/server/db").db;
  let booking: typeof import("@/server/services/booking");
  let notif: typeof import("@/server/services/notifications");
  const stamp = Date.now();
  const created = { users: [] as string[], slots: [] as string[], bookings: [] as string[] };

  async function seller(n: number) {
    const u = await db.user.create({ data: { phone: `+${String(stamp).slice(-10)}${n}`, role: "SELLER", name: `Test ${n}` } });
    created.users.push(u.id);
    return u;
  }
  async function slot(startsAt: Date) {
    const s = await db.slot.create({ data: { startsAt, endsAt: new Date(startsAt.getTime() + 5_400_000), mode: "ONSITE", capacity: 1 } });
    created.slots.push(s.id);
    return s;
  }

  beforeAll(async () => {
    ({ db } = await import("@/server/db"));
    booking = await import("@/server/services/booking");
    notif = await import("@/server/services/notifications");
  });

  afterAll(async () => {
    if (!reachable) return;
    await db.notification.deleteMany({ where: { OR: created.bookings.map((id) => ({ payload: { path: ["bookingId"], equals: id } })) } });
    const payments = await db.payment.findMany({ where: { bookingId: { in: created.bookings } }, select: { id: true } });
    await db.receipt.deleteMany({ where: { paymentId: { in: payments.map((p) => p.id) } } });
    await db.payment.deleteMany({ where: { id: { in: payments.map((p) => p.id) } } });
    await db.booking.deleteMany({ where: { id: { in: created.bookings } } });
    await db.slot.deleteMany({ where: { id: { in: created.slots } } });
    await db.user.deleteMany({ where: { id: { in: created.users } } });
  });

  it("chaque réservation confirmée produit une notification vendeur et une notification équipe", async () => {
    const pkg = await db.package.findFirstOrThrow({ where: { slug: "essai" } });
    const s = await seller(1);
    const sl = await slot(new Date(Date.UTC(2099, 1, 1, 8)));
    const b = await db.booking.create({ data: { reference: `TEST-${stamp}-N1`, sellerId: s.id, slotId: sl.id, packageId: pkg.id, mode: "ONSITE", amount: 15000 } });
    created.bookings.push(b.id);
    expect((await booking.holdBooking(b.id, s.id)).ok).toBe(true);
    await db.payment.create({ data: { bookingId: b.id, provider: "mock", method: "WAVE", amount: 15000, providerRef: `mock_n1_${stamp}`, payerPhone: s.phone } });

    await booking.processPaymentResult(`mock_n1_${stamp}`, "SUCCEEDED", {});
    await booking.processPaymentResult(`mock_n1_${stamp}`, "SUCCEEDED", {}); // webhook rejoué

    const rows = await db.notification.findMany({ where: { payload: { path: ["bookingId"], equals: b.id } } });
    expect(rows.filter((r) => r.template === "booking_confirmed" && r.to === s.phone)).toHaveLength(1);
    expect(rows.filter((r) => r.template === "team_new_booking").length).toBeGreaterThanOrEqual(2); // équipe WhatsApp + back-office
    expect(rows.some((r) => r.channel === "backoffice")).toBe(true);
  });

  it("le rappel J-1 part une seule fois, puis le rappel H-1", async () => {
    const pkg = await db.package.findFirstOrThrow({ where: { slug: "essai" } });
    const s = await seller(2);
    const now = new Date();
    const sl = await slot(new Date(now.getTime() + 20 * 3_600_000));
    const b = await db.booking.create({
      data: { reference: `TEST-${stamp}-N2`, sellerId: s.id, slotId: sl.id, packageId: pkg.id, mode: "ONSITE", amount: 15000, status: "CONFIRMED", createdAt: new Date(now.getTime() - 5 * 86_400_000) },
    });
    created.bookings.push(b.id);

    const first = await notif.sendDueReminders(now);
    const second = await notif.sendDueReminders(now);
    expect(first.d1).toBeGreaterThanOrEqual(1);
    expect(second.d1).toBe(0);
    const d1 = await db.notification.count({ where: { template: "reminder_d1", payload: { path: ["bookingId"], equals: b.id } } });
    expect(d1).toBe(1);

    const soon = new Date(sl.startsAt.getTime() - 30 * 60_000);
    expect((await notif.sendDueReminders(soon)).h1).toBeGreaterThanOrEqual(1);
    expect((await notif.sendDueReminders(soon)).h1).toBe(0);
  });
});
