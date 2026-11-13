import { getTranslations, setRequestLocale } from "next-intl/server";
import { LoginForm } from "@/components/login-form";
import { googleEnabled } from "@/lib/auth/neon-server";

// Indicatif prérempli (le pays détecté automatiquement sera branché à l'étape 5).
const DEFAULT_DIAL = process.env.NEXT_PUBLIC_DEFAULT_DIAL ?? "+228";

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("login");
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pt-4">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <LoginForm defaultDial={DEFAULT_DIAL} google={googleEnabled()} />
    </div>
  );
}
