import { getTranslations, setRequestLocale } from "next-intl/server";
import { setDayClosedAction, openMonthAction } from "@/server/actions/admin";
import { dayKey } from "@/lib/time";
import { todayKey } from "@/lib/format";
import { requireRole } from "@/server/auth/session";
import { monthOverview } from "@/server/services/admin";
import { getStudioTimezone } from "@/server/services/catalog";

export const dynamic = "force-dynamic";

/** ADM-03 : ouvrir un mois, fermer ou rouvrir un jour. */
export default async function CalendarPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ month?: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole(locale, ["ADMIN"]);
  const t = await getTranslations("admin.calendar");
  const tz = await getStudioTimezone();
  const { month: m } = await searchParams;
  const month = m && /^\d{4}-(0[1-9]|1[0-2])$/.test(m) ? m : todayKey(tz).slice(0, 7);
  const { slots } = await monthOverview(month);

  const days = new Map<string, { total: number; open: number }>();
  for (const s of slots) {
    const k = dayKey(s.startsAt, tz);
    const d = days.get(k) ?? { total: 0, open: 0 };
    d.total++;
    if (s.status === "OPEN") d.open++;
    days.set(k, d);
  }

  return (
    <>
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <form className="soft flex flex-wrap items-end gap-3 rounded-[2rem] p-4">
        <label className="flex flex-col text-sm font-bold">
          {t("month")}
          <input type="month" name="month" defaultValue={month} className="soft min-h-12 rounded-full px-4" />
        </label>
        <button type="submit" className="soft min-h-12 rounded-full px-5 font-bold">{t("show")}</button>
        <button type="submit" formAction={openMonthAction} className="grad-btn min-h-12 rounded-full px-5 font-bold">{t("openMonth")}</button>
      </form>
      {days.size === 0 && <p className="font-semibold">{t("none")}</p>}
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[...days.entries()].map(([date, d]) => {
          const closed = d.open === 0;
          return (
            <li key={date} className="soft flex items-center justify-between gap-3 rounded-3xl p-4">
              <span>
                <span className="block text-lg font-bold">{date}</span>
                <span className="block text-sm font-semibold text-ink/70">{closed ? t("closed") : t("openCount", { open: d.open, total: d.total })}</span>
              </span>
              <form action={setDayClosedAction.bind(null, date, !closed)}>
                <button type="submit" className="soft min-h-12 rounded-full px-4 font-bold">{closed ? t("reopenDay") : t("closeDay")}</button>
              </form>
            </li>
          );
        })}
      </ul>
    </>
  );
}
