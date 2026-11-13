import { BadgeCheck, MessageCircle, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CategoryIcon } from "@/components/ui/category-icon";
import { Flag } from "@/components/ui/flag";

export type LiveCardData = {
  id: string;
  sellerId: string;
  shop: string;
  city: string | null;
  category: { name: string; icon: string };
  slug: string | null;
  verified: boolean;
  country?: { code: string; name: string };
};

/** Fiche live (ANN-05) : boutique, catégorie, ville, « Voir le live » et WhatsApp (clics comptés par /api/go). */
export function LiveCard({ live, waMessage }: { live: LiveCardData; waMessage: string }) {
  const t = useTranslations("lives");
  return (
    <li className="soft flex flex-col gap-3 rounded-[2rem] p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-full bg-wall-2 text-copper-800">
            <CategoryIcon name={live.category.icon} className="size-6" />
          </span>
          <div>
            <p className="text-lg leading-tight font-bold">{live.shop}</p>
            <p className="text-sm font-semibold text-ink/70">{live.category.name}{live.city ? ` · ${live.city}` : ""}</p>
          </div>
        </div>
        <span className="pill !bg-red-600 !text-white">{t("live")}</span>
      </div>
      {live.country && (
        <p className="flex items-center gap-2 text-sm font-bold"><Flag code={live.country.code} className="h-4 w-6 rounded-sm ring-1 ring-ink/30" /> {live.country.name}</p>
      )}
      {live.verified && (
        <p className="flex items-center gap-1 text-sm font-bold text-copper-800">
          <BadgeCheck aria-hidden="true" className="size-5" /> {t("verified")}
        </p>
      )}
      <div className="grid grid-cols-2 gap-2">
        <a href={`/api/go?t=live&id=${live.id}`} target="_blank" rel="noopener noreferrer" className="grad-btn flex min-h-14 items-center justify-center gap-2 rounded-full font-bold">
          <Play aria-hidden="true" className="size-5" /> {t("watch")}
        </a>
        <a href={`/api/go?t=wa&id=${live.sellerId}&m=${encodeURIComponent(waMessage)}`} target="_blank" rel="noopener noreferrer" className="flex min-h-14 items-center justify-center gap-2 rounded-full bg-wa font-bold text-white">
          <MessageCircle aria-hidden="true" className="size-5" /> {t("whatsapp")}
        </a>
      </div>
      {live.slug && (
        <Link href={`/v/${live.slug}`} className="text-center font-bold text-copper-800 underline">{t("showcase")}</Link>
      )}
    </li>
  );
}
