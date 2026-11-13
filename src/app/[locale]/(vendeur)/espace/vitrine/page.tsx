import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { updateShowcaseAction } from "@/server/actions/seller";
import { requireRole } from "@/server/auth/session";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

/** ANN-12 / VEN-04 : le vendeur modifie sa vitrine publique. */
export default async function MyShowcasePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireRole(locale, ["SELLER"]);
  const t = await getTranslations("espace.showcase");
  const profile = await db.sellerProfile.findUnique({ where: { userId: session.sub } });
  const field = "soft min-h-14 w-full rounded-3xl px-4 text-lg font-bold";
  if (!profile) return <p className="px-5 font-bold">{t("noProfile")}</p>;
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-5 pt-2">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <Link href={`/v/${profile.slug}`} className="font-bold text-copper-800 underline">{t("view")} →</Link>
      <form action={updateShowcaseAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 font-bold">{t("shop")}<input name="shopName" required defaultValue={profile.shopName} className={field} /></label>
        <label className="flex flex-col gap-1 font-bold">{t("activity")}<input name="activity" required defaultValue={profile.activity} className={field} /></label>
        <label className="flex flex-col gap-1 font-bold">{t("description")}<textarea name="description" rows={4} maxLength={300} defaultValue={profile.description ?? ""} className={`${field} py-3`} /></label>
        <button type="submit" className="grad-btn min-h-16 rounded-3xl text-xl font-bold">{t("save")}</button>
      </form>
    </div>
  );
}
