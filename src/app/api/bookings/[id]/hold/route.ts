import { NextResponse } from "next/server";
import { assertRole, ForbiddenError } from "@/server/auth/roles";
import { readSession } from "@/server/auth/session";
import { holdBooking } from "@/server/services/booking";

// POST /api/bookings/[id]/hold : bloque le créneau 10 min (transaction + verrou).
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = assertRole(await readSession(), ["SELLER"]);
    const result = await holdBooking((await params).id, session.sub);
    if (result.ok) return NextResponse.json({ ok: true, holdExpiresAt: result.holdExpiresAt });
    const status = result.reason === "NOT_FOUND" ? 404 : 409;
    return NextResponse.json({ ok: false, reason: result.reason }, { status });
  } catch (e) {
    if (e instanceof ForbiddenError) return NextResponse.json({ ok: false, reason: "FORBIDDEN" }, { status: 403 });
    throw e;
  }
}
