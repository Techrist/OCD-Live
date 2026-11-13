import { NextResponse } from "next/server";
import { z } from "zod";
import { packageFitsMode } from "@/lib/booking-draft";
import { assertRole, ForbiddenError } from "@/server/auth/roles";
import { readSession } from "@/server/auth/session";
import { db } from "@/server/db";
import { remainingPlaces } from "@/server/services/availability";

const body = z.object({ slotId: z.string().min(1), packageSlug: z.string().min(1), mode: z.enum(["ONSITE", "REMOTE"]) });

async function nextReference(): Promise<string> {
  const [{ n }] = await db.$queryRaw<{ n: bigint }[]>`SELECT nextval('booking_reference_seq') AS n`;
  return `OCD-${new Date().getUTCFullYear()}-${String(n).padStart(6, "0")}`;
}

// POST /api/bookings : crée ou met à jour la réservation DRAFT du vendeur connecté.
// Le blocage de 10 min avec verrou en base se fait à l'étape 6 (POST /api/bookings/[id]/hold).
export async function POST(req: Request) {
  try {
    const session = assertRole(await readSession(), ["SELLER"]);
    const parsed = body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ ok: false, reason: "INVALID_INPUT" }, { status: 400 });
    const { slotId, packageSlug, mode } = parsed.data;

    const [slot, pkg] = await Promise.all([
      db.slot.findUnique({ where: { id: slotId } }),
      db.package.findFirst({ where: { slug: packageSlug, active: true } }),
    ]);
    if (!slot || !pkg || slot.mode !== mode || pkg.quoteOnly || !packageFitsMode(pkg.mode, mode)) {
      return NextResponse.json({ ok: false, reason: "INVALID_INPUT" }, { status: 400 });
    }
    const now = new Date();
    const taken = await db.booking.count({
      where: { slotId, OR: [{ status: "CONFIRMED" }, { status: "HELD", holdExpiresAt: { gt: now } }] },
    });
    if (remainingPlaces({ ...slot, mode: slot.mode, status: slot.status }, taken, now) === 0) {
      return NextResponse.json({ ok: false, reason: "SLOT_FULL" }, { status: 409 });
    }

    const data = { slotId, packageId: pkg.id, mode, amount: pkg.price, currency: pkg.currency };
    const draft = await db.booking.findFirst({ where: { sellerId: session.sub, status: "DRAFT" }, orderBy: { createdAt: "desc" } });
    const booking = draft
      ? await db.booking.update({ where: { id: draft.id }, data })
      : await db.booking.create({ data: { ...data, sellerId: session.sub, reference: await nextReference(), status: "DRAFT" } });
    return NextResponse.json({ ok: true, id: booking.id, reference: booking.reference });
  } catch (e) {
    if (e instanceof ForbiddenError) return NextResponse.json({ ok: false, reason: "FORBIDDEN" }, { status: 403 });
    throw e;
  }
}
