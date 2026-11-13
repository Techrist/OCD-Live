import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { ShopFilters } from "@/lib/shop";

type Props = {
  filters: ShopFilters;
  countries: { code: string; name: string }[];
  categories: { slug: string; name: string }[];
  cities?: string[];
  active: boolean;
  /** Page cible du formulaire (par défaut /shop) et ancre à retrouver après l'envoi. */
  action?: string;
  hidden?: Record<string, string>;
  compact?: boolean;
  /** Valeur envoyée pour « Tous » dans la catégorie (la fiche produit s'en sert pour sortir de la catégorie par défaut). */
  allValue?: string;
  /** Colonne verticale (panneau latéral du catalogue). */
  vertical?: boolean;
};

/** Filtres communs au catalogue et aux produits similaires : pays, ville, catégorie, prix (SHP-04). Formulaire GET, sans JavaScript. */
export function ShopFilterForm({ filters, countries, categories, cities, active, action = "/shop", hidden, compact = false, allValue = "", vertical = false }: Props) {
  const t = useTranslations("shop.filters");
  const field = "soft min-h-12 w-full rounded-2xl px-3 font-semibold";
  return (
    <form method="get" action={action} role="search" aria-label={t("label")} className={vertical ? "flex flex-col gap-4" : `grid gap-3 sm:grid-cols-2 ${compact ? "lg:grid-cols-4" : "lg:grid-cols-6"}`}>
      {Object.entries(hidden ?? {}).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      {!compact && <label className={cn("flex flex-col gap-1 text-sm font-bold", !vertical && "lg:col-span-2")}>{t("search")}<input name="q" type="search" defaultValue={filters.q} className={field} /></label>}
      <label className="flex flex-col gap-1 text-sm font-bold">{t("country")}
        <select name="pays" defaultValue={filters.country ?? ""} className={field}>
          <option value="">{t("all")}</option>
          {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
      </label>
      {cities && (
        <label className="flex flex-col gap-1 text-sm font-bold">{t("city")}
          <input name="ville" list="shop-cities" defaultValue={filters.city} className={field} />
          <datalist id="shop-cities">{cities.map((c) => <option key={c} value={c} />)}</datalist>
        </label>
      )}
      <label className="flex flex-col gap-1 text-sm font-bold">{t("category")}
        <select name="categorie" defaultValue={filters.category ?? allValue} className={field}>
          <option value={allValue}>{t("all")}</option>
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1 text-sm font-bold">{t("min")}<input name="min" type="number" inputMode="numeric" min={0} defaultValue={filters.min} className={field} /></label>
        <label className="flex flex-col gap-1 text-sm font-bold">{t("max")}<input name="max" type="number" inputMode="numeric" min={0} defaultValue={filters.max} className={field} /></label>
      </div>
      <div className={vertical ? "flex flex-wrap items-center gap-3" : `flex items-end gap-3 sm:col-span-2 ${compact ? "lg:col-span-4" : "lg:col-span-6"}`}>
        <button type="submit" className="grad-btn min-h-12 rounded-2xl px-8 text-lg font-bold">{t("apply")}</button>
        {active && <Link href={action} className="min-h-12 content-center font-bold text-copper-800 underline">{t("reset")}</Link>}
      </div>
    </form>
  );
}
