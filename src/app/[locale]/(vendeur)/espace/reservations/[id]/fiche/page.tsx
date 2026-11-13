import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProductSheetForm } from "@/components/espace/booking-actions";
import { requireRole } from "@/server/auth/session";
import { db } from "@/server/db";
import { productSheetSchema } from "@/server/services/reservations";

export const dynamic = "force-dynamic";

/** RES-11 : fiche produit avant le live, que la régie reçoit à l'avance. */
export default async function ProductSheetPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const session = await requireRole(locale, ["SELLER"]);
  const t = await getTranslations("espace.sheet");
  const booking = await db.booking.findFirst({ where: { id, sellerId: session.sub, status: { in: ["CONFIRMED", "HELD"] } }, include: { seller: true } });
  if (!booking) notFound();
  const parsed = productSheetSchema.safeParse(booking.productSheet);
  const initial = parsed.success ? parsed.data : { address: "", phone: booking.seller.phone, products: [] };
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-5 pt-2">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <p className="font-semibold text-ink/70">{t("intro")}</p>
      <ProductSheetForm bookingId={booking.id} initial={initial} />
    </div>
  );
}
