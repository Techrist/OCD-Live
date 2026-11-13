import { NextResponse } from "next/server";
import { z } from "zod";
import { MOCK_PROVIDER, signMockBody } from "@/server/adapters/payment/mock";

const body = z.object({ providerRef: z.string(), status: z.enum(["SUCCEEDED", "FAILED"]) });

// Dev uniquement : la page /dev/paiement appelle ici, qui appelle le VRAI webhook (signé comme un fournisseur).
export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") return new NextResponse(null, { status: 404 });
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  const raw = JSON.stringify(parsed.data);
  const secret = process.env.PAYMENT_WEBHOOK_SECRET ?? "";
  const res = await fetch(new URL(`/api/webhooks/payment/${MOCK_PROVIDER}`, req.url), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(secret ? { "x-signature": signMockBody(raw, secret) } : {}) },
    body: raw,
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
