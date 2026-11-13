import "server-only";
import { fromZonedTime } from "date-fns-tz";
import { db } from "@/server/db";
import { remainingPlaces } from "./availability";
import { processPaymentResult } from "./booking";
import { getSetting } from "./catalog";
import { slotSpacingProblem } from "@/lib/cancellation";
import { notifyWaitlist } from "./notifications";
import { generateMonthSlots } from "./slots";

// Opérations du back-office. Les rôles sont vérifiés dans les Server Actions (src/server/actions/admin.ts).

const DAY = 86_400_000;

export async function audit(actorId: string, action: string, entity: string, entityId: string, data?: object) {
  await db.auditLog.create({ data: { actorId, action, entity, entityId, data: data as never } });
}

/** Début et fin (UTC) d'un jour AAAA-MM-JJ à l'heure du studio. */
export async function dayBounds(date: string) {
  const tz = await getSetting<string>("studio.timezone");
  const from = fromZonedTime(`${date}T00:00:00`, tz);
  return { tz, from, to: new Date(from.getTime() + DAY) };
}

export function todayBookings(from: Date, to: Date) {
  return db.booking.findMany({
    where: { slot: { startsAt: { gte: from, lt: to } }, status: { in: ["HELD", "CONFIRMED", "COMPLETED", "NO_SHOW"] } },
    orderBy: { slot: { startsAt: "asc" } },
    include: {
      slot: true,
      package: { select: { name: true } },
      assistant: { select: { name: true, phone: true } },
      seller: { include: { country: true, sellerProfile: { select: { shopName: true, activity: true } } } },
      payments: { orderBy: { createdAt: "desc" }, take: 1, select: { status: true, method: true } },
    },
  });
}

export type BookingFilter = { status?: string; date?: string };

export async function listBookings(filter: BookingFilter) {
  const where: Record<string, unknown> = {};
  if (filter.status) where.status = filter.status;
  if (filter.date) {
    const { from, to } = await dayBounds(filter.date);
    where.slot = { startsAt: { gte: from, lt: to } };
  }
  return db.booking.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      slot: true,
      package: { select: { name: true } },
      seller: { include: { sellerProfile: { select: { shopName: true } } } },
    },
  });
}

export function getBookingDetail(id: string) {
  return db.booking.findUnique({
    where: { id },
    include: {
      slot: true,
      package: true,
      assistant: true,
      seller: { include: { country: true, sellerProfile: true } },
      payments: { orderBy: { createdAt: "desc" }, include: { receipt: true } },
    },
  });
}

async function nextReference(tx: Pick<typeof db, "$queryRaw">): Promise<string> {
  const [{ n }] = await tx.$queryRaw<{ n: bigint }[]>`SELECT nextval('booking_reference_seq') AS n`;
  return `OCD-${new Date().getUTCFullYear()}-${String(n).padStart(6, "0")}`;
}

/**
 * Réservation assistée (RES-17) : un conseiller réserve à la place du vendeur. La réservation reste
 * « bloquée » 24 h en attente de paiement au studio (PAY-07), puis passe par « Encaisser » ci-dessous.
 */
export async function createAssistedBooking(input: { phone: string; packageSlug: string; slotId: string; actorId: string }, now = new Date()) {
  return db.$transaction(async (tx) => {
    const pkg = await tx.package.findFirst({ where: { slug: input.packageSlug, active: true, quoteOnly: false } });
    if (!pkg) return { ok: false as const, reason: "INVALID_PACKAGE" };
    await tx.$queryRaw`SELECT id FROM "Slot" WHERE id = ${input.slotId} FOR UPDATE`;
    const slot = await tx.slot.findUnique({ where: { id: input.slotId } });
    if (!slot) return { ok: false as const, reason: "INVALID_SLOT" };
    const taken = await tx.booking.count({
      where: { slotId: slot.id, OR: [{ status: "CONFIRMED" }, { status: "HELD", holdExpiresAt: { gt: now } }] },
    });
    if (remainingPlaces(slot, taken, now) === 0) return { ok: false as const, reason: "SLOT_FULL" };

    const seller =
      (await tx.user.findUnique({ where: { phone: input.phone } })) ??
      (await tx.user.create({ data: { phone: input.phone, role: "SELLER" } }));
    if (seller.role !== "SELLER") return { ok: false as const, reason: "NOT_A_SELLER" };
    const booking = await tx.booking.create({
      data: {
        reference: await nextReference(tx),
        sellerId: seller.id,
        slotId: slot.id,
        packageId: pkg.id,
        mode: slot.mode,
        status: "HELD",
        holdExpiresAt: new Date(now.getTime() + DAY),
        amount: pkg.price,
        currency: pkg.currency,
      },
    });
    await tx.auditLog.create({
      data: { actorId: input.actorId, action: "booking.assisted_create", entity: "Booking", entityId: booking.id, data: { phone: input.phone } },
    });
    return { ok: true as const, id: booking.id };
  });
}

/** Encaissement au studio (PAY-07) : espèces ou mobile money sur place, validé par un admin. */
export async function recordStudioPayment(bookingId: string, actorId: string) {
  const booking = await db.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.status !== "HELD") return { ok: false as const, reason: "INVALID_STATE" };
  const seller = await db.user.findUniqueOrThrow({ where: { id: booking.sellerId } });
  const providerRef = `manual_${booking.id}_${Date.now()}`;
  await db.payment.create({
    data: { bookingId, provider: "manual", method: "CASH", amount: booking.amount, currency: booking.currency, providerRef, payerPhone: seller.phone },
  });
  const result = await processPaymentResult(providerRef, "SUCCEEDED", { recordedBy: actorId });
  await audit(actorId, "payment.studio_recorded", "Booking", bookingId);
  return { ok: result.ok };
}

export async function cancelBooking(bookingId: string, actorId: string, reason: string) {
  const res = await db.booking.updateMany({
    where: { id: bookingId, status: { in: ["HELD", "CONFIRMED"] } },
    data: { status: "CANCELLED", cancelReason: reason, holdExpiresAt: null },
  });
  if (res.count) {
    await audit(actorId, "booking.cancel", "Booking", bookingId, { reason });
    const b = await db.booking.findUnique({ where: { id: bookingId }, select: { slotId: true } });
    if (b) await notifyWaitlist(b.slotId);
  }
  return { ok: res.count > 0 };
}

export async function assignAssistant(bookingId: string, assistantId: string | null, actorId: string) {
  await db.booking.update({ where: { id: bookingId }, data: { assistantId } });
  await audit(actorId, "booking.assign_assistant", "Booking", bookingId, { assistantId });
}

/** « Ouvrir un mois » (ADM-03) : crée les créneaux depuis les réglages, sans écraser l'existant. */
export async function openMonth(year: number, month: number, actorId: string) {
  const [timezone, startHours, durationMinutes, closedWeekdays, remote] = await Promise.all([
    getSetting<string>("studio.timezone"),
    getSetting<number[]>("studio.startHours"),
    getSetting<number>("booking.slotDurationMinutes"),
    getSetting<number[]>("studio.closedWeekdays"),
    getSetting<number>("studio.remoteCapacity"),
  ]);
  const buffer = await getSetting<number>("booking.bufferMinutes");
  const problem = slotSpacingProblem(startHours, durationMinutes, buffer);
  if (problem) throw new Error(problem); // battement entre deux lives (RES-08)
  const slots = generateMonthSlots(year, month, { timezone, startHours, durationMinutes, closedWeekdays, capacity: { ONSITE: 1, REMOTE: remote } });
  const res = await db.slot.createMany({ data: slots, skipDuplicates: true });
  await audit(actorId, "calendar.open_month", "Slot", `${year}-${month}`, { created: res.count });
  return res.count;
}

/** Ferme ou rouvre toute une journée (jour férié, fermeture exceptionnelle). */
export async function setDayClosed(date: string, closed: boolean, actorId: string) {
  const { from, to } = await dayBounds(date);
  const res = await db.slot.updateMany({ where: { startsAt: { gte: from, lt: to } }, data: { status: closed ? "CLOSED" : "OPEN" } });
  await audit(actorId, closed ? "calendar.close_day" : "calendar.open_day", "Slot", date, { slots: res.count });
  return res.count;
}

export async function monthOverview(month: string) {
  const [y, m] = month.split("-").map(Number);
  const tz = await getSetting<string>("studio.timezone");
  const from = fromZonedTime(`${month}-01T00:00:00`, tz);
  const to = fromZonedTime(`${m === 12 ? y + 1 : y}-${String(m === 12 ? 1 : m + 1).padStart(2, "0")}-01T00:00:00`, tz);
  const slots = await db.slot.findMany({ where: { startsAt: { gte: from, lt: to } }, orderBy: { startsAt: "asc" } });
  return { tz, slots };
}
