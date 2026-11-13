import "server-only";
import { getPaymentProvider, paymentProviderName } from "@/server/adapters/payment";
import type { PaymentMethod } from "@/lib/payment-methods";
import { db } from "@/server/db";
import { getSetting } from "./catalog";

/** Abonnement actif = statut ACTIVE et période en cours (règle 4 : seul un abonné actif soumet un live). */
export async function activeSubscriptionEnd(sellerId: string, now: Date = new Date()): Promise<Date | null> {
  const sub = await db.subscription.findFirst({
    where: { sellerId, status: "ACTIVE", startsAt: { lte: now }, endsAt: { gt: now } },
    orderBy: { endsAt: "desc" },
  });
  return sub?.endsAt ?? null;
}

/** Date de fin la plus lointaine (renouvellements déjà payés compris), pour l'affichage. */
export async function lastSubscriptionEnd(sellerId: string): Promise<Date | null> {
  const r = await db.subscription.aggregate({ where: { sellerId, status: "ACTIVE" }, _max: { endsAt: true } });
  return r._max.endsAt;
}

export async function subscriptionPrice(): Promise<number> {
  return getSetting<number>("subscription.priceFcfa");
}

/** Démarre le paiement de l'abonnement (POST /api/subscriptions) : abonnement en attente + paiement chez le fournisseur. */
export async function startSubscriptionPayment(input: { sellerId: string; method: PaymentMethod; payerPhone: string; returnUrl: string }) {
  const amount = await subscriptionPrice();
  const now = new Date();
  const sub = await db.subscription.create({
    data: { sellerId: input.sellerId, status: "PENDING", startsAt: now, endsAt: now },
  });
  const providerName = paymentProviderName();
  const created = await getPaymentProvider(providerName).createPayment({
    reference: `SUB-${sub.id}`,
    amount,
    currency: "XOF",
    method: input.method,
    payerPhone: input.payerPhone,
    returnUrl: input.returnUrl,
  });
  await db.payment.create({
    data: {
      subscriptionId: sub.id,
      provider: providerName,
      method: input.method,
      amount,
      currency: "XOF",
      providerRef: created.providerRef,
      payerPhone: input.payerPhone,
      raw: { returnUrl: input.returnUrl },
    },
  });
  return { redirectUrl: created.redirectUrl };
}

/** Passe en « expiré » les abonnements dont la période est terminée (cron). */
export async function expireSubscriptions(now: Date = new Date()): Promise<number> {
  const res = await db.subscription.updateMany({ where: { status: "ACTIVE", endsAt: { lte: now } }, data: { status: "EXPIRED" } });
  return res.count;
}
