import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { PaymentProvider } from "./types";

export const MOCK_PROVIDER = "mock";

/** Signature du webhook simulé (même principe qu'un vrai agrégateur : HMAC du corps brut). */
export function signMockBody(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

/** Un numéro finissant par 0000 échoue automatiquement (pour les tests, section 19). */
export const mockAutoFails = (phone: string) => phone.endsWith("0000");

export function createMockPayment(webhookSecret: string): PaymentProvider {
  return {
    async createPayment({ returnUrl }) {
      const providerRef = `mock_${randomBytes(8).toString("hex")}`;
      return {
        providerRef,
        status: "PENDING",
        redirectUrl: `/dev/paiement/${providerRef}?return=${encodeURIComponent(returnUrl)}`,
      };
    },
    async verifyWebhook(req) {
      const body = await req.text();
      if (webhookSecret) {
        const given = Buffer.from(req.headers.get("x-signature") ?? "", "hex");
        const expected = Buffer.from(signMockBody(body, webhookSecret), "hex");
        if (given.length !== expected.length || !timingSafeEqual(given, expected)) throw new Error("Signature invalide");
      }
      const data = JSON.parse(body) as { providerRef?: string; status?: string };
      if (!data.providerRef || (data.status !== "SUCCEEDED" && data.status !== "FAILED")) throw new Error("Webhook invalide");
      return { providerRef: data.providerRef, status: data.status, raw: data };
    },
    async refund() {
      return { status: "REFUNDED" };
    },
  };
}
