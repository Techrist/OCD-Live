import { getTranslations, setRequestLocale } from "next-intl/server";
import { AssistedBookingForm } from "@/components/admin/assisted-booking-form";
import { formatDateTime } from "@/lib/format";
import { requireRole } from "@/server/auth/session";
import { db } from "@/server/db";
import { getStudioTimezone } from "@/server/services/catalog";

export const dynamic = "force-dynamic";

/** RES-17 : un conseiller crée la réservation à la place du vendeur qui préfère appeler. */
export default async function NewBookingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole(locale, ["ADMIN", "STUDIO"]);
  const t = await getTranslations("admin");
  const tz = await getStudioTimezone();
  const [packages, slots] = await Promise.all([
    db.package.findMany({ where: { active: true, quoteOnly: false }, orderBy: { order: "asc" }, select: { slug: true, name: true } }),
    db.slot.findMany({ where: { status: "OPEN", startsAt: { gt: new Date() } }, orderBy: [{ startsAt: "asc" }, { mode: "asc" }], take: 120 }),
  ]);
  return (
    <>
      <h1 className="text-2xl font-semibold">{t("assisted.title")}</h1>
      <AssistedBookingForm
        packages={packages}
        slots={slots.map((s) => ({ id: s.id, label: `${formatDateTime(s.startsAt, tz)} · ${t(`mode.${s.mode}`)}` }))}
      />
    </>
  );
}
