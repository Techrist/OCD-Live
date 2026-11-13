import { getTranslations, setRequestLocale } from "next-intl/server";
import { GoogleComplete } from "@/components/google-complete";

export const dynamic = "force-dynamic";

const DEFAULT_DIAL = process.env.NEXT_PUBLIC_DEFAULT_DIAL ?? "+228";

export default async function GoogleReturnPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("login");
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pt-4">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <GoogleComplete defaultDial={DEFAULT_DIAL} />
    </div>
  );
}
