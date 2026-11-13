"use client";

import { useState } from "react";
import { MessageCircle, Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { clampQuantity, orderHref } from "@/lib/shop";
import { formatPrice } from "@/lib/format";

/** SHP-02 : commande par un message WhatsApp prérempli (produit, quantité, prix). Aucun paiement sur le site. */
export function OrderButton({ sellerId, name, price, stock, compact = false }: { sellerId: string; name: string; price: number; stock: number | null; compact?: boolean }) {
  const t = useTranslations("shop");
  const [qty, setQty] = useState(1);
  const message = t("order.message", { name, qty, price: formatPrice(price), total: formatPrice(price * qty) });
  const soldOut = stock !== null && stock <= 0;
  return (
    <div className="flex flex-col gap-2">
      {!soldOut && (
        <div className={compact ? "hidden" : "flex items-center justify-between gap-2"} role="group" aria-label={t("order.quantity")}>
          <button type="button" aria-label={t("order.less")} onClick={() => setQty((q) => clampQuantity(q - 1, stock))} className="soft grid size-11 place-items-center rounded-full"><Minus aria-hidden="true" className="size-5" /></button>
          <output aria-live="polite" className="min-w-8 text-center text-lg font-bold tabular-nums">{qty}</output>
          <button type="button" aria-label={t("order.more")} onClick={() => setQty((q) => clampQuantity(q + 1, stock))} className="soft grid size-11 place-items-center rounded-full"><Plus aria-hidden="true" className="size-5" /></button>
        </div>
      )}
      {soldOut ? (
        <p className="min-h-12 rounded-2xl bg-wall-2 px-4 py-3 text-center font-bold text-ink/70">{t("soldOut")}</p>
      ) : (
        <a href={orderHref(sellerId, message)} target="_blank" rel="noopener noreferrer" data-testid="order-link" className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-wa px-4 font-bold text-white">
          <MessageCircle aria-hidden="true" className="size-5" /> {t("order.cta")}
        </a>
      )}
    </div>
  );
}
