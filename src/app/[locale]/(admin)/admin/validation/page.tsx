import { getTranslations, setRequestLocale } from "next-intl/server";
import { ValidationQueue } from "@/components/admin/validation-queue";
import { requireRole } from "@/server/auth/session";
import { validationQueue } from "@/server/services/directory";

export const dynamic = "force-dynamic";

/** ADM-05 : file des lives soumis, triée par heure de soumission (ADMIN, VALIDATOR). */
export default async function ValidationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole(locale, ["ADMIN", "VALIDATOR"]);
  const t = await getTranslations("admin.validation");
  const queue = await validationQueue();
  return (
    <>
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <ValidationQueue
        items={queue.map((q) => ({
          id: q.id, url: q.url, platform: q.platform, shop: q.seller.sellerProfile?.shopName ?? q.seller.name ?? q.seller.phone,
          country: q.country.name, category: q.category.name, submittedAt: q.createdAt.toISOString(), flags: q.flags,
        }))}
      />
    </>
  );
}
