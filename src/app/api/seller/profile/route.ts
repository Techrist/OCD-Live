import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { assertRole, ForbiddenError } from "@/server/auth/roles";
import { readSession } from "@/server/auth/session";
import { db } from "@/server/db";

const body = z.object({
  name: z.string().trim().min(1).max(80),
  shopName: z.string().trim().min(1).max(80),
  activity: z.string().trim().max(120).optional(),
  categoryId: z.string().min(1),
  countryCode: z.string().length(2),
  city: z.string().trim().max(80).default(""),
});

function slugify(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "vendeur";
}

// RES-02 : enregistre le profil du vendeur connecté (numéro déjà vérifié par OTP).
export async function POST(req: Request) {
  try {
    const session = assertRole(await readSession(), ["SELLER"]);
    const parsed = body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ ok: false, reason: "INVALID_INPUT" }, { status: 400 });
    const d = parsed.data;

    const [category, country] = await Promise.all([
      db.category.findFirst({ where: { id: d.categoryId, active: true } }),
      db.country.findFirst({ where: { code: d.countryCode, active: true } }),
    ]);
    if (!category || !country) return NextResponse.json({ ok: false, reason: "INVALID_INPUT" }, { status: 400 });

    await db.user.update({ where: { id: session.sub }, data: { name: d.name, countryCode: d.countryCode, city: d.city || null } });
    const existing = await db.sellerProfile.findUnique({ where: { userId: session.sub } });
    const data = { shopName: d.shopName, activity: d.activity?.trim() || category.name, categoryId: d.categoryId };
    if (existing) await db.sellerProfile.update({ where: { userId: session.sub }, data });
    else await db.sellerProfile.create({ data: { ...data, userId: session.sub, slug: `${slugify(d.shopName)}-${randomBytes(3).toString("hex")}` } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof ForbiddenError) return NextResponse.json({ ok: false, reason: "FORBIDDEN" }, { status: 403 });
    throw e;
  }
}

// Profil existant du vendeur connecté (pour sauter l'OTP et préremplir au retour).
export async function GET() {
  const session = await readSession();
  if (!session || session.role !== "SELLER") return NextResponse.json({ session: false });
  const user = await db.user.findUnique({ where: { id: session.sub }, include: { sellerProfile: true } });
  const p = user?.sellerProfile;
  return NextResponse.json({
    session: true,
    phone: session.phone,
    profile: p && user?.name && user.countryCode
      ? { name: user.name, shopName: p.shopName, activity: p.activity, categoryId: p.categoryId, countryCode: user.countryCode, city: user.city ?? "" }
      : null,
  });
}
