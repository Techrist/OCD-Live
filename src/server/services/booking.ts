import "server-only";
import { db } from "@/server/db";
import { remainingPlaces } from "./availability";
import { notifyBookingConfirmed, notifySubscriptionConfirmed, notifyWaitlist } from "./notifications";
import { decideOutcome, type Outcome } from "./payment-outcome";

const activeBookings = (now: Date, excludeId?: string) => ({
  ...(excludeId ? { id: { not: excludeId } } : {}),
  OR: [{ status: "CONFIRMED" as const }, { status: "HELD" as const, holdExpiresAt: { gt: now } }],
});

export type HoldResult =
  | { ok: true; holdExpiresAt: Date }
  | { ok: false; reason: "NOT_FOUND" | "SLOT_FULL" | "ALREADY_CONFIRMED" | "INVALID_STATE" };

/**
 * Bloque le créneau pour 10 minutes (RES-07). Transaction + verrou sur la ligne Slot
 * (SELECT … FOR UPDATE) : deux personnes qui valident le dernier créneau en même temps,
 * une seule passe.
 */
export async function holdBooking(bookingId: string, sellerId: string, now: Date = new Date()): Promise<HoldResult> {
  return db.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({ where: { id: bookingId } });
    if (!booking || booking.sellerId !== sellerId) return { ok: false, reason: "NOT_FOUND" };
    if (booking.status === "CONFIRMED") return { ok: false, reason: "ALREADY_CONFIRMED" };
    if (!["DRAFT", "HELD", "EXPIRED"].includes(booking.status)) return { ok: false, reason: "INVALID_STATE" };
    // Rechargement de la page pendant le blocage : on garde la même échéance.
    if (booking.status === "HELD" && booking.holdExpiresAt && booking.holdExpiresAt > now) {
      return { ok: true, holdExpiresAt: booking.holdExpiresAt };
    }

    await tx.$queryRaw`SELECT id FROM "Slot" WHERE id = ${booking.slotId} FOR UPDATE`;
    const slot = await tx.slot.findUniqueOrThrow({ where: { id: booking.slotId } });
    const taken = await tx.booking.count({ where: { slotId: slot.id, ...activeBookings(now, booking.id) } });
    if (remainingPlaces(slot, taken, now) === 0) return { ok: false, reason: "SLOT_FULL" };

    const setting = await tx.setting.findUniqueOrThrow({ where: { key: "booking.holdMinutes" } });
    const holdExpiresAt = new Date(now.getTime() + (setting.value as number) * 60_000);
    await tx.booking.update({ where: { id: booking.id }, data: { status: "HELD", holdExpiresAt } });
    return { ok: true, holdExpiresAt };
  });
}

/** Libère les blocages non payés (appelé par /api/cron/tick, étape 7). */
export async function expireHolds(now: Date = new Date()): Promise<number> {
  const where = { status: "HELD" as const, holdExpiresAt: { lte: now } };
  const slotIds = [...new Set((await db.booking.findMany({ where, select: { slotId: true } })).map((b) => b.slotId))];
  const res = await db.booking.updateMany({ where, data: { status: "EXPIRED" } });
  for (const id of slotIds) await notifyWaitlist(id);
  return res.count;
}

export type PaymentResult =
  | { ok: true; outcome: Outcome["action"]; bookingId: string | null; reference: string | null; subscriptionId?: string }
  | { ok: false; reason: "UNKNOWN_PAYMENT" };

/**
 * Applique le résultat d'un paiement (appelé uniquement par le webhook, jamais par le navigateur).
 * Idempotent : un webhook reçu deux fois ne crée qu'un paiement confirmé et un reçu.
 */
export async function processPaymentResult(
  providerRef: string,
  incoming: "SUCCEEDED" | "FAILED",
  raw: unknown,
  now: Date = new Date(),
): Promise<PaymentResult> {
  const result = await applyPaymentResult(providerRef, incoming, raw, now);
  // Notifications après validation de la transaction (jamais bloquantes).
  if (result.ok && (result.outcome === "CONFIRM" || result.outcome === "CONFIRM_LATE")) {
    if (result.bookingId) await notifyBookingConfirmed(result.bookingId);
    if (result.subscriptionId) await notifySubscriptionConfirmed(result.subscriptionId);
  }
  return result;
}

async function applyPaymentResult(
  providerRef: string,
  incoming: "SUCCEEDED" | "FAILED",
  raw: unknown,
  now: Date,
): Promise<PaymentResult> {
  return db.$transaction(async (tx) => {
    const found = await tx.payment.findUnique({ where: { providerRef } });
    if (!found) return { ok: false, reason: "UNKNOWN_PAYMENT" };
    await tx.$queryRaw`SELECT id FROM "Payment" WHERE id = ${found.id} FOR UPDATE`;
    const payment = await tx.payment.findUniqueOrThrow({ where: { id: found.id }, include: { booking: true } });
    const booking = payment.booking;

    // Abonnement annuaire : activation 30 jours (ANN-01), à la suite d'un éventuel abonnement en cours.
    if (payment.subscriptionId) {
      const base = { ok: true as const, bookingId: null, reference: null, subscriptionId: payment.subscriptionId };
      if (payment.status !== "PENDING") return { ...base, outcome: "IGNORE" as const };
      if (incoming === "FAILED") {
        await tx.payment.update({ where: { id: payment.id }, data: { status: "FAILED", raw: raw as never } });
        return { ...base, outcome: "FAIL_PAYMENT" as const };
      }
      await tx.payment.update({ where: { id: payment.id }, data: { status: "SUCCEEDED", raw: raw as never } });
      const sub = await tx.subscription.findUniqueOrThrow({ where: { id: payment.subscriptionId } });
      const days = (await tx.setting.findUniqueOrThrow({ where: { key: "subscription.durationDays" } })).value as number;
      const latest = await tx.subscription.aggregate({ where: { sellerId: sub.sellerId, status: "ACTIVE" }, _max: { endsAt: true } });
      const startsAt = latest._max.endsAt && latest._max.endsAt > now ? latest._max.endsAt : now;
      await tx.subscription.update({
        where: { id: sub.id },
        data: { status: "ACTIVE", startsAt, endsAt: new Date(startsAt.getTime() + days * 86_400_000) },
      });
      const [{ n }] = await tx.$queryRaw<{ n: bigint }[]>`SELECT nextval('receipt_number_seq') AS n`;
      await tx.receipt.create({ data: { paymentId: payment.id, number: `R-${now.getUTCFullYear()}-${String(n).padStart(6, "0")}` } });
      return { ...base, outcome: "CONFIRM" as const };
    }

    let slotHasRoom = false;
    if (booking?.status === "EXPIRED") {
      await tx.$queryRaw`SELECT id FROM "Slot" WHERE id = ${booking.slotId} FOR UPDATE`;
      const slot = await tx.slot.findUniqueOrThrow({ where: { id: booking.slotId } });
      const taken = await tx.booking.count({ where: { slotId: slot.id, ...activeBookings(now, booking.id) } });
      slotHasRoom = remainingPlaces(slot, taken, now) > 0;
    }

    const outcome = decideOutcome({
      paymentStatus: payment.status,
      bookingStatus: booking?.status ?? null,
      slotHasRoom,
      incoming,
    });
    const result = { ok: true as const, outcome: outcome.action, bookingId: booking?.id ?? null, reference: booking?.reference ?? null };

    if (outcome.action === "IGNORE") return result;
    if (outcome.action === "FAIL_PAYMENT") {
      await tx.payment.update({ where: { id: payment.id }, data: { status: "FAILED", raw: raw as never } });
      return result;
    }

    await tx.payment.update({ where: { id: payment.id }, data: { status: "SUCCEEDED", raw: raw as never } });
    if (outcome.action === "NEEDS_REFUND") {
      await tx.auditLog.create({
        data: { action: "payment.needs_refund", entity: "Payment", entityId: payment.id, data: { bookingId: booking?.id ?? null } },
      });
      return result;
    }
    if (booking) {
      await tx.booking.update({ where: { id: booking.id }, data: { status: "CONFIRMED", holdExpiresAt: null } });
      const [{ n }] = await tx.$queryRaw<{ n: bigint }[]>`SELECT nextval('receipt_number_seq') AS n`;
      await tx.receipt.create({
        data: { paymentId: payment.id, number: `R-${now.getUTCFullYear()}-${String(n).padStart(6, "0")}` },
      });
    }
    return result;
  });
}
