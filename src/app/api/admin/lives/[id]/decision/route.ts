import { NextResponse } from "next/server";
import { z } from "zod";
import { assertRole, ForbiddenError } from "@/server/auth/roles";
import { readSession } from "@/server/auth/session";
import { decideLive } from "@/server/services/directory";

const body = z.object({ decision: z.enum(["VALIDATE", "REJECT"]), reason: z.string().trim().max(200).optional() });

// POST /api/admin/lives/[id]/decision : valider ou refuser avec motif (ADMIN, VALIDATOR).
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = assertRole(await readSession(), ["ADMIN", "VALIDATOR"]);
    const parsed = body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ ok: false, reason: "INVALID_INPUT" }, { status: 400 });
    const result = await decideLive((await params).id, session.sub, parsed.data.decision, parsed.data.reason);
    if (result.ok) return NextResponse.json({ ok: true });
    return NextResponse.json({ ok: false, reason: result.reason }, { status: result.reason === "NOT_FOUND" ? 404 : 409 });
  } catch (e) {
    if (e instanceof ForbiddenError) return NextResponse.json({ ok: false, reason: "FORBIDDEN" }, { status: 403 });
    throw e;
  }
}
