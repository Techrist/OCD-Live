import { NextResponse } from "next/server";
import { z } from "zod";
import { isPaymentMethod, paymentMethodsFor } from "@/lib/payment-methods";
import { phoneSchema } from "@/lib/phone";
import { getPaymentProvider, paymentProviderName } from "@/server/adapters/payment";
import { assertRole, ForbiddenError } from "@/server/auth/roles";
import { readSession } from "@/server/auth/session";
import { db } from "@/server/db";

const body = z.object({
  method: z.string().refine(isPaymentMethod),
  payerPhone: phoneSchema,
  returnUrl: z.string().startsWith("/"),
});

// POST /api/bookings/[id]/pay : crée le paiement chez le fournisseur. Réessayer ou changer de moyen
// crée un nouveau paiement sans perdre la réservation tant que le blocage court (PAY-05).
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = assertRole(await readSession(), ["SELLER"]);
    const parsed = body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ ok: false, reason: "INVALID_INPUT" }, { status: 400 });
    const { method, payerPhone, returnUrl } = parsed.data;

    const booking = await db.booking.findFirst({
      where: { id: (await params).id, sellerId: session.sub },
      include: { seller: { select: { countryCode: true } } },
    });
    if (!booking) return NextResponse.json({ ok: false, reason: "NOT_FOUND" }, { status: 404 });
    const now = new Date();
    if (booking.status !== "HELD" || !booking.holdExpiresAt || booking.holdExpiresAt <= now) {
      return NextResponse.json({ ok: false, reason: "HOLD_EXPIRED" }, { status: 409 });
    }
    if (!paymentMethodsFor(booking.seller.countryCode).includes(method as never)) {
      return NextResponse.json({ ok: false, reason: "INVALID_INPUT" }, { status: 400 });
    }

    const providerName = paymentProviderName();
    const created = await getPaymentProvider(providerName).createPayment({
      reference: booking.reference,
      amount: booking.amount,
      currency: booking.currency,
      method: method as never,
      payerPhone,
      returnUrl,
    });
    await db.payment.create({
      data: {
        bookingId: booking.id,
        provider: providerName,
        method: method as never,
        amount: booking.amount,
        currency: booking.currency,
        providerRef: created.providerRef,
        payerPhone,
        raw: { returnUrl },
      },
    });
    return NextResponse.json({ ok: true, redirectUrl: created.redirectUrl });
  } catch (e) {
    if (e instanceof ForbiddenError) return NextResponse.json({ ok: false, reason: "FORBIDDEN" }, { status: 403 });
    throw e;
  }
}
