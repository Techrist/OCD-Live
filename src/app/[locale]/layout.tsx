import type { Metadata, Viewport } from "next";
import { Anton, Urbanist } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BottomNav } from "@/components/bottom-nav";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import "../globals.css";

const urbanist = Urbanist({ subsets: ["latin"], variable: "--font-urbanist", display: "swap" });
// Titres condensés : un seul poids (400), chargé uniquement pour les titres.
const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-display", display: "swap" });

export const viewport: Viewport = { themeColor: "#C76524" };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "brand" });
  const title = `${t("name")} — ${t("tagline")}`;
  const base = process.env.APP_URL ?? "http://localhost:3000";
  return {
    metadataBase: new URL(base),
    title: { default: title, template: `%s · ${t("name")}` },
    description: t("tagline"),
    applicationName: t("name"),
    alternates: { canonical: `/${locale}`, languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}`])) },
    openGraph: { type: "website", siteName: t("name"), title, description: t("tagline"), locale: locale === "fr" ? "fr_FR" : "en_US", url: `/${locale}` },
    twitter: { card: "summary_large_image", title, description: t("tagline") },
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return (
    <html lang={locale} className={`${urbanist.variable} ${anton.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <NextIntlClientProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <WhatsAppFloat />
          <BottomNav />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
