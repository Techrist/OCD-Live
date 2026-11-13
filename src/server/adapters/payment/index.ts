import "server-only";
import { createMockPayment, MOCK_PROVIDER } from "./mock";
import type { PaymentProvider } from "./types";

export function paymentProviderName(): string {
  return process.env.PAYMENT_PROVIDER ?? MOCK_PROVIDER;
}

/** PAYMENT_PROVIDER=mock (défaut). Le premier connecteur réel (CinetPay, FedaPay…) se branche ici. */
export function getPaymentProvider(name: string = paymentProviderName()): PaymentProvider {
  if (name !== MOCK_PROVIDER) throw new Error(`Aucun connecteur de paiement « ${name} » n'est encore branché.`);
  return createMockPayment(process.env.PAYMENT_WEBHOOK_SECRET ?? "");
}
