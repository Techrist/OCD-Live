import { NextResponse } from "next/server";
import { getPaymentProvider } from "@/server/adapters/payment";
import { processPaymentResult } from "@/server/services/booking";

// POST /api/webhooks/payment/[provider] : seul endroit qui confirme ou fait échouer un paiement.
// Signature vérifiée par le fournisseur, traitement idempotent (un webhook rejoué est sans effet).
export async function POST(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  let event;
  try {
    event = await getPaymentProvider((await params).provider).verifyWebhook(req);
  } catch {
    return NextResponse.json({ ok: false, reason: "INVALID_WEBHOOK" }, { status: 400 });
  }
  const result = await processPaymentResult(event.providerRef, event.status, event.raw);
  if (!result.ok) return NextResponse.json({ ok: false, reason: result.reason }, { status: 404 });
  return NextResponse.json({ ok: true, outcome: result.outcome });
}
