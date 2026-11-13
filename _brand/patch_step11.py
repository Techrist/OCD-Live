import re

def edit(path, pairs):
    s = open(path, encoding="utf-8").read()
    for a, b in pairs:
        if a not in s:
            print("MISSING in", path, ":", a[:70])
        s = s.replace(a, b)
    open(path, "w", encoding="utf-8").write(s)

edit("src/server/adapters/messaging/types.ts", [(
    '  | "team_new_booking";',
    '  | "team_new_booking"\n  | "subscription_confirmed"\n  | "subscription_expiring"\n  | "live_validated"\n  | "live_rejected"\n  | "waitlist_slot_free"\n  | "booking_rescheduled";',
)])

extra = '''
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
'''
s = open("src/server/services/notifications.ts", encoding="utf-8").read()
if "notifyWaitlist" not in s:
    open("src/server/services/notifications.ts", "a", encoding="utf-8").write(extra)

edit("src/app/api/cron/tick/route.ts", [
    ('import { sendDueReminders } from "@/server/services/notifications";',
     'import { remindExpiringSubscriptions, sendDueReminders } from "@/server/services/notifications";\nimport { archiveExpiredLives } from "@/server/services/directory";\nimport { completeFinishedBookings } from "@/server/services/reservations";\nimport { expireSubscriptions } from "@/server/services/subscriptions";'),
    ('''  const reminders = await sendDueReminders(now);
  return NextResponse.json({ ok: true, expiredHolds: expired, reminders });''',
     '''  const reminders = await sendDueReminders(now);
  const subscriptionReminders = await remindExpiringSubscriptions(now); // J-3 (PAY-10)
  const expiredSubscriptions = await expireSubscriptions(now);
  const archivedLives = await archiveExpiredLives(now); // fin de fenêtre : le live disparaît de l'annuaire
  const finished = await completeFinishedBookings(now); // COMPLETED ou NO_SHOW selon le check-in
  return NextResponse.json({ ok: true, expiredHolds: expired, reminders, subscriptionReminders, expiredSubscriptions, archivedLives, finished });'''),
])
print("patched")
