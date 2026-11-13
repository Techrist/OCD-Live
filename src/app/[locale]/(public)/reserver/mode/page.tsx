import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ModeChoice } from "@/components/booking/mode-choice";
import { StepHeader } from "@/components/booking/step-header";

export default async function ModePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("booking");
  return (
    <>
      <StepHeader step="mode" title={t("modeTitle")} audio={t("modeAudio")} eyebrow={t("eyebrow")} />
      <Suspense>
        <ModeChoice />
      </Suspense>
    </>
  );
}
