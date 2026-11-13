import { BadgeDollarSign, CalendarPlus, Eye, MessageCircle, Play, ShoppingBag, Radio, Store } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LogoutButton } from "@/components/logout-button";
import { BigActionButton } from "@/components/ui/big-action-button";
import { Link } from "@/i18n/navigation";
import { formatDateTime, formatPrice } from "@/lib/format";
import { requireRole } from "@/server/auth/session";
import { db } from "@/server/db";
import { getStudioTimezone } from "@/server/services/catalog";
import { sellerStats } from "@/server/services/stats";
import { activeSubscriptionEnd } from "@/server/services/subscriptions";

export const dynamic = "force-dynamic";

/** VEN-02 : tableau de bord (prochain live, chiffres clés, accès rapides). Un vendeur ne voit que ses propres données. */
export default async function EspacePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireRole(locale, ["SELLER"]);
  const t = await getTranslations("espace");
  const tz = await getStudioTimezone();
  const now = new Date();
  const [user, next, upcoming, products, stats, subscriptionEnd, profile] = await Promise.all([
    db.user.findUnique({ where: { id: session.sub }, select: { name: true } }),
    db.booking.findFirst({
      where: { sellerId: session.sub, status: "CONFIRMED", slot: { startsAt: { gt: now } } },
      orderBy: { slot: { startsAt: "asc" } },
      include: { slot: true, package: { select: { name: true } } },
    }),
    db.booking.count({ where: { sellerId: session.sub, status: "CONFIRMED", slot: { startsAt: { gt: now } } } }),
    db.product.count({ where: { sellerId: session.sub, active: true } }),
    sellerStats(session.sub, 30),
    activeSubscriptionEnd(session.sub),
    db.sellerProfile.findUnique({ where: { userId: session.sub }, select: { slug: true } }),
  ]);
  const figures = [
    { icon: CalendarPlus, label: t("figures.upcoming"), value: upcoming },
    { icon: ShoppingBag, label: t("figures.products"), value: products },
    { icon: Eye, label: t("figures.views"), value: stats.views },
    { icon: MessageCircle, label: t("figures.whatsapp"), value: stats.whatsappClicks },
  ];
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-semibold text-ink/70">{t("hello")}{user?.name ? `, ${user.name}` : ""}</p>
          <h1 className="text-3xl md:text-4xl">{t("title")}</h1>
        </div>
        {profile && <Link href={`/v/${profile.slug}`} className="pill font-bold">{t("viewShowcase")} →</Link>}
      </div>

      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-label={t("figures.label")}>
        {figures.map(({ icon: Icon, label, value }) => (
          <li key={label} className="flex items-center gap-3 rounded-3xl border border-ink/10 bg-white p-4">
            <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full bg-amber-soft text-copper-800"><Icon className="size-5" /></span>
            <span className="flex flex-col"><span className="text-2xl leading-none font-bold tabular-nums">{value}</span><span className="text-sm font-semibold text-ink/70">{label}</span></span>
          </li>
        ))}
      </ul>

      <div className="grid gap-4 md:grid-cols-3">
        <section className="grad-btn flex flex-col gap-2 rounded-[2rem] p-6 md:col-span-2" aria-labelledby="next-live">
          <h2 id="next-live" className="text-lg font-bold">{t("next")}</h2>
          {next ? (
            <>
              <p className="text-3xl font-bold">{formatDateTime(next.slot.startsAt, tz)}</p>
              <p className="flex flex-wrap gap-2">
                <span className="pill">{next.package.name} · {formatPrice(next.amount)}</span>
                <span className="pill">{next.mode === "ONSITE" ? t("onsite") : t("remote")} {t("lome")}</span>
              </p>
              <Link href="/espace/reservations" className="mt-2 w-fit rounded-2xl bg-white px-5 py-2 font-bold text-copper-800">{t("bookings")}</Link>
            </>
          ) : (
            <>
              <p className="pill w-fit">{t("noNext")}</p>
              <Link href="/reserver" className="mt-2 flex min-h-12 w-fit items-center gap-2 rounded-2xl bg-white px-6 font-bold text-copper-800"><CalendarPlus aria-hidden="true" className="size-5" /> {t("book")}</Link>
            </>
          )}
        </section>
        <section className="flex flex-col justify-between gap-3 rounded-[2rem] border border-ink/10 bg-white p-6" aria-labelledby="sub">
          <div>
            <h2 id="sub" className="text-lg font-bold">{t("subscriptionLink")}</h2>
            <p className="font-semibold text-ink/70">{subscriptionEnd ? t("subActive", { date: new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: tz }).format(subscriptionEnd) }) : t("subNone")}</p>
          </div>
          <Link href="/espace/abonnement" className="flex min-h-12 w-fit items-center gap-2 rounded-2xl bg-ink px-5 font-bold text-white"><BadgeDollarSign aria-hidden="true" className="size-5" /> {subscriptionEnd ? t("subManage") : t("subStart")}</Link>
        </section>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <BigActionButton href="/espace/produits" icon={<ShoppingBag />} label={t("productsLink")} hint={t("productsHint")} variant="light" />
        <BigActionButton href="/espace/soumettre-live" icon={<Radio />} label={t("submitLive")} hint={t("submitHint")} variant="light" />
        <BigActionButton href="/espace/vitrine" icon={<Store />} label={t("showcaseLink")} hint={t("showcaseHint")} variant="light" />
        <BigActionButton href="/espace/statistiques" icon={<Play />} label={t("statsLink")} hint={t("statsHint")} variant="light" />
      </div>
      <LogoutButton />
    </div>
  );
}
