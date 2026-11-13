import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireRole } from "@/server/auth/session";
import { updateSettingAction } from "@/server/actions/admin";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

/** ADM-04 : durée de blocage, délai d'annulation, prix de l'abonnement, horaires… (valeurs JSON). */
export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole(locale, ["ADMIN"]);
  const t = await getTranslations("admin.settings");
  const settings = await db.setting.findMany({ orderBy: { key: "asc" } });
  return (
    <>
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <p className="font-semibold text-ink/70">{t("hint")}</p>
      <ul className="flex flex-col gap-3">
        {settings.map((s) => (
          <li key={s.id}>
            <form action={updateSettingAction.bind(null, s.key)} className="soft flex flex-wrap items-center gap-3 rounded-3xl p-4">
              <label htmlFor={s.key} className="w-full font-bold break-all sm:w-72">{s.key}</label>
              <input id={s.key} name="value" defaultValue={JSON.stringify(s.value)} className="soft min-h-12 flex-1 rounded-full px-4 font-mono" />
              <button type="submit" className="grad-btn min-h-12 rounded-full px-5 font-bold">{t("save")}</button>
            </form>
          </li>
        ))}
      </ul>
    </>
  );
}
