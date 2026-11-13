import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { recordEvent, VISITOR_COOKIE, visitorFrom } from "@/server/services/stats";

// GET /api/go?t=live&id=<live> ou ?t=wa&id=<vendeur>&m=<message> : compte le clic (une fois par visiteur et par jour)
// puis redirige. Les URL de destination viennent de la base, jamais de la requête (pas de redirection ouverte).
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const type = sp.get("t");
  const id = sp.get("id") ?? "";
  const visitor = visitorFrom(req);

  let target: string | null = null;
  if (type === "live") {
    const live = await db.liveSubmission.findUnique({ where: { id } });
    if (live) {
      await recordEvent(live.sellerId, "LIVE_CLICK", visitor.id);
      target = live.url;
    }
  } else if (type === "wa") {
    const seller = await db.user.findFirst({ where: { id, role: "SELLER" } });
    if (seller) {
      await recordEvent(seller.id, "WHATSAPP_CLICK", visitor.id);
      const text = encodeURIComponent((sp.get("m") ?? "").slice(0, 300));
      target = `https://wa.me/${seller.phone.replace(/\D/g, "")}${text ? `?text=${text}` : ""}`;
    }
  }
  if (!target) return NextResponse.redirect(new URL("/fr/lives", req.url));

  const res = NextResponse.redirect(target);
  if (visitor.isNew) res.cookies.set(VISITOR_COOKIE, visitor.id, { httpOnly: true, sameSite: "lax", maxAge: 365 * 86_400, path: "/" });
  return res;
}
