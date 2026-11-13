import { NextResponse } from "next/server";
import { z } from "zod";
import { isPaymentMethod } from "@/lib/payment-methods";
import { phoneSchema } from "@/lib/phone";
import { assertRole, ForbiddenError } from "@/server/auth/roles";
import { readSession } from "@/server/auth/session";
import { startSubscriptionPayment } from "@/server/services/subscriptions";

const body = z.object({
  method: z.string().refine(isPaymentMethod),
  payerPhone: phoneSchema,
  returnUrl: z.string().startsWith("/"),
});

// POST /api/subscriptions : démarre le paiement de l'abonnement annuaire (5 000 F pour 30 jours).
export async function POST(req: Request) {
  try {
    const session = assertRole(await readSession(), ["SELLER"]);
    const parsed = body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ ok: false, reason: "INVALID_INPUT" }, { status: 400 });
    const { redirectUrl } = await startSubscriptionPayment({
      sellerId: session.sub,
      method: parsed.data.method as never,
      payerPhone: parsed.data.payerPhone,
      returnUrl: parsed.data.returnUrl,
    });
    return NextResponse.json({ ok: true, redirectUrl });
  } catch (e) {
    if (e instanceof ForbiddenError) return NextResponse.json({ ok: false, reason: "FORBIDDEN" }, { status: 403 });
    throw e;
  }
}
