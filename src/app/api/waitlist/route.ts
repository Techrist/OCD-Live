import { NextResponse } from "next/server";
import { z } from "zod";
import { assertRole, ForbiddenError } from "@/server/auth/roles";
import { readSession } from "@/server/auth/session";
import { joinWaitlist } from "@/server/services/reservations";

// POST /api/waitlist : s'inscrire sur un créneau complet (RES-09).
export async function POST(req: Request) {
  try {
    const session = assertRole(await readSession(), ["SELLER"]);
    const parsed = z.object({ slotId: z.string().min(1) }).safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ ok: false, reason: "INVALID_INPUT" }, { status: 400 });
    const result = await joinWaitlist(parsed.data.slotId, session.sub);
    return NextResponse.json(result, { status: result.ok ? 200 : 409 });
  } catch (e) {
    if (e instanceof ForbiddenError) return NextResponse.json({ ok: false, reason: "FORBIDDEN" }, { status: 403 });
    throw e;
  }
}
