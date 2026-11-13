import { NextResponse } from "next/server";
import { z } from "zod";
import { googleEnabled, neonAuth } from "@/lib/auth/neon-server";
import { emailSchema } from "@/lib/email";
import { phoneSchema } from "@/lib/phone";
import { homeFor } from "@/server/auth/roles";
import { startSession } from "@/server/auth/session";
import { db } from "@/server/db";
import { createSellerAccount } from "@/server/services/accounts";

const body = z.object({ phone: phoneSchema.optional() });

// POST /api/auth/google/complete : après Google, lit la session Neon Auth CÔTÉ SERVEUR (jamais l'e-mail envoyé par le navigateur)
// puis ouvre notre session. Première connexion : le numéro WhatsApp est demandé avant de créer le compte vendeur.
export async function POST(req: Request) {
  if (!googleEnabled()) return NextResponse.json({ ok: false, reason: "DISABLED" }, { status: 404 });
  const parsed = body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ ok: false, reason: "INVALID_PHONE" }, { status: 400 });

  const { data: session } = await neonAuth.getSession();
  const u = session?.user;
  if (!u) return NextResponse.json({ ok: false, reason: "NO_SESSION" }, { status: 401 });
  if (!u.emailVerified) return NextResponse.json({ ok: false, reason: "EMAIL_NOT_VERIFIED" }, { status: 403 });
  const email = emailSchema.safeParse(u.email);
  if (!email.success) return NextResponse.json({ ok: false, reason: "NO_SESSION" }, { status: 401 });

  let user = await db.user.findUnique({ where: { email: email.data } });
  if (!user) {
    const phone = parsed.data.phone;
    if (!phone) return NextResponse.json({ ok: false, reason: "PHONE_REQUIRED" }, { status: 400 });
    if (await db.user.findUnique({ where: { phone }, select: { id: true } })) return NextResponse.json({ ok: false, reason: "PHONE_TAKEN" }, { status: 409 });
    user = await createSellerAccount({ email: email.data, phone, name: u.name });
  }
  await startSession({ sub: user.id, role: user.role, phone: user.phone, email: email.data });
  return NextResponse.json({ ok: true, role: user.role, redirect: homeFor(user.role) });
}
