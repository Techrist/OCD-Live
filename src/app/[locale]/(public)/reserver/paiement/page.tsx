import { getTranslations, setRequestLocale } from "next-intl/server";
import { PaymentStep } from "@/components/booking/payment-step";
import { StepHeader } from "@/components/booking/step-header";
import { getCountries, getStudioTimezone } from "@/server/services/catalog";

export const dynamic = "force-dynamic";

export default async function PaymentPage({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  const [t, studioTz, countries] = await Promise.all([getTranslations("booking.payment"), getStudioTimezone(), getCountries()]);
  return (
    <>
      <StepHeader step="paiement" title={t("pageTitle")} audio={t("audio")} eyebrow={t("eyebrow")} />
      <PaymentStep studioTz={studioTz} countries={countries} />
    </>
  );
}
