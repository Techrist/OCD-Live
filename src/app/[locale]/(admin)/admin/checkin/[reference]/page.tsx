import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { formatDateTime, formatPrice } from "@/lib/format";
import { assertRole } from "@/server/auth/roles";
import { readSession, requireRole } from "@/server/auth/session";
import { db } from "@/server/db";
import { getStudioTimezone } from "@/server/services/catalog";
import { checkIn } from "@/server/services/reservations";

export const dynamic = "force-dynamic";

/** RES-14 : page ouverte en scannant le QR du reçu ; la régie (STUDIO) ou l'admin valide l'arrivée. */
export default async function CheckInPage({ params, searchParams }: { params: Promise<{ locale: string; reference: string }>; searchParams: Promise<{ done?: string }> }) {
  const { locale, reference } = await params;
  setRequestLocale(locale);
  await requireRole(locale, ["STUDIO", "ADMIN"]);
  const t = await getTranslations("admin.checkin");
  const tz = await getStudioTimezone();
  const { done } = await searchParams;
  const b = await db.booking.findUnique({ where: { reference }, include: { slot: true, package: true, seller: { include: { sellerProfile: true } } } });
  if (!b) notFound();

  async function confirm() {
    "use server";
    const s = assertRole(await readSession(), ["STUDIO", "ADMIN"]);
    const res = await checkIn(reference, s.sub);
    const { redirect } = await import("@/i18n/navigation");
    redirect({ href: `/admin/checkin/${reference}?done=${res.ok ? (res.alreadyDone ? "already" : "ok") : res.reason}`, locale });
  }

  return (
    <>
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <dl className="soft flex max-w-xl flex-col gap-2 rounded-[2rem] p-5">
        <div className="flex justify-between gap-3"><dt className="font-semibold">{t("reference")}</dt><dd className="font-bold">{b.reference}</dd></div>
        <div className="flex justify-between gap-3"><dt className="font-semibold">{t("seller")}</dt><dd className="text-right font-bold">{b.seller.sellerProfile?.shopName ?? b.seller.name ?? b.seller.phone}</dd></div>
        <div className="flex justify-between gap-3"><dt className="font-semibold">{t("slot")}</dt><dd className="font-bold">{formatDateTime(b.slot.startsAt, tz)}</dd></div>
        <div className="flex justify-between gap-3"><dt className="font-semibold">{t("offer")}</dt><dd className="font-bold">{b.package.name} · {formatPrice(b.amount)}</dd></div>
        <div className="flex justify-between gap-3"><dt className="font-semibold">{t("status")}</dt><dd className="font-bold">{b.checkInAt ? t("checkedIn", { time: formatDateTime(b.checkInAt, tz) }) : t("notYet")}</dd></div>
      </dl>
      {done && (
        <p role="status" className={done === "ok" || done === "already" ? "font-bold text-wa" : "font-bold text-red-700"}>{t(`result.${done}`)}</p>
      )}
      {!b.checkInAt && (
        <form action={confirm}>
          <button type="submit" className="grad-btn min-h-16 w-full max-w-xl rounded-3xl text-xl font-bold">{t("confirm")}</button>
        </form>
      )}
    </>
  );
}
