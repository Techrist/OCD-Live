import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { recordEvent, VISITOR_COOKIE, visitorFrom } from "@/server/services/stats";

const body = z.object({ slug: z.string().min(1).max(80) });

// POST /api/stats : une vue de la vitrine, comptée une fois par visiteur et par jour.
export async function POST(req: Request) {
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  const profile = await db.sellerProfile.findUnique({ where: { slug: parsed.data.slug } });
  if (!profile) return NextResponse.json({ ok: false }, { status: 404 });
  const visitor = visitorFrom(req);
  const counted = await recordEvent(profile.userId, "VIEW", visitor.id);
  const res = NextResponse.json({ ok: true, counted });
  if (visitor.isNew) res.cookies.set(VISITOR_COOKIE, visitor.id, { httpOnly: true, sameSite: "lax", maxAge: 365 * 86_400, path: "/" });
  return res;
}
