import "server-only";
import { z } from "zod";
import { cancellationPolicy } from "@/lib/cancellation";
import { getPaymentProvider } from "@/server/adapters/payment";
import { getMessaging } from "@/server/adapters/messaging";
import { db } from "@/server/db";
import { remainingPlaces } from "./availability";
import { getSetting } from "./catalog";
import { notifyWaitlist } from "./notifications";
import { syncProductsFromSheet } from "./shop";

// Confort de réservation (étape 14) : report, annulation, fiche produit, check-in, liste d'attente.

const activeBookings = (now: Date, excludeId?: string) => ({
  ...(excludeId ? { id: { not: excludeId } } : {}),
  OR: [{ status: "CONFIRMED" as const }, { status: "HELD" as const, holdExpiresAt: { gt: now } }],
});

export type RescheduleResult =
  | { ok: true }
  | { ok: false; reason: "NOT_FOUND" | "INVALID_STATE" | "TOO_LATE" | "INVALID_SLOT" | "SLOT_FULL"; hoursLeft?: number; freeHours?: number };

/** Report gratuit jusqu'à 48 h avant le live (RES-13) ; refusé avec un message clair ensuite. */
export async function rescheduleBooking(bookingId: string, sellerId: string, newSlotId: string, now: Date = new Date()): Promise<RescheduleResult> {
  const freeHours = await getSetting<number>("booking.cancelFreeHoursBefore");
  const result = await db.$transaction(async (tx): Promise<RescheduleResult & { oldSlotId?: string }> => {
    const booking = await tx.booking.findFirst({ where: { id: bookingId, sellerId }, include: { slot: true } });
    if (!booking) return { ok: false, reason: "NOT_FOUND" };
    if (booking.status !== "CONFIRMED") return { ok: false, reason: "INVALID_STATE" };
    const policy = cancellationPolicy(booking.slot.startsAt, now, freeHours);
    if (!policy.canReschedule) return { ok: false, reason: "TOO_LATE", hoursLeft: Math.max(0, Math.floor(policy.hoursLeft)), freeHours };

    await tx.$queryRaw`SELECT id FROM "Slot" WHERE id = ${newSlotId} FOR UPDATE`;
    const slot = await tx.slot.findUnique({ where: { id: newSlotId } });
    if (!slot || slot.mode !== booking.mode || slot.id === booking.slotId) return { ok: false, reason: "INVALID_SLOT" };
    const taken = await tx.booking.count({ where: { slotId: slot.id, ...activeBookings(now, booking.id) } });
    if (remainingPlaces(slot, taken, now) === 0) return { ok: false, reason: "SLOT_FULL" };

    await tx.booking.update({ where: { id: booking.id }, data: { slotId: slot.id, assistantId: null } });
    return { ok: true, oldSlotId: booking.slotId };
  });
  if (result.ok && result.oldSlotId) {
    await notifyWaitlist(result.oldSlotId);
    const b = await db.booking.findUnique({ where: { id: bookingId }, include: { seller: true, slot: true } });
    if (b) {
      await getMessaging().sendTemplate({
        to: b.seller.phone,
        template: "booking_rescheduled",
        params: { bookingId: b.id, reference: b.reference, startsAt: b.slot.startsAt.toISOString() },
        channel: "whatsapp",
      });
    }
  }
  return result.ok ? { ok: true } : result;
}

export type CancelResult = { ok: true; refunded: boolean } | { ok: false; reason: "NOT_FOUND" | "INVALID_STATE" };

/** Annulation par le vendeur : remboursée jusqu'à 48 h avant, sinon aucun remboursement (valeur par défaut section 15). */
export async function cancelBySeller(bookingId: string, sellerId: string, now: Date = new Date()): Promise<CancelResult> {
  const freeHours = await getSetting<number>("booking.cancelFreeHoursBefore");
  const booking = await db.booking.findFirst({
    where: { id: bookingId, sellerId },
    include: { slot: true, payments: { where: { status: "SUCCEEDED" }, orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!booking) return { ok: false, reason: "NOT_FOUND" };
  if (booking.status !== "CONFIRMED" && booking.status !== "HELD") return { ok: false, reason: "INVALID_STATE" };

  const policy = cancellationPolicy(booking.slot.startsAt, now, freeHours);
  let refunded = false;
  const payment = booking.payments[0];
  if (booking.status === "CONFIRMED" && payment && policy.refundable) {
    const out = await getPaymentProvider(payment.provider === "manual" ? "mock" : payment.provider).refund(payment.providerRef, payment.amount);
    refunded = out.status === "REFUNDED";
    if (refunded) await db.payment.update({ where: { id: payment.id }, data: { status: "REFUNDED" } });
  }
  await db.booking.update({
    where: { id: booking.id },
    data: { status: "CANCELLED", holdExpiresAt: null, cancelReason: refunded ? "Annulé par le vendeur (remboursé)" : "Annulé par le vendeur (sans remboursement)" },
  });
  await notifyWaitlist(booking.slotId);
  return { ok: true, refunded };
}

export const productSheetSchema = z.object({
  address: z.string().trim().max(200),
  phone: z.string().trim().max(30),
  products: z
    .array(z.object({ name: z.string().trim().min(1).max(80), price: z.coerce.number().int().min(0).max(100_000_000), quantity: z.coerce.number().int().min(0).max(100_000) }))
    .max(20),
});
export type ProductSheet = z.infer<typeof productSheetSchema>;

/** Fiche produit avant le live (RES-11) : la régie la reçoit à l'avance (visible dans le détail de la réservation). */
export async function saveProductSheet(bookingId: string, sellerId: string, sheet: ProductSheet) {
  const res = await db.booking.updateMany({
    where: { id: bookingId, sellerId, status: { in: ["CONFIRMED", "HELD"] } },
    data: { productSheet: sheet as never },
  });
  if (res.count > 0) await syncProductsFromSheet(sellerId, sheet.products); // SHP-03 : alimente la vitrine et le shop
  return { ok: res.count > 0 };
}

export type CheckInResult = { ok: true; alreadyDone: boolean } | { ok: false; reason: "NOT_FOUND" | "INVALID_STATE" | "TOO_EARLY" | "TOO_LATE" };

/** Check-in à l'arrivée au studio par scan du QR du reçu (RES-14) : de 2 h avant la fin du créneau. */
export async function checkIn(reference: string, actorId: string, now: Date = new Date()): Promise<CheckInResult> {
  const booking = await db.booking.findUnique({ where: { reference }, include: { slot: true } });
  if (!booking) return { ok: false, reason: "NOT_FOUND" };
  if (booking.status !== "CONFIRMED" || booking.mode !== "ONSITE") return { ok: false, reason: "INVALID_STATE" };
  if (booking.checkInAt) return { ok: true, alreadyDone: true };
  if (now < new Date(booking.slot.startsAt.getTime() - 2 * 3_600_000)) return { ok: false, reason: "TOO_EARLY" };
  if (now > booking.slot.endsAt) return { ok: false, reason: "TOO_LATE" };
  await db.booking.update({ where: { id: booking.id }, data: { checkInAt: now } });
  await db.auditLog.create({ data: { actorId, action: "booking.check_in", entity: "Booking", entityId: booking.id } });
  return { ok: true, alreadyDone: false };
}

/** Après le créneau : COMPLETED si le vendeur est venu (ou live à distance), NO_SHOW sinon. */
export async function completeFinishedBookings(now: Date = new Date()): Promise<{ completed: number; noShow: number }> {
  const done = await db.booking.updateMany({
    where: { status: "CONFIRMED", slot: { endsAt: { lte: now } }, OR: [{ checkInAt: { not: null } }, { mode: "REMOTE" }] },
    data: { status: "COMPLETED" },
  });
  const noShow = await db.booking.updateMany({
    where: { status: "CONFIRMED", slot: { endsAt: { lte: now } }, checkInAt: null, mode: "ONSITE" },
    data: { status: "NO_SHOW" },
  });
  return { completed: done.count, noShow: noShow.count };
}

export type WaitlistResult = { ok: true } | { ok: false; reason: "NOT_FOUND" | "NOT_FULL" };

/** Inscription sur un créneau complet (RES-09) : le vendeur sera prévenu sur WhatsApp en cas de désistement. */
export async function joinWaitlist(slotId: string, sellerId: string, now: Date = new Date()): Promise<WaitlistResult> {
  const slot = await db.slot.findUnique({ where: { id: slotId } });
  if (!slot) return { ok: false, reason: "NOT_FOUND" };
  const taken = await db.booking.count({ where: { slotId, ...activeBookings(now) } });
  if (slot.status !== "OPEN" || slot.startsAt <= now || remainingPlaces(slot, taken, now) > 0) return { ok: false, reason: "NOT_FULL" };
  await db.waitlistEntry.upsert({ where: { slotId_sellerId: { slotId, sellerId } }, create: { slotId, sellerId }, update: {} });
  return { ok: true };
}
