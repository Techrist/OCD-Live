import { getTranslations, setRequestLocale } from "next-intl/server";
import { SlotStep } from "@/components/booking/slot-step";
import { StepHeader } from "@/components/booking/step-header";
import { getCountries, getFirstOpenMonth, getStudioTimezone } from "@/server/services/catalog";

export const dynamic = "force-dynamic";

export default async function SlotPage({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  const [t, firstMonth, studioTz, countries] = await Promise.all([getTranslations("booking.slot"), getFirstOpenMonth(), getStudioTimezone(), getCountries()]);
  return (
    <>
      <StepHeader step="creneau" title={t("title")} audio={t("audio")} eyebrow={t("eyebrow")} subtitle={t("subtitle")} />
      <SlotStep firstMonth={firstMonth} studioTz={studioTz} countries={countries} />
    </>
  );
}
