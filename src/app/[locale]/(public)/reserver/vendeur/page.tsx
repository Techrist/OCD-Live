import { getTranslations, setRequestLocale } from "next-intl/server";
import { SellerStep } from "@/components/booking/seller-step";
import { StepHeader } from "@/components/booking/step-header";
import { getCategories, getCountries } from "@/server/services/catalog";

export const dynamic = "force-dynamic";

export default async function SellerPage({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  const [t, categories, countries] = await Promise.all([getTranslations("booking.seller"), getCategories(), getCountries()]);
  return (
    <>
      <StepHeader step="vendeur" title={t("title")} audio={t("audio")} eyebrow={t("eyebrow")} />
      <SellerStep categories={categories} countries={countries} />
    </>
  );
}
