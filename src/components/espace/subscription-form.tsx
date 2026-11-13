"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { PaymentMethod } from "@/lib/payment-methods";
import { cn } from "@/lib/utils";

/** Abonnement annuaire : choix du moyen de paiement puis paiement (PAY-10 : un clic au renouvellement). */
export function SubscriptionForm({ methods, defaultPhone, priceLabel, renew }: { methods: PaymentMethod[]; defaultPhone: string; priceLabel: string; renew: boolean }) {
  const t = useTranslations("espace.subscription");
  const tm = useTranslations("booking.payment.methods");
  const locale = useLocale();
  const [method, setMethod] = useState<PaymentMethod>();
  const [phone, setPhone] = useState(defaultPhone);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function pay() {
    if (!method) return;
    setBusy(true);
    setError(undefined);
    const res = await fetch("/api/subscriptions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method, payerPhone: phone, returnUrl: `/${locale}/espace/abonnement` }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setBusy(false);
    if (data?.ok && data.redirectUrl) return void (window.location.href = data.redirectUrl);
    setError(t("error"));
  }

  return (
    <div className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-lg font-bold">{t("chooseMethod")}</legend>
        {methods.map((m) => (
          <button key={m} type="button" aria-pressed={method === m} onClick={() => setMethod(m)} className="soft min-h-16 w-full rounded-3xl px-4 text-left text-xl font-bold">
            {tm(m)}
          </button>
        ))}
      </fieldset>
      <label className="flex flex-col gap-1 text-lg font-bold">
        {t("phoneLabel")}
        <input type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="soft min-h-14 rounded-3xl px-4 text-xl font-bold" />
      </label>
      {error && <p role="alert" className="font-bold text-red-700">{error}</p>}
      <button type="button" disabled={!method || busy} onClick={pay} className={cn("grad-btn min-h-16 w-full rounded-3xl text-xl font-bold disabled:opacity-50")}>
        {renew ? t("renew", { price: priceLabel }) : t("subscribe", { price: priceLabel })}
      </button>
    </div>
  );
}
