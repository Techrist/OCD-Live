// Décision pure sur le résultat d'un paiement (règle 3 : seul le webhook confirme une réservation).

export type PaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";
export type BookingStatus = "DRAFT" | "HELD" | "CONFIRMED" | "EXPIRED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";

export type Outcome =
  | { action: "IGNORE" } // webhook reçu deux fois : rien à faire (idempotence)
  | { action: "FAIL_PAYMENT" } // la réservation reste bloquée : « Réessayer » possible
  | { action: "CONFIRM" } // paiement réussi : HELD -> CONFIRMED, reçu créé
  | { action: "CONFIRM_LATE" } // blocage expiré mais le créneau est encore libre
  | { action: "NEEDS_REFUND" }; // payé trop tard et créneau pris : à rembourser

export function decideOutcome(input: {
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus | null;
  slotHasRoom: boolean;
  incoming: "SUCCEEDED" | "FAILED";
}): Outcome {
  if (input.paymentStatus !== "PENDING") return { action: "IGNORE" };
  if (input.incoming === "FAILED") return { action: "FAIL_PAYMENT" };
  if (input.bookingStatus === "HELD") return { action: "CONFIRM" };
  if (input.bookingStatus === "EXPIRED" && input.slotHasRoom) return { action: "CONFIRM_LATE" };
  if (input.bookingStatus === "CONFIRMED") return { action: "IGNORE" };
  return { action: "NEEDS_REFUND" };
}
