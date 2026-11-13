import "server-only";
import { formatInTimeZone } from "date-fns-tz";
import { getMessaging } from "@/server/adapters/messaging";
import { db } from "@/server/db";

// Notifications de la section 9 : paiement confirmé, rappels J-1 / H-1, nouvelle réservation pour l'équipe.
// L'envoi passe par MessagingProvider (mock par défaut) ; chaque envoi est journalisé dans Notification.

const HOUR = 3_600_000;

async function settingOr<T>(key: string, fallback: T): Promise<T> {
  const row = await db.setting.findUnique({ where: { key } });
  return (row?.value as T | undefined) ?? fallback;
}

async function bookingContext(bookingId: string) {
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { seller: { include: { sellerProfile: true } }, package: true, slot: true },
  });
  if (!booking) return null;
  const tz = await settingOr("studio.timezone", "Africa/Lome");
  const address = await settingOr("studio.address", "Studio OCD Live, Lomé");
  const mapsUrl = await settingOr("studio.mapsUrl", "");
  const where = booking.mode === "ONSITE" ? `${address}${mapsUrl ? ` ${mapsUrl}` : ""}` : "À distance";
  return {
    booking,
    params: {
      bookingId: booking.id,
      reference: booking.reference,
      date: formatInTimeZone(booking.slot.startsAt, tz, "dd/MM/yyyy"),
      time: formatInTimeZone(booking.slot.startsAt, tz, "HH:mm"),
      package: booking.package.name,
      shop: booking.seller.sellerProfile?.shopName ?? booking.seller.name ?? booking.seller.phone,
      where,
    },
  };
}

async function alreadySent(template: string, bookingId: string): Promise<boolean> {
  const n = await db.notification.count({ where: { template, payload: { path: ["bookingId"], equals: bookingId } } });
  return n > 0;
}

/** Paiement confirmé : message au vendeur, message et alerte back-office pour l'équipe. Ne lève jamais d'erreur. */
export async function notifyBookingConfirmed(bookingId: string): Promise<void> {
  try {
    const ctx = await bookingContext(bookingId);
    if (!ctx || (await alreadySent("booking_confirmed", bookingId))) return;
    const messaging = getMessaging();
    await messaging.sendTemplate({ to: ctx.booking.seller.phone, template: "booking_confirmed", params: ctx.params, channel: "whatsapp" });

    const roles = ctx.booking.mode === "ONSITE" ? ["ADMIN", "STUDIO"] : ["ADMIN", "ASSISTANT"];
    const team = await db.user.findMany({ where: { role: { in: roles as never[] } }, select: { phone: true } });
    for (const member of team) {
      await messaging.sendTemplate({ to: member.phone, template: "team_new_booking", params: ctx.params, channel: "whatsapp" });
    }
    await db.notification.create({
      data: { channel: "backoffice", to: "team", template: "team_new_booking", payload: ctx.params, status: "SENT", sentAt: new Date() },
    });
  } catch (error) {
    console.error("[notifications] échec d'envoi pour la réservation", bookingId, error);
  }
}

/**
 * Rappels automatiques (RES-12). Un rappel ne part qu'une fois par réservation.
 * J-1 : à partir de 24 h avant le live, si la réservation a été faite plus de 24 h à l'avance.
 * H-1 : à partir d'1 h avant le live.
 */
export async function sendDueReminders(now: Date = new Date()): Promise<{ d1: number; h1: number }> {
  const upcoming = await db.booking.findMany({
    where: { status: "CONFIRMED", slot: { startsAt: { gt: now, lte: new Date(now.getTime() + 24 * HOUR) } } },
    include: { slot: true },
  });
  const messaging = getMessaging();
  let d1 = 0;
  let h1 = 0;
  for (const b of upcoming) {
    const start = b.slot.startsAt.getTime();
    const ctx = await bookingContext(b.id);
    if (!ctx) continue;
    if (start - now.getTime() <= HOUR) {
      if (!(await alreadySent("reminder_h1", b.id))) {
        await messaging.sendTemplate({ to: ctx.booking.seller.phone, template: "reminder_h1", params: ctx.params, channel: "whatsapp" });
        h1++;
      }
    } else if (b.createdAt.getTime() < start - 24 * HOUR && !(await alreadySent("reminder_d1", b.id))) {
      await messaging.sendTemplate({ to: ctx.booking.seller.phone, template: "reminder_d1", params: ctx.params, channel: "whatsapp" });
      d1++;
    }
  }
  return { d1, h1 };
}

// ---------- Abonnement annuaire, validation des lives, liste d'attente ----------

type Template = Parameters<ReturnType<typeof getMessaging>["sendTemplate"]>[0]["template"];

async function sendOnce(template: Template, to: string, params: Record<string, string>, key: string, keyValue: string) {
  const exists = await db.notification.count({ where: { template, payload: { path: [key], equals: keyValue } } });
  if (exists) return false;
  await getMessaging().sendTemplate({ to, template, params: { ...params, [key]: keyValue }, channel: "whatsapp" });
  return true;
}

export async function notifySubscriptionConfirmed(subscriptionId: string): Promise<void> {
  try {
    const sub = await db.subscription.findUnique({ where: { id: subscriptionId }, include: { seller: true } });
    if (!sub) return;
    const tz = await settingOr("studio.timezone", "Africa/Lome");
    await sendOnce("subscription_confirmed", sub.seller.phone, { until: formatInTimeZone(sub.endsAt, tz, "dd/MM/yyyy") }, "subscriptionId", sub.id);
  } catch (error) {
    console.error("[notifications] abonnement", subscriptionId, error);
  }
}

/** Rappel J-3 avant la fin de l'abonnement (PAY-10) : une seule fois, et seulement s'il n'est pas déjà renouvelé. */
export async function remindExpiringSubscriptions(now: Date = new Date()): Promise<number> {
  const days = await settingOr<number>("subscription.remindDaysBefore", 3);
  const horizon = new Date(now.getTime() + days * 86_400_000);
  const subs = await db.subscription.findMany({
    where: { status: "ACTIVE", startsAt: { lte: now }, endsAt: { gt: now, lte: horizon } },
    include: { seller: true },
  });
  const tz = await settingOr("studio.timezone", "Africa/Lome");
  let sent = 0;
  for (const s of subs) {
    const renewed = await db.subscription.count({ where: { sellerId: s.sellerId, status: "ACTIVE", endsAt: { gt: s.endsAt } } });
    if (renewed) continue;
    if (await sendOnce("subscription_expiring", s.seller.phone, { until: formatInTimeZone(s.endsAt, tz, "dd/MM/yyyy") }, "subscriptionId", s.id)) sent++;
  }
  return sent;
}

export async function notifyLiveDecision(submissionId: string): Promise<void> {
  try {
    const s = await db.liveSubmission.findUnique({ where: { id: submissionId }, include: { seller: true } });
    if (!s || (s.status !== "PUBLISHED" && s.status !== "REJECTED")) return;
    await sendOnce(s.status === "PUBLISHED" ? "live_validated" : "live_rejected", s.seller.phone, { reason: s.rejectReason ?? "" }, "submissionId", s.id);
  } catch (error) {
    console.error("[notifications] décision live", submissionId, error);
  }
}

/** Prévient les vendeurs en liste d'attente qu'une place s'est libérée, puis les retire de la liste (RES-09). */
export async function notifyWaitlist(slotId: string): Promise<number> {
  try {
    const slot = await db.slot.findUnique({ where: { id: slotId } });
    if (!slot || slot.status !== "OPEN" || slot.startsAt <= new Date()) return 0;
    const tz = await settingOr("studio.timezone", "Africa/Lome");
    const entries = await db.waitlistEntry.findMany({ where: { slotId }, orderBy: { createdAt: "asc" } });
    for (const e of entries) {
      const seller = await db.user.findUnique({ where: { id: e.sellerId } });
      if (!seller) continue;
      await getMessaging().sendTemplate({
        to: seller.phone,
        template: "waitlist_slot_free",
        params: { slotId, date: formatInTimeZone(slot.startsAt, tz, "dd/MM/yyyy"), time: formatInTimeZone(slot.startsAt, tz, "HH:mm") },
        channel: "whatsapp",
      });
    }
    await db.waitlistEntry.deleteMany({ where: { slotId } });
    return entries.length;
  } catch (error) {
    console.error("[notifications] liste d'attente", slotId, error);
    return 0;
  }
}
