import Image from "next/image";
import { BadgeCheck, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { Flag } from "@/components/ui/flag";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/format";
import type { ShopProduct } from "@/server/services/shop";
import { OrderButton } from "./order-button";

export const productImage = (p: Pick<ShopProduct, "photoUrl" | "category">) => p.photoUrl ?? `/images/cat-${p.category.slug}.webp`;

/** Carte produit du shop : photo (ou visuel de la catégorie) et nom menant à la fiche, prix, stock, vendeur et commande. */
export function ProductCard({ product: p, showSeller = true }: { product: ShopProduct; showSeller?: boolean }) {
  const t = useTranslations("shop");
  return (
    <li data-testid="product-card" className="group flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white text-ink shadow-sm transition hover:shadow-lg">
      <Link href={`/shop/${p.id}`} aria-label={p.name} className="relative block aspect-square overflow-hidden bg-amber-soft">
        <Image src={productImage(p)} alt={p.photoUrl ? p.name : ""} fill sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw" className="object-cover transition duration-300 group-hover:scale-105" unoptimized={!!p.photoUrl} />
        <span className="absolute top-2 left-2 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-copper-800">{p.category.name}</span>
        {p.stock !== null && p.stock > 0 && p.stock <= 5 && <span className="grad-btn absolute right-2 bottom-2 rounded-full px-2.5 py-1 text-xs font-bold">{t("lowStock", { count: p.stock })}</span>}
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
        <h3 className="text-base leading-tight font-bold sm:text-lg"><Link href={`/shop/${p.id}`} className="hover:text-copper-800">{p.name}</Link></h3>
        {showSeller && (
          <p className="flex flex-wrap items-center gap-x-1.5 text-xs font-semibold text-ink/70">
            {p.seller.countryCode && <Flag code={p.seller.countryCode} className="h-3.5 w-5 rounded-sm ring-1 ring-ink/30" />}
            {p.seller.slug ? <Link href={`/v/${p.seller.slug}`} className="font-bold text-copper-800 underline">{p.seller.shop}</Link> : p.seller.shop}
            {p.seller.verified && <BadgeCheck aria-label={t("verified")} className="size-3.5 text-copper-800" />}
            {p.seller.city && <span className="flex items-center gap-0.5"><MapPin aria-hidden="true" className="size-3" />{p.seller.city}</span>}
          </p>
        )}
        <p className="text-xl font-bold text-copper-800 tabular-nums sm:text-2xl">{formatPrice(p.price)}</p>
        <div className="mt-auto pt-2"><OrderButton sellerId={p.seller.id} name={p.name} price={p.price} stock={p.stock} compact /></div>
      </div>
    </li>
  );
}
