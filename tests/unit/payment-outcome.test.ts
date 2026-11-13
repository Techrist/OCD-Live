import { describe, expect, it } from "vitest";
import { paymentMethodsFor } from "@/lib/payment-methods";
import { decideOutcome } from "@/server/services/payment-outcome";

describe("résultat de paiement (PAY-03, règle 3)", () => {
  const base = { paymentStatus: "PENDING", slotHasRoom: true, incoming: "SUCCEEDED" } as const;

  it("un paiement réussi confirme une réservation bloquée", () => {
    expect(decideOutcome({ ...base, bookingStatus: "HELD" })).toEqual({ action: "CONFIRM" });
  });

  it("un webhook reçu deux fois est ignoré (un seul paiement, un seul reçu)", () => {
    expect(decideOutcome({ ...base, paymentStatus: "SUCCEEDED", bookingStatus: "CONFIRMED" })).toEqual({ action: "IGNORE" });
    expect(decideOutcome({ ...base, paymentStatus: "FAILED", bookingStatus: "HELD" })).toEqual({ action: "IGNORE" });
  });

  it("un échec laisse la réservation bloquée pour réessayer (PAY-05)", () => {
    expect(decideOutcome({ ...base, incoming: "FAILED", bookingStatus: "HELD" })).toEqual({ action: "FAIL_PAYMENT" });
  });

  it("un paiement tardif confirme si le créneau est libre, sinon demande un remboursement", () => {
    expect(decideOutcome({ ...base, bookingStatus: "EXPIRED" })).toEqual({ action: "CONFIRM_LATE" });
    expect(decideOutcome({ ...base, bookingStatus: "EXPIRED", slotHasRoom: false })).toEqual({ action: "NEEDS_REFUND" });
  });
});

describe("moyens de paiement par pays (PAY-01)", () => {
  it("propose T-Money au Togo et Wave en Côte d'Ivoire, carte partout", () => {
    expect(paymentMethodsFor("TG")).toContain("TMONEY");
    expect(paymentMethodsFor("CI")).toContain("WAVE");
    expect(paymentMethodsFor("CM")).not.toContain("TMONEY");
    expect(paymentMethodsFor("XX")).toContain("CARD");
  });
});
