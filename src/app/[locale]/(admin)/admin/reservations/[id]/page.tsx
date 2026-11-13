import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { formatDateTime, formatPrice } from "@/lib/format";
import { requireRole } from "@/server/auth/session";
import { assignAssistantAction, cancelBookingAction, studioPaymentAction } from "@/server/actions/admin";
import { db } from "@/server/db";
import { getBookingDetail } from "@/server/services/admin";
import { getStudioTimezone } from "@/server/services/catalog";
import { productSheetSchema } from "@/server/services/reservations";

export const dynamic = "force-dynamic";

export default async function BookingDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const session = await requireRole(locale, ["ADMIN", "STUDIO"]);
  const t = await getTranslations("admin");
  const tz = await getStudioTimezone();
  const b = await getBookingDetail(id);
  if (!b) notFound();
  const assistants = await db.user.findMany({ where: { role: "ASSISTANT" }, select: { id: true, name: true, phone: true } });
  const isAdmin = session.role === "ADMIN";
  const sheet = productSheetSchema.safeParse(b.productSheet);

  const row = (label: string, value: React.ReactNode) => (
    <div className="flex justify-between gap-3">
      <dt className="font-semibold">{label}</dt>
      <dd className="text-right font-bold">{value}</dd>
    </div>
  );

  return (
    <>
      <h1 className="text-2xl font-semibold">{b.reference}</h1>
      <dl className="soft flex max-w-xl flex-col gap-2 rounded-[2rem] p-5">
        {row(t("booking.status"), t(`status.${b.status}`))}
        {row(t("booking.seller"), `${b.seller.name ?? "—"} · ${b.seller.phone}`)}
        {row(t("booking.shop"), b.seller.sellerProfile?.shopName ?? "—")}
        {row(t("booking.country"), b.seller.country?.name ?? "—")}
        {row(t("booking.offer"), `${b.package.name} · ${t(`mode.${b.mode}`)}`)}
        {row(t("booking.slot"), formatDateTime(b.slot.startsAt, tz))}
        {row(t("booking.amount"), formatPrice(b.amount))}
        {b.cancelReason && row(t("booking.cancelReason"), b.cancelReason)}
      </dl>

      <section className="soft flex max-w-xl flex-col gap-2 rounded-[2rem] p-5">
        <h2 className="text-lg font-bold">{t("booking.payments")}</h2>
        {b.payments.length === 0 && <p>{t("payStatus.NONE")}</p>}
        {b.payments.map((p) => (
          <p key={p.id} className="text-sm font-semibold">
            {p.method} · {formatPrice(p.amount)} · {t(`payStatus.${p.status}`)} {p.receipt && `· ${p.receipt.number}`}
          </p>
        ))}
      </section>

      {b.checkInAt && (
        <p className="pill w-fit">{t("booking.checkedIn", { time: formatDateTime(b.checkInAt, tz) })}</p>
      )}
      {sheet.success && (
        <section className="soft flex max-w-xl flex-col gap-2 rounded-[2rem] p-5">
          <h2 className="text-lg font-bold">{t("booking.sheet")}</h2>
          <p className="text-sm font-semibold">{sheet.data.address} · {sheet.data.phone}</p>
          <ul className="flex flex-col gap-1">
            {sheet.data.products.map((p, i) => (
              <li key={i} className="flex justify-between gap-3 text-sm font-bold"><span>{p.name}</span><span>{p.quantity} × {formatPrice(p.price)}</span></li>
            ))}
          </ul>
        </section>
      )}

      {b.status === "HELD" && (
        <form action={studioPaymentAction.bind(null, b.id)}>
          <button type="submit" className="grad-btn min-h-14 rounded-full px-6 text-lg font-bold">{t("booking.studioPay")}</button>
        </form>
      )}

      {isAdmin && (
        <>
          <form action={assignAssistantAction.bind(null, b.id)} className="soft flex max-w-xl flex-wrap items-end gap-3 rounded-[2rem] p-5">
            <label className="flex flex-col text-sm font-bold">
              {t("booking.assistant")}
              <select name="assistantId" defaultValue={b.assistantId ?? ""} className="soft min-h-12 rounded-full px-4">
                <option value="">{t("today.unassigned")}</option>
                {assistants.map((a) => (
                  <option key={a.id} value={a.id}>{a.name ?? a.phone}</option>
                ))}
              </select>
            </label>
            <button type="submit" className="soft min-h-12 rounded-full px-5 font-bold">{t("common.save")}</button>
          </form>
          {(b.status === "HELD" || b.status === "CONFIRMED") && (
            <form action={cancelBookingAction.bind(null, b.id)} className="flex max-w-xl flex-wrap items-end gap-3">
              <input name="reason" required placeholder={t("booking.cancelReason")} className="soft min-h-12 flex-1 rounded-full px-4" />
              <button type="submit" className="min-h-12 rounded-full bg-ink px-5 font-bold text-white">{t("booking.cancel")}</button>
            </form>
          )}
        </>
      )}
    </>
  );
}
