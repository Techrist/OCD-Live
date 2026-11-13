import { getTranslations, setRequestLocale } from "next-intl/server";
import { PackageStep } from "@/components/booking/package-step";
import { StepHeader } from "@/components/booking/step-header";
import { whatsappLink } from "@/lib/whatsapp";
import { getPackages } from "@/server/services/catalog";

export const dynamic = "force-dynamic"; // un changement de prix par l'admin s'affiche immédiatement

export default async function PackagePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [packages, t] = await Promise.all([getPackages(), getTranslations("booking.package")]);
  return (
    <>
      <StepHeader step="package" title={t("title")} audio={t("audio")} eyebrow={t("eyebrow")} />
      <PackageStep packages={packages} whatsappHref={whatsappLink(t("quoteMessage"))} />
    </>
  );
}
