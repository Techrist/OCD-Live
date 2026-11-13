def edit(path, pairs):
    s = open(path, encoding="utf-8").read()
    for a, b in pairs:
        if a not in s:
            print("MISSING in", path, ":", a[:70])
        s = s.replace(a, b)
    open(path, "w", encoding="utf-8").write(s)

# Libérer un blocage = une place pour la liste d'attente (RES-09).
edit("src/server/services/booking.ts", [
    ('import { notifyBookingConfirmed, notifySubscriptionConfirmed } from "./notifications";',
     'import { notifyBookingConfirmed, notifySubscriptionConfirmed, notifyWaitlist } from "./notifications";'),
    ('''export async function expireHolds(now: Date = new Date()): Promise<number> {
  const res = await db.booking.updateMany({
    where: { status: "HELD", holdExpiresAt: { lte: now } },
    data: { status: "EXPIRED" },
  });
  return res.count;
}''',
     '''export async function expireHolds(now: Date = new Date()): Promise<number> {
  const where = { status: "HELD" as const, holdExpiresAt: { lte: now } };
  const slotIds = [...new Set((await db.booking.findMany({ where, select: { slotId: true } })).map((b) => b.slotId))];
  const res = await db.booking.updateMany({ where, data: { status: "EXPIRED" } });
  for (const id of slotIds) await notifyWaitlist(id);
  return res.count;
}'''),
])

edit("src/server/services/admin.ts", [
    ('import { generateMonthSlots } from "./slots";',
     'import { slotSpacingProblem } from "@/lib/cancellation";\nimport { notifyWaitlist } from "./notifications";\nimport { generateMonthSlots } from "./slots";'),
    ('''  if (res.count) await audit(actorId, "booking.cancel", "Booking", bookingId, { reason });
  return { ok: res.count > 0 };''',
     '''  if (res.count) {
    await audit(actorId, "booking.cancel", "Booking", bookingId, { reason });
    const b = await db.booking.findUnique({ where: { id: bookingId }, select: { slotId: true } });
    if (b) await notifyWaitlist(b.slotId);
  }
  return { ok: res.count > 0 };'''),
    ('''  const slots = generateMonthSlots(year, month, {''',
     '''  const buffer = await getSetting<number>("booking.bufferMinutes");
  const problem = slotSpacingProblem(startHours, durationMinutes, buffer);
  if (problem) throw new Error(problem); // battement entre deux lives (RES-08)
  const slots = generateMonthSlots(year, month, {'''),
])

# Le QR du reçu ouvre la page de check-in du back-office (réservée à la régie).
edit("src/server/receipts/load-receipt.ts", [
    ("/fr/checkin/${reference}", "/fr/admin/checkin/${reference}"),
])
print("ok")
