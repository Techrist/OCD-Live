import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { RescheduleForm } from "@/components/espace/booking-actions";
import { cancellationPolicy } from "@/lib/cancellation";
import { formatDateTime } from "@/lib/format";
import { requireRole } from "@/server/auth/session";
import { db } from "@/server/db";
import { remainingPlaces } from "@/server/services/availability";
import { getSetting, getStudioTimezone } from "@/server/services/catalog";

export const dynamic = "force-dynamic";

/** RES-13 : report gratuit jusqu'à 48 h avant ; au-delà, message clair. */
export default async function ReschedulePage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const session = await requireRole(locale, ["SELLER"]);
  const t = await getTranslations("espace.reschedule");
  const booking = await db.booking.findFirst({ where: { id, sellerId: session.sub, status: "CONFIRMED" }, include: { slot: true } });
  if (!booking) notFound();
  const [tz, freeHours] = await Promise.all([getStudioTimezone(), getSetting<number>("booking.cancelFreeHoursBefore")]);
  const now = new Date();
  const policy = cancellationPolicy(booking.slot.startsAt, now, freeHours);

  let slots: { id: string; label: string }[] = [];
  if (policy.canReschedule) {
    const candidates = await db.slot.findMany({ where: { mode: booking.mode, status: "OPEN", startsAt: { gt: now }, id: { not: booking.slotId } }, orderBy: { startsAt: "asc" }, take: 80 });
    const taken = await db.booking.groupBy({
      by: ["slotId"],
      where: { slotId: { in: candidates.map((s) => s.id) }, OR: [{ status: "CONFIRMED" }, { status: "HELD", holdExpiresAt: { gt: now } }] },
      _count: { _all: true },
    });
    const map = new Map(taken.map((x) => [x.slotId, x._count._all]));
    slots = candidates.filter((s) => remainingPlaces(s, map.get(s.id) ?? 0, now) > 0).map((s) => ({ id: s.id, label: formatDateTime(s.startsAt, tz) }));
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-5 pt-2">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <p className="pill w-fit">{t("current", { date: formatDateTime(booking.slot.startsAt, tz) })}</p>
      {policy.canReschedule ? (
        <RescheduleForm bookingId={booking.id} slots={slots} />
      ) : (
        <p role="alert" className="soft rounded-3xl p-5 font-bold text-red-700">
          {t("errors.TOO_LATE", { hours: Math.max(0, Math.floor(policy.hoursLeft)), free: freeHours })}
        </p>
      )}
    </div>
  );
}
