import { Download } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BookingLinks, CancelButton } from "@/components/espace/booking-actions";
import { cancellationPolicy } from "@/lib/cancellation";
import { formatDateTime, formatPrice } from "@/lib/format";
import { requireRole } from "@/server/auth/session";
import { db } from "@/server/db";
import { getSetting, getStudioTimezone } from "@/server/services/catalog";

export const dynamic = "force-dynamic";

/** VEN-02 : réservations à venir et passées, reçus, report et annulation (seulement les siennes). */
export default async function MyBookingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireRole(locale, ["SELLER"]);
  const t = await getTranslations("espace");
  const [tz, freeHours] = await Promise.all([getStudioTimezone(), getSetting<number>("booking.cancelFreeHoursBefore")]);
  const now = new Date();
  const bookings = await db.booking.findMany({
    where: { sellerId: session.sub, status: { in: ["CONFIRMED", "COMPLETED", "NO_SHOW", "CANCELLED"] } },
    orderBy: { slot: { startsAt: "desc" } },
    include: { slot: true, package: { select: { name: true } }, payments: { include: { receipt: true }, orderBy: { createdAt: "desc" }, take: 1 } },
  });
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-5 pt-2">
      <h1 className="text-2xl font-semibold">{t("bookings")}</h1>
      {bookings.length === 0 && <p className="soft rounded-3xl p-5 font-semibold">{t("empty")}</p>}
      <ul className="flex flex-col gap-3">
        {bookings.map((b) => {
          const receipt = b.payments[0]?.receipt;
          const upcoming = b.status === "CONFIRMED" && b.slot.startsAt > now;
          const policy = cancellationPolicy(b.slot.startsAt, now, freeHours);
          return (
            <li key={b.id} className="soft flex flex-col gap-2 rounded-[2rem] p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-lg font-bold">{formatDateTime(b.slot.startsAt, tz)}</span>
                <span className="pill">{t(`status.${b.status}`)}</span>
              </div>
              <p className="font-semibold">{b.package.name} · {formatPrice(b.amount)} · {b.reference}</p>
              {receipt && (
                <a href={`/api/receipts/${receipt.number}.pdf`} className="inline-flex min-h-12 items-center gap-2 font-bold text-copper-800 underline">
                  <Download aria-hidden="true" className="size-5" /> {t("receipt")} {receipt.number}
                </a>
              )}
              {upcoming && (
                <>
                  <BookingLinks bookingId={b.id} />
                  <CancelButton bookingId={b.id} refundable={policy.refundable} />
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
