import { notFound } from "next/navigation";
import { mockAutoFails } from "@/server/adapters/payment/mock";
import { db } from "@/server/db";
import { SimulateButtons } from "./simulate-buttons";

export default async function DevPaymentPage({
  params,
  searchParams,
}: {
  params: Promise<{ providerRef: string }>;
  searchParams: Promise<{ return?: string }>;
}) {
  const { providerRef } = await params;
  const { return: returnUrl = "/" } = await searchParams;
  const payment = await db.payment.findUnique({ where: { providerRef }, include: { booking: true } });
  if (!payment) notFound();
  return (
    <main className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold">Paiement simulé</h1>
      <p>
        {payment.method} · {payment.amount} {payment.currency} · {payment.booking?.reference} · {payment.payerPhone}
      </p>
      <SimulateButtons providerRef={providerRef} returnUrl={returnUrl.startsWith("/") ? returnUrl : "/"} autoFail={mockAutoFails(payment.payerPhone)} />
    </main>
  );
}
