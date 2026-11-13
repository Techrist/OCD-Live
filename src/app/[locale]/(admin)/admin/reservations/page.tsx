import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { formatDateTime, formatPrice } from "@/lib/format";
import { requireRole } from "@/server/auth/session";
import { listBookings } from "@/server/services/admin";
import { getStudioTimezone } from "@/server/services/catalog";

export const dynamic = "force-dynamic";
const STATUSES = ["DRAFT", "HELD", "CONFIRMED", "EXPIRED", "CANCELLED", "COMPLETED", "NO_SHOW"];

export default async function BookingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string; date?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole(locale, ["ADMIN", "STUDIO"]);
  const { status, date } = await searchParams;
  const t = await getTranslations("admin");
  const tz = await getStudioTimezone();
  const bookings = await listBookings({
    status: status && STATUSES.includes(status) ? status : undefined,
    date: date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined,
  });

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{t("bookings.title")}</h1>
        <Link href="/admin/reservations/nouvelle" className="grad-btn inline-flex min-h-12 items-center rounded-full px-5 font-bold">
          {t("bookings.new")}
        </Link>
      </div>
      <form className="soft flex flex-wrap items-end gap-3 rounded-[2rem] p-4">
        <label className="flex flex-col text-sm font-bold">
          {t("bookings.filterStatus")}
          <select name="status" defaultValue={status ?? ""} className="soft min-h-12 rounded-full px-4">
            <option value="">{t("bookings.all")}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{t(`status.${s}`)}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col text-sm font-bold">
          {t("bookings.filterDate")}
          <input type="date" name="date" defaultValue={date ?? ""} className="soft min-h-12 rounded-full px-4" />
        </label>
        <button type="submit" className="grad-btn min-h-12 rounded-full px-6 font-bold">{t("bookings.filter")}</button>
      </form>
      {bookings.length === 0 ? (
        <p className="font-semibold">{t("bookings.empty")}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {bookings.map((b) => (
            <li key={b.id}>
              <Link href={`/admin/reservations/${b.id}`} className="soft flex flex-wrap items-center justify-between gap-2 rounded-3xl p-4">
                <span>
                  <span className="block font-bold">{b.reference}</span>
                  <span className="block text-sm font-semibold text-ink/70">
                    {b.seller.sellerProfile?.shopName ?? b.seller.name ?? b.seller.phone} · {b.package.name}
                  </span>
                </span>
                <span className="text-right text-sm font-semibold">
                  <span className="block">{formatDateTime(b.slot.startsAt, tz)}</span>
                  <span className="block">{formatPrice(b.amount)} · {t(`status.${b.status}`)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
