import { NextResponse } from "next/server";
import { z } from "zod";
import { emailSchema } from "@/lib/email";
import { getEmail } from "@/server/adapters/email";
import { requestOtp } from "@/server/auth/otp";
import { otpEmail } from "@/server/auth/otp-email";
import { prismaOtpStore } from "@/server/auth/otp-store-prisma";
import { getSecret } from "@/server/auth/session-token";
import { db } from "@/server/db";

const body = z.object({ email: emailSchema, locale: z.enum(["fr", "en"]).default("fr") });

// POST /api/auth/otp/request : envoie un code à 6 chiffres par e-mail (VEN-01). needsPhone : première connexion, il faudra un numéro WhatsApp.
export async function POST(req: Request) {
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, reason: "INVALID_EMAIL" }, { status: 400 });
  const { email, locale } = parsed.data;

  let result;
  try {
    result = await requestOtp(
      prismaOtpStore,
      async (to, code) => {
        const mail = otpEmail(code, locale);
        await getEmail().send({ to, ...mail });
      },
      email,
      getSecret(),
    );
  } catch (e) {
    console.error("Envoi du code par e-mail impossible", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false, reason: "SEND_FAILED" }, { status: 502 });
  }
  if (!result.ok) {
    return NextResponse.json({ ok: false, reason: result.reason, until: result.reason === "LOCKED" ? result.until : undefined }, { status: 429 });
  }
  const known = await db.user.findUnique({ where: { email }, select: { id: true } });
  // En développement (e-mail simulé), le code est affiché sous le champ de saisie.
  const showCode = process.env.NODE_ENV !== "production" && (process.env.EMAIL_PROVIDER ?? "mock") === "mock";
  return NextResponse.json({ ok: true, needsPhone: !known, devCode: showCode ? result.code : undefined });
}
