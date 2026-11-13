import { NextResponse } from "next/server";
import { z } from "zod";
import { codeSchema, phoneSchema } from "@/lib/phone";
import { verifyOtp } from "@/server/auth/otp";
import { prismaOtpStore } from "@/server/auth/otp-store-prisma";
import { homeFor } from "@/server/auth/roles";
import { startSession } from "@/server/auth/session";
import { getSecret } from "@/server/auth/session-token";
import { db } from "@/server/db";

const body = z.object({ phone: phoneSchema, code: codeSchema });

export async function POST(req: Request) {
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, reason: "INVALID_INPUT" }, { status: 400 });
  const { phone, code } = parsed.data;

  const result = await verifyOtp(prismaOtpStore, phone, code, getSecret());
  if (!result.ok) {
    const status = result.reason === "LOCKED" ? 429 : 401;
    return NextResponse.json(
      {
        ok: false,
        reason: result.reason,
        until: result.reason === "LOCKED" ? result.until : undefined,
        attemptsLeft: result.reason === "WRONG" ? result.attemptsLeft : undefined,
      },
      { status },
    );
  }

  // Compte par numéro WhatsApp : créé à la première connexion (vendeur), pays déduit de l'indicatif.
  let user = await db.user.findUnique({ where: { phone } });
  if (!user) {
    const countries = await db.country.findMany({ where: { active: true } });
    const country = countries
      .filter((c) => phone.startsWith(c.dialCode))
      .sort((a, b) => b.dialCode.length - a.dialCode.length)[0];
    user = await db.user.create({ data: { phone, role: "SELLER", countryCode: country?.code } });
  }
  await startSession({ sub: user.id, role: user.role, phone: user.phone });
  return NextResponse.json({ ok: true, role: user.role, redirect: homeFor(user.role) });
}
