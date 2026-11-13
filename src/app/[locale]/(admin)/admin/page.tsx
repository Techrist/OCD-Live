import { getTranslations, setRequestLocale } from "next-intl/server";
import { LogoutButton } from "@/components/logout-button";
import { formatPrice, todayKey } from "@/lib/format";
import { hourLabel } from "@/lib/time";
import { TEAM_ROLES } from "@/server/auth/roles";
import { requireRole } from "@/server/auth/session";
import { dayBounds, todayBookings } from "@/server/services/admin";
import { getStudioTimezone } from "@/server/services/catalog";
import { Link } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

/** ADM-01 : « qui passe aujourd'hui, avec quel business, d'où » en un écran. */
export default async function AdminToday({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole(locale, TEAM_ROLES);
  const t = await getTranslations("admin");
  const tz = await getStudioTimezone();
  const { from, to } = await dayBounds(todayKey(tz));
  const bookings = await todayBookings(from, to);

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{t("today.title")}</h1>
        <LogoutButton />
      </div>
      {bookings.length === 0 ? (
        <p className="soft rounded-3xl p-5 font-semibold">{t("today.empty")}</p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {bookings.map((b) => {
            const pay = b.payments[0]?.status ?? "NONE";
            return (
              <li key={b.id} className="soft flex flex-col gap-2 rounded-[2rem] p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-2xl font-bold">{hourLabel(b.slot.startsAt, tz)}</span>
                  <span className="pill">{t(`mode.${b.mode}`)}</span>
                </div>
                <p className="text-lg font-bold">{b.seller.sellerProfile?.shopName ?? b.seller.name ?? b.seller.phone}</p>
                <p className="text-sm font-semibold text-ink/70">
                  {b.seller.name} · {b.seller.country?.name ?? "—"} · {b.seller.phone}
                </p>
                <p className="text-sm">{b.seller.sellerProfile?.activity}</p>
                <div className="flex flex-wrap gap-2 text-sm font-bold">
                  <span className="pill">{b.package.name} · {formatPrice(b.amount)}</span>
                  <span className="pill">{t(`payStatus.${pay}`)}</span>
                  <span className="pill">{b.assistant?.name ?? t("today.unassigned")}</span>
                </div>
                <Link href={`/admin/reservations/${b.id}`} className="font-bold text-copper-800 underline">
                  {b.reference}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
