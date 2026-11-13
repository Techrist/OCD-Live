import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ProductManager } from "@/components/espace/product-manager";
import { requireRole } from "@/server/auth/session";
import { db } from "@/server/db";
import { MAX_PRODUCTS, productsOfSeller } from "@/server/services/shop";

export const dynamic = "force-dynamic";

/** SHP-01 : le vendeur gère son catalogue (nom, prix, photo, stock, catégorie). */
export default async function MyProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireRole(locale, ["SELLER"]);
  const t = await getTranslations("espace.products");
  const profile = await db.sellerProfile.findUnique({ where: { userId: session.sub } });
  if (!profile) return <p className="px-5 font-bold">{t("noProfile")}</p>;
  const [products, categories] = await Promise.all([
    productsOfSeller(session.sub),
    db.category.findMany({ where: { active: true }, orderBy: { order: "asc" }, select: { id: true, name: true } }),
  ]);
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-5 pt-2">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <p className="font-semibold text-ink/70">{t("intro")}</p>
      <Link href="/shop" className="font-bold text-copper-800 underline">{t("viewShop")} →</Link>
      <ProductManager
        items={products.map((p) => ({ id: p.id, name: p.name, price: p.price, stock: p.stock, active: p.active, photoUrl: p.photoUrl, category: p.category.name }))}
        categories={categories}
        defaultCategoryId={profile.categoryId}
        limit={MAX_PRODUCTS}
      />
    </div>
  );
}
