import { NextResponse } from "next/server";
import { assertRole, ForbiddenError } from "@/server/auth/roles";
import { readSession } from "@/server/auth/session";
import { db } from "@/server/db";

// GET /api/bookings/[id] : état de la réservation du vendeur connecté (compte à rebours, dernier paiement).
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = assertRole(await readSession(), ["SELLER"]);
    const { id } = await params;
    const b = await db.booking.findFirst({
      where: { id, sellerId: session.sub },
      include: {
        package: { select: { name: true, durationMinutes: true, liveCount: true } },
        slot: { select: { startsAt: true, endsAt: true } },
        payments: { orderBy: { createdAt: "desc" }, take: 1, include: { receipt: true } },
      },
    });
    if (!b) return NextResponse.json({ ok: false, reason: "NOT_FOUND" }, { status: 404 });
    const last = b.payments[0];
    return NextResponse.json({
      ok: true,
      id: b.id,
      reference: b.reference,
      status: b.status,
      holdExpiresAt: b.holdExpiresAt,
      amount: b.amount,
      currency: b.currency,
      mode: b.mode,
      package: b.package,
      slot: b.slot,
      lastPayment: last ? { status: last.status, method: last.method } : null,
      receiptNumber: last?.receipt?.number ?? null,
    });
  } catch (e) {
    if (e instanceof ForbiddenError) return NextResponse.json({ ok: false, reason: "FORBIDDEN" }, { status: 403 });
    throw e;
  }
}
