import "dotenv/config";
import { Client } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Tests contre la vraie base PostgreSQL (npm run dev:db). Ignorés si elle n'est pas joignable.
async function dbReachable() {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await c.connect();
    await c.query("SELECT 1 FROM \"Setting\" WHERE key = 'booking.holdMinutes'").then((r) => {
      if (r.rowCount === 0) throw new Error("base non initialisée");
    });
    return true;
  } catch {
    return false;
  } finally {
    await c.end().catch(() => {});
  }
}
const reachable = await dbReachable();

describe.skipIf(!reachable)("réservation et paiement sur PostgreSQL", () => {
  let db: typeof import("@/server/db").db;
  let svc: typeof import("@/server/services/booking");
  const stamp = Date.now();
  const ids = { users: [] as string[], slot: "", pkg: "" };

  async function makeBooking(slotId: string, n: number) {
    const user = await db.user.create({ data: { phone: `+${String(stamp).slice(-10)}${n}`, role: "SELLER" } });
    ids.users.push(user.id);
    const b = await db.booking.create({
      data: { reference: `TEST-${stamp}-${n}`, sellerId: user.id, slotId, packageId: ids.pkg, mode: "ONSITE", amount: 15000 },
    });
    return { user, booking: b };
  }

  beforeAll(async () => {
    ({ db } = await import("@/server/db"));
    svc = await import("@/server/services/booking");
    ids.pkg = (await db.package.findFirstOrThrow({ where: { slug: "essai" } })).id;
    const starts = new Date(Date.UTC(2099, 0, 1, 8));
    ids.slot = (
      await db.slot.create({ data: { startsAt: starts, endsAt: new Date(starts.getTime() + 5_400_000), mode: "ONSITE", capacity: 1 } })
    ).id;
  });

  afterAll(async () => {
    if (!reachable) return;
    const bookings = await db.booking.findMany({ where: { sellerId: { in: ids.users } }, select: { id: true } });
    const payments = await db.payment.findMany({ where: { bookingId: { in: bookings.map((b) => b.id) } }, select: { id: true } });
    await db.receipt.deleteMany({ where: { paymentId: { in: payments.map((p) => p.id) } } });
    await db.payment.deleteMany({ where: { id: { in: payments.map((p) => p.id) } } });
    await db.booking.deleteMany({ where: { id: { in: bookings.map((b) => b.id) } } });
    await db.slot.deleteMany({ where: { id: ids.slot } });
    await db.user.deleteMany({ where: { id: { in: ids.users } } });
  });

  it("deux personnes valident le dernier créneau en même temps : une seule passe", async () => {
    const a = await makeBooking(ids.slot, 1);
    const b = await makeBooking(ids.slot, 2);
    const [ra, rb] = await Promise.all([svc.holdBooking(a.booking.id, a.user.id), svc.holdBooking(b.booking.id, b.user.id)]);
    expect([ra.ok, rb.ok].filter(Boolean)).toHaveLength(1);
    expect([ra, rb].find((r) => !r.ok)).toMatchObject({ reason: "SLOT_FULL" });
  });

  it("un blocage non payé libère le créneau après 10 minutes", async () => {
    const held = await db.booking.findFirstOrThrow({ where: { slotId: ids.slot, status: "HELD" } });
    expect(held.holdExpiresAt!.getTime()).toBeGreaterThan(Date.now() + 9 * 60_000);
    const later = new Date(Date.now() + 11 * 60_000);
    expect(await svc.expireHolds(later)).toBeGreaterThanOrEqual(1);
    const c = await makeBooking(ids.slot, 3);
    expect((await svc.holdBooking(c.booking.id, c.user.id, later)).ok).toBe(true);
  });

  it("un webhook reçu deux fois ne crée qu'un paiement confirmé et un reçu", async () => {
    const booking = await db.booking.findFirstOrThrow({ where: { slotId: ids.slot, status: "HELD" } });
    const payment = await db.payment.create({
      data: { bookingId: booking.id, provider: "mock", method: "WAVE", amount: 15000, providerRef: `mock_test_${stamp}`, payerPhone: "+22890000009" },
    });
    const first = await svc.processPaymentResult(payment.providerRef, "SUCCEEDED", {});
    const second = await svc.processPaymentResult(payment.providerRef, "SUCCEEDED", {});
    expect(first).toMatchObject({ ok: true, outcome: "CONFIRM" });
    expect(second).toMatchObject({ ok: true, outcome: "IGNORE" });
    expect(await db.receipt.count({ where: { paymentId: payment.id } })).toBe(1);
    expect((await db.booking.findUniqueOrThrow({ where: { id: booking.id } })).status).toBe("CONFIRMED");
  });

  it("un paiement échoué garde la réservation bloquée pour réessayer", async () => {
    const slot2 = await db.slot.create({
      data: { startsAt: new Date(Date.UTC(2099, 0, 2, 8)), endsAt: new Date(Date.UTC(2099, 0, 2, 9, 30)), mode: "ONSITE", capacity: 1 },
    });
    const d = await makeBooking(slot2.id, 4);
    await svc.holdBooking(d.booking.id, d.user.id);
    const p = await db.payment.create({
      data: { bookingId: d.booking.id, provider: "mock", method: "WAVE", amount: 15000, providerRef: `mock_fail_${stamp}`, payerPhone: "+22890000000" },
    });
    expect(await svc.processPaymentResult(p.providerRef, "FAILED", {})).toMatchObject({ outcome: "FAIL_PAYMENT" });
    expect((await db.booking.findUniqueOrThrow({ where: { id: d.booking.id } })).status).toBe("HELD");
    await db.payment.deleteMany({ where: { bookingId: d.booking.id } });
    await db.booking.delete({ where: { id: d.booking.id } });
    await db.slot.delete({ where: { id: slot2.id } });
  });
});
