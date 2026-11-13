import Image from "next/image";
import { BadgeCheck, MapPin, MessageCircle, Play } from "lucide-react";
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
  /** Aperçu : photo du compte, photo d'un produit ou visuel de la catégorie (voir lib/live-image.ts). */
  image: string;
};

/** Fiche live (ANN-05) : aperçu, boutique, catégorie, ville, « Voir le live » et WhatsApp (clics comptés par /api/go). */
export function LiveCard({ live, waMessage }: { live: LiveCardData; waMessage: string }) {
  const t = useTranslations("lives");
  return (
    <li className="flex flex-col overflow-hidden rounded-[2rem] border border-ink/10 bg-white shadow-sm">
      <a href={`/api/go?t=live&id=${live.id}`} target="_blank" rel="noopener noreferrer" aria-label={`${t("watch")} : ${live.shop}`} className="group relative block aspect-video overflow-hidden bg-amber-soft">
        <Image src={live.image} alt="" fill sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-300 group-hover:scale-105" unoptimized={live.image.startsWith("/api/files/")} />
        <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-ink/10" />
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-sm font-bold text-white shadow">
          <span aria-hidden="true" className="size-2 animate-pulse rounded-full bg-white" /> {t("live")}
        </span>
        {live.country && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold">
            <Flag code={live.country.code} className="h-3.5 w-5 rounded-sm ring-1 ring-ink/30" /> {live.country.name}
          </span>
        )}
        <span aria-hidden="true" className="absolute right-3 bottom-3 grid size-12 place-items-center rounded-full bg-white/95 text-copper-800 shadow-lg transition group-hover:scale-110">
          <Play className="size-6 translate-x-0.5" />
        </span>
      </a>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full bg-wall-2 text-copper-800">
            <CategoryIcon name={live.category.icon} className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-1 truncate text-lg leading-tight font-bold">
              {live.shop}
              {live.verified && <BadgeCheck aria-label={t("verified")} className="size-5 shrink-0 text-copper-800" />}
            </p>
            <p className="flex items-center gap-1 text-sm font-semibold text-ink/70">
              {live.category.name}
              {live.city && <><span aria-hidden="true">·</span><MapPin aria-hidden="true" className="size-3.5" />{live.city}</>}
            </p>
          </div>
        </div>
        <div className="mt-auto grid grid-cols-2 gap-2">
          <a href={`/api/go?t=live&id=${live.id}`} target="_blank" rel="noopener noreferrer" className="grad-btn flex min-h-12 items-center justify-center gap-2 rounded-full font-bold">
            <Play aria-hidden="true" className="size-5" /> {t("watch")}
          </a>
          <a href={`/api/go?t=wa&id=${live.sellerId}&m=${encodeURIComponent(waMessage)}`} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-wa font-bold text-white">
            <MessageCircle aria-hidden="true" className="size-5" /> {t("whatsapp")}
          </a>
        </div>
        {live.slug && <Link href={`/v/${live.slug}`} className="text-center font-bold text-copper-800 underline">{t("showcase")}</Link>}
      </div>
    </li>
  );
}
