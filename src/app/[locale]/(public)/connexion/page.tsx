import Image from "next/image";
import { CalendarCheck, Radio, ShieldCheck, ShoppingBag } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LoginForm } from "@/components/login-form";
import { googleEnabled } from "@/lib/auth/neon-server";

// Indicatif prérempli (le pays détecté automatiquement sera branché à l'étape 5).
const DEFAULT_DIAL = process.env.NEXT_PUBLIC_DEFAULT_DIAL ?? "+228";

/** Connexion : visuel et avantages à gauche (grands écrans), carte de connexion à droite. */
export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("login");
  const perks = [
    { icon: CalendarCheck, key: "p1" },
    { icon: Radio, key: "p2" },
    { icon: ShoppingBag, key: "p3" },
  ] as const;
  return (
    <div className="band grid items-stretch gap-6 pt-6 pb-16 md:pt-10 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
      <aside className="relative hidden min-h-[34rem] flex-col justify-end gap-6 overflow-hidden rounded-[2rem] p-10 text-white lg:flex">
        <Image src="/images/hero-3.webp" alt="" fill priority sizes="40vw" className="object-cover" />
        <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#7a3510] via-[#b4541a]/70 to-[#b4541a]/10" />
        <div className="relative flex flex-col gap-3">
          <h2 className="max-w-md text-4xl leading-tight text-white">{t("panel.title")}</h2>
          <p className="max-w-md text-lg font-semibold text-white/90">{t("panel.text")}</p>
        </div>
        <ul className="relative flex flex-col gap-3">
          {perks.map(({ icon: Icon, key }) => (
            <li key={key} className="flex items-center gap-3 font-bold">
              <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-white/20"><Icon className="size-5" /></span>
              {t(`panel.${key}`)}
            </li>
          ))}
        </ul>
      </aside>

      <section aria-labelledby="login-title" className="mx-auto flex w-full max-w-lg flex-col justify-center gap-6 rounded-[2rem] bg-white p-6 shadow-[0_24px_60px_-28px_rgba(122,53,16,0.45)] ring-1 ring-ink/5 md:p-10">
        <div className="flex flex-col gap-2">
          <h1 id="login-title" className="text-4xl">{t("title")}</h1>
          <p className="text-lg font-semibold text-ink/70">{t("subtitle")}</p>
        </div>
        <LoginForm defaultDial={DEFAULT_DIAL} google={googleEnabled()} />
        <p className="flex items-start gap-2 rounded-2xl bg-amber-soft/50 p-4 text-sm font-semibold text-ink/80">
          <ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-copper-800" /> {t("secure")}
        </p>
      </section>
    </div>
  );
}
