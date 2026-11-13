import { NextResponse } from "next/server";
import { fromZonedTime } from "date-fns-tz";
import { z } from "zod";
import { db } from "@/server/db";
import { getStudioTimezone } from "@/server/services/catalog";
import { summarizeDays } from "@/server/services/availability";

const query = z.object({ month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/), mode: z.enum(["ONSITE", "REMOTE"]) });

// GET /api/slots?month=2026-12&mode=ONSITE : jours et créneaux avec places restantes.
export async function GET(req: Request) {
  const parsed = query.safeParse(Object.fromEntries(new URL(req.url).searchParams));
  if (!parsed.success) return NextResponse.json({ error: "invalid_query" }, { status: 400 });
  const { month, mode } = parsed.data;

  const tz = await getStudioTimezone();
  const [y, m] = month.split("-").map(Number);
  const from = fromZonedTime(`${month}-01T00:00:00`, tz);
  const to = fromZonedTime(`${m === 12 ? y + 1 : y}-${String(m === 12 ? 1 : m + 1).padStart(2, "0")}-01T00:00:00`, tz);
  const now = new Date();

  const slots = await db.slot.findMany({ where: { mode, startsAt: { gte: from, lt: to } }, orderBy: { startsAt: "asc" } });
  // Réservations qui occupent une place : confirmées, ou bloquées dont le délai n'est pas dépassé.
  const grouped = await db.booking.groupBy({
    by: ["slotId"],
    where: {
      slotId: { in: slots.map((s) => s.id) },
      OR: [{ status: "CONFIRMED" }, { status: "HELD", holdExpiresAt: { gt: now } }],
    },
    _count: { _all: true },
  });
  const taken = new Map(grouped.map((g) => [g.slotId, g._count._all]));
  return NextResponse.json({ month, mode, timezone: tz, days: summarizeDays(slots, taken, tz, now) });
}
