import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireRole } from "@/server/auth/session";
import { updatePackageAction } from "@/server/actions/admin";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

/** PKG-03 / ADM-04 : prix, durée, nombre de lives, visibilité et ordre modifiables sans développeur. */
export default async function PackagesAdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole(locale, ["ADMIN"]);
  const t = await getTranslations("admin.packages");
  const packages = await db.package.findMany({ orderBy: { order: "asc" } });
  const input = "soft min-h-12 w-full rounded-full px-4 font-bold";
  return (
    <>
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <ul className="grid gap-4 md:grid-cols-2">
        {packages.map((p) => (
          <li key={p.id}>
            <form action={updatePackageAction.bind(null, p.id)} className="soft grid grid-cols-2 gap-3 rounded-[2rem] p-5">
              <label className="col-span-2 flex flex-col text-sm font-bold">{t("name")}<input name="name" defaultValue={p.name} required className={input} /></label>
              <label className="flex flex-col text-sm font-bold">{t("price")}<input name="price" type="number" min={0} defaultValue={p.price} className={input} /></label>
              <label className="flex flex-col text-sm font-bold">{t("duration")}<input name="durationMinutes" type="number" min={15} defaultValue={p.durationMinutes} className={input} /></label>
              <label className="flex flex-col text-sm font-bold">{t("lives")}<input name="liveCount" type="number" min={1} defaultValue={p.liveCount} className={input} /></label>
              <label className="flex flex-col text-sm font-bold">{t("order")}<input name="order" type="number" min={0} defaultValue={p.order} className={input} /></label>
              <label className="flex items-center gap-2 font-bold"><input name="active" type="checkbox" defaultChecked={p.active} className="size-6" />{t("active")}</label>
              <label className="flex items-center gap-2 font-bold"><input name="highlighted" type="checkbox" defaultChecked={p.highlighted} className="size-6" />{t("highlighted")}</label>
              <button type="submit" className="grad-btn col-span-2 min-h-12 rounded-full font-bold">{t("save")}</button>
            </form>
          </li>
        ))}
      </ul>
    </>
  );
}
