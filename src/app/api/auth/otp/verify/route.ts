import { NextResponse } from "next/server";
import { z } from "zod";
import { emailSchema } from "@/lib/email";
import { codeSchema, phoneSchema } from "@/lib/phone";
import { verifyOtp } from "@/server/auth/otp";
import { prismaOtpStore } from "@/server/auth/otp-store-prisma";
import { homeFor } from "@/server/auth/roles";
import { startSession } from "@/server/auth/session";
import { getSecret } from "@/server/auth/session-token";
import { createSellerAccount } from "@/server/services/accounts";
import { db } from "@/server/db";

const body = z.object({ email: emailSchema, code: codeSchema, phone: phoneSchema.optional() });

// POST /api/auth/otp/verify : vérifie le code. Première connexion : le numéro WhatsApp est demandé et le compte vendeur créé.
export async function POST(req: Request) {
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, reason: "INVALID_INPUT" }, { status: 400 });
  const { email, code, phone } = parsed.data;

  // Contrôles avant de consommer le code, pour ne pas faire perdre un code valable.
  const existing = await db.user.findUnique({ where: { email } });
  if (!existing) {
    if (!phone) return NextResponse.json({ ok: false, reason: "PHONE_REQUIRED" }, { status: 400 });
    if (await db.user.findUnique({ where: { phone }, select: { id: true } })) return NextResponse.json({ ok: false, reason: "PHONE_TAKEN" }, { status: 409 });
  }

  const result = await verifyOtp(prismaOtpStore, email, code, getSecret());
  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        reason: result.reason,
        until: result.reason === "LOCKED" ? result.until : undefined,
        attemptsLeft: result.reason === "WRONG" ? result.attemptsLeft : undefined,
      },
      { status: result.reason === "LOCKED" ? 429 : 401 },
    );
  }

  const user = existing ?? (await createSellerAccount({ email, phone: phone! }));
  await startSession({ sub: user.id, role: user.role, phone: user.phone, email });
  return NextResponse.json({ ok: true, role: user.role, redirect: homeFor(user.role) });
}
