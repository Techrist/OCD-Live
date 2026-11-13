import { getTranslations, setRequestLocale } from "next-intl/server";
import { formatDateTime } from "@/lib/format";
import { requireRole } from "@/server/auth/session";
import { db } from "@/server/db";
import { getStudioTimezone } from "@/server/services/catalog";

export const dynamic = "force-dynamic";

/** Journal de tous les envois, même simulés (section 17, entité Notification). */
export default async function NotificationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole(locale, ["ADMIN"]);
  const t = await getTranslations("admin.notifications");
  const tz = await getStudioTimezone();
  const rows = await db.notification.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <>
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      {rows.length === 0 && <p className="font-semibold">{t("empty")}</p>}
      <ul className="flex flex-col gap-2">
        {rows.map((n) => (
          <li key={n.id} className="soft flex flex-wrap items-center justify-between gap-2 rounded-3xl px-4 py-3 text-sm font-semibold">
            <span className="font-bold">{n.template}</span>
            <span>{n.channel} → {n.to}</span>
            <span>{n.status} · {formatDateTime(n.createdAt, tz)}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
