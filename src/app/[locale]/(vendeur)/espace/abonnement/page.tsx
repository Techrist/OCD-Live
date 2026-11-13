import { BadgeCheck } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SubscriptionForm } from "@/components/espace/subscription-form";
import { formatDateTime, formatPrice } from "@/lib/format";
import { paymentMethodsFor } from "@/lib/payment-methods";
import { requireRole } from "@/server/auth/session";
import { db } from "@/server/db";
import { getStudioTimezone } from "@/server/services/catalog";
import { activeSubscriptionEnd, lastSubscriptionEnd, subscriptionPrice } from "@/server/services/subscriptions";

export const dynamic = "force-dynamic";

/** VEN-03 : statut, renouvellement et paiement de l'abonnement annuaire (PAY-10). */
export default async function SubscriptionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireRole(locale, ["SELLER"]);
  const t = await getTranslations("espace.subscription");
  const tz = await getStudioTimezone();
  const [user, active, last, price] = await Promise.all([
    db.user.findUnique({ where: { id: session.sub }, select: { countryCode: true, phone: true } }),
    activeSubscriptionEnd(session.sub),
    lastSubscriptionEnd(session.sub),
    subscriptionPrice(),
  ]);
  const history = await db.subscription.findMany({ where: { sellerId: session.sub, status: { in: ["ACTIVE", "EXPIRED"] } }, orderBy: { startsAt: "desc" }, take: 5 });

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-5 pt-2">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <section className="grad-btn flex flex-col gap-2 rounded-[2rem] p-5">
        {active ? (
          <>
            <p className="flex items-center gap-2 text-xl font-bold"><BadgeCheck aria-hidden="true" className="size-6" /> {t("active")}</p>
            <p className="pill w-fit">{t("until", { date: formatDateTime(last ?? active, tz).slice(0, 10) })}</p>
          </>
        ) : (
          <p className="text-xl font-bold">{t("inactive")}</p>
        )}
        <p className="pill w-fit">{t("price", { price: formatPrice(price) })}</p>
      </section>
      <p className="font-semibold">{t("perks")}</p>
      <SubscriptionForm methods={paymentMethodsFor(user?.countryCode)} defaultPhone={user?.phone ?? ""} priceLabel={formatPrice(price)} renew={!!active} />
      {history.length > 0 && (
        <ul className="flex flex-col gap-2">
          {history.map((h) => (
            <li key={h.id} className="soft flex justify-between gap-2 rounded-3xl px-4 py-3 text-sm font-semibold">
              <span>{formatDateTime(h.startsAt, tz).slice(0, 10)} → {formatDateTime(h.endsAt, tz).slice(0, 10)}</span>
              <span>{h.status === "ACTIVE" ? t("statusActive") : t("statusExpired")}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
