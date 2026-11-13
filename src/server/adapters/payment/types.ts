import type { PaymentMethod } from "@/lib/payment-methods";

export interface PaymentProvider {
  createPayment(input: {
    reference: string;
    amount: number;
    currency: string;
    method: PaymentMethod;
    payerPhone: string;
    returnUrl: string;
  }): Promise<{ providerRef: string; redirectUrl?: string; status: "PENDING" }>;
  verifyWebhook(req: Request): Promise<{ providerRef: string; status: "SUCCEEDED" | "FAILED"; raw: unknown }>;
  refund(providerRef: string, amount: number): Promise<{ status: "REFUNDED" | "FAILED" }>;
}
