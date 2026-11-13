export const PAYMENT_METHODS = ["ORANGE_MONEY", "MTN_MOMO", "MOOV", "TMONEY", "WAVE", "CARD"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

// PAY-01 : moyens proposés selon le pays du vendeur (liste de départ, à ajuster avec l'agrégateur retenu).
const BY_COUNTRY: Record<string, PaymentMethod[]> = {
  TG: ["TMONEY", "MOOV", "CARD"],
  CM: ["ORANGE_MONEY", "MTN_MOMO", "CARD"],
  BJ: ["MTN_MOMO", "MOOV", "CARD"],
  CI: ["WAVE", "ORANGE_MONEY", "MTN_MOMO", "MOOV", "CARD"],
  SN: ["WAVE", "ORANGE_MONEY", "CARD"],
  BF: ["ORANGE_MONEY", "MOOV", "CARD"],
  ML: ["ORANGE_MONEY", "MOOV", "CARD"],
};
const DEFAULT: PaymentMethod[] = ["ORANGE_MONEY", "MTN_MOMO", "CARD"];

export function paymentMethodsFor(countryCode?: string | null): PaymentMethod[] {
  return (countryCode && BY_COUNTRY[countryCode]) || DEFAULT;
}

export function isPaymentMethod(v: string): v is PaymentMethod {
  return (PAYMENT_METHODS as readonly string[]).includes(v);
}
