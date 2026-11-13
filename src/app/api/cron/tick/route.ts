import { NextResponse } from "next/server";
import { expireHolds } from "@/server/services/booking";
import { remindExpiringSubscriptions, sendDueReminders } from "@/server/services/notifications";
import { archiveExpiredLives } from "@/server/services/directory";
import { completeFinishedBookings } from "@/server/services/reservations";
import { expireSubscriptions } from "@/server/services/subscriptions";

// GET /api/cron/tick, appelé toutes les 5 min : libère les blocages expirés, envoie les rappels.
// Protégé par CRON_SECRET (en-tête « x-cron-secret » ou « Authorization: Bearer … »).
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET ?? "";
  const given = req.headers.get("x-cron-secret") ?? req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!secret || given !== secret) return NextResponse.json({ ok: false }, { status: 401 });

  const now = new Date();
  const expired = await expireHolds(now);
  const reminders = await sendDueReminders(now);
  const subscriptionReminders = await remindExpiringSubscriptions(now); // J-3 (PAY-10)
  const expiredSubscriptions = await expireSubscriptions(now);
  const archivedLives = await archiveExpiredLives(now); // fin de fenêtre : le live disparaît de l'annuaire
  const finished = await completeFinishedBookings(now); // COMPLETED ou NO_SHOW selon le check-in
  return NextResponse.json({ ok: true, expiredHolds: expired, reminders, subscriptionReminders, expiredSubscriptions, archivedLives, finished });
}
