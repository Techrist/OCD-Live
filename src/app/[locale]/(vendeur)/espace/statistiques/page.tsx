import { Eye, MessageCircle, Play } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireRole } from "@/server/auth/session";
import { sellerStats } from "@/server/services/stats";

export const dynamic = "force-dynamic";

/** ANN-16 : de quoi prouver le retour sur les 5 000 F de l'abonnement. */
export default async function StatsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireRole(locale, ["SELLER"]);
  const t = await getTranslations("espace.stats");
  const stats = await sellerStats(session.sub, 30);
  const items = [
    { icon: Eye, label: t("views"), value: stats.views },
    { icon: Play, label: t("liveClicks"), value: stats.liveClicks },
    { icon: MessageCircle, label: t("whatsappClicks"), value: stats.whatsappClicks },
  ];
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-5 pt-2">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <p className="pill w-fit">{t("last30")}</p>
      <ul className="flex flex-col gap-3">
        {items.map(({ icon: Icon, label, value }) => (
          <li key={label} className="soft flex items-center gap-4 rounded-[2rem] p-4">
            <span aria-hidden="true" className="grid size-14 place-items-center rounded-full grad-btn"><Icon className="size-7" /></span>
            <span className="flex-1 text-lg font-bold">{label}</span>
            <span className="text-3xl font-bold text-copper-800">{value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
