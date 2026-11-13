import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalPage } from "@/components/legal-page";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const t = await getTranslations({ locale: (await params).locale, namespace: "legal.privacy" });
  return { title: t("title") };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  return <LegalPage ns="privacy" sections={[{ h: "h1", p: "p1" }, { h: "h2", p: "p2" }, { h: "h3", p: "p3" }]} />;
}
