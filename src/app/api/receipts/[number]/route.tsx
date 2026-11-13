import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { readSession } from "@/server/auth/session";
import { loadReceipt } from "@/server/receipts/load-receipt";
import { ReceiptPdf } from "@/server/receipts/receipt-pdf";

export const runtime = "nodejs";

// GET /api/receipts/R-2026-001000.pdf : reçu PDF, réservé au propriétaire ou à l'équipe (ADMIN, STUDIO).
export async function GET(_req: Request, { params }: { params: Promise<{ number: string }> }) {
  const session = await readSession();
  if (!session) return NextResponse.json({ ok: false, reason: "UNAUTHORIZED" }, { status: 401 });
  const number = (await params).number.replace(/\.pdf$/i, "");
  const data = await loadReceipt(number, session);
  if (!data) return NextResponse.json({ ok: false, reason: "NOT_FOUND" }, { status: 404 });
  const pdf = await renderToBuffer(<ReceiptPdf d={data} />);
  return new NextResponse(new Uint8Array(pdf), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${number}.pdf"`, "Cache-Control": "private, no-store" },
  });
}
