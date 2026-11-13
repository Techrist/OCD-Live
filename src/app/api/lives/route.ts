import { NextResponse } from "next/server";
import { z } from "zod";
import { shuffle } from "@/lib/shuffle";
import { assertRole, ForbiddenError } from "@/server/auth/roles";
import { readSession } from "@/server/auth/session";
import { db } from "@/server/db";
import { publishedLives, submitLive } from "@/server/services/directory";

// GET /api/lives?country=CM&category=nourriture : lives publiés en cours, dans un ordre qui tourne (ANN-13).
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const country = sp.get("country")?.toUpperCase() || undefined;
  const categoryParam = sp.get("category") || undefined;
  const category = categoryParam
    ? await db.category.findFirst({ where: { OR: [{ id: categoryParam }, { slug: categoryParam }] } })
    : null;
  if (categoryParam && !category) return NextResponse.json({ lives: [] });
  const lives = await publishedLives({ countryCode: country, categoryId: category?.id });
  return NextResponse.json({
    lives: shuffle(lives).map((l) => ({
      id: l.id,
      platform: l.platform,
      country: l.countryCode,
      category: l.category.name,
      shop: l.seller.sellerProfile?.shopName,
      city: l.seller.city,
      slug: l.seller.sellerProfile?.slug,
      expiresAt: l.expiresAt,
    })),
  }, { headers: { "Cache-Control": "no-store" } });
}

const body = z.object({ url: z.string().trim().min(8).max(500) });

// POST /api/lives : soumet un live (abonné actif, fenêtre ouverte).
export async function POST(req: Request) {
  try {
    const session = assertRole(await readSession(), ["SELLER"]);
    const parsed = body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ ok: false, reason: "INVALID_URL" }, { status: 400 });
    const result = await submitLive(session.sub, parsed.data.url);
    if (result.ok) return NextResponse.json({ ok: true, id: result.id, expiresAt: result.expiresAt });
    const status = result.reason === "NO_SUBSCRIPTION" ? 402 : result.reason === "OUTSIDE_WINDOW" ? 409 : 400;
    return NextResponse.json({ ok: false, reason: result.reason, next: result.reason === "OUTSIDE_WINDOW" ? result.next : undefined }, { status });
  } catch (e) {
    if (e instanceof ForbiddenError) return NextResponse.json({ ok: false, reason: "FORBIDDEN" }, { status: 403 });
    throw e;
  }
}
