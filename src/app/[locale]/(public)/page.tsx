import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/home/hero";
import { CountriesBand, Faq, FinalCta, Offers, Popular, ShopTeaser, Steps, StudioLive, Why } from "@/components/home/sections";

export const dynamic = "force-dynamic";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <Hero locale={locale} />
      <Popular />
      <Steps />
      <Why />
      <CountriesBand />
      <Offers />
      <ShopTeaser />
      <StudioLive />
      <Faq />
      <FinalCta />
    </>
  );
}
