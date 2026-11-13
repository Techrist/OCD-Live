import { NextResponse } from "next/server";
import { z } from "zod";
import { getMessaging } from "@/server/adapters/messaging";
import { requestOtp } from "@/server/auth/otp";
import { prismaOtpStore } from "@/server/auth/otp-store-prisma";
import { getSecret } from "@/server/auth/session-token";
import { phoneSchema } from "@/lib/phone";

const body = z.object({ phone: phoneSchema });

export async function POST(req: Request) {
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, reason: "INVALID_PHONE" }, { status: 400 });
  const { phone } = parsed.data;

  const result = await requestOtp(
    prismaOtpStore,
    async (to, code) => {
      await getMessaging().sendTemplate({ to, template: "otp", params: { code }, channel: "whatsapp" });
    },
    phone,
    getSecret(),
  );
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, reason: result.reason, until: result.reason === "LOCKED" ? result.until : undefined },
      { status: 429 },
    );
  }
  // En développement (messagerie simulée), le code est affiché sous le champ de saisie.
  const showCode = process.env.NODE_ENV !== "production" && (process.env.MESSAGING_PROVIDER ?? "mock") === "mock";
  return NextResponse.json({ ok: true, devCode: showCode ? result.code : undefined });
}
