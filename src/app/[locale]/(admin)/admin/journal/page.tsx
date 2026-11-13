import { getTranslations, setRequestLocale } from "next-intl/server";
import { formatDateTime } from "@/lib/format";
import { requireRole } from "@/server/auth/session";
import { db } from "@/server/db";
import { getStudioTimezone } from "@/server/services/catalog";

export const dynamic = "force-dynamic";

/** ADM-07 : journal des actions du back-office (qui a fait quoi). */
export default async function JournalPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole(locale, ["ADMIN"]);
  const t = await getTranslations("admin.journal");
  const tz = await getStudioTimezone();
  const logs = await db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { actor: { select: { name: true, phone: true } } } });
  return (
    <>
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      {logs.length === 0 && <p className="font-semibold">{t("empty")}</p>}
      <ul className="flex flex-col gap-2">
        {logs.map((l) => (
          <li key={l.id} className="soft flex flex-wrap items-center justify-between gap-2 rounded-3xl px-4 py-3 text-sm font-semibold">
            <span className="font-bold">{l.action}</span>
            <span>{l.entity} · {l.entityId}</span>
            <span>{l.actor?.name ?? l.actor?.phone ?? "—"} · {formatDateTime(l.createdAt, tz)}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
