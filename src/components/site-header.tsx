import { CalendarPlus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";
import { HeaderFrame } from "@/components/header-frame";
import { LocaleSwitch } from "@/components/locale-switch";
import { TopNav } from "@/components/top-nav";

export async function SiteHeader() {
  const t = await getTranslations();
  return (
    <HeaderFrame>
      <div className="mx-auto flex w-full max-w-[76rem] items-center justify-between gap-4 px-5 pt-4 pb-2 md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <Link href="/" aria-label={t("brand.name")} className="block w-28 shrink-0 sm:w-36">
          {/* Logo blanc sur le héros, logo couleur ailleurs. */}
          <Logo tone="white" className="hidden group-data-[hero=true]:block" />
          <Logo className="group-data-[hero=true]:hidden" />
        </Link>
        <TopNav />
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/reserver"
            className="hidden min-h-12 items-center gap-2 rounded-xl bg-copper-600 px-5 font-bold text-white group-data-[hero=true]:bg-white group-data-[hero=true]:text-copper-800 lg:flex"
          >
            <CalendarPlus aria-hidden="true" className="size-5" /> {t("nav.cta")}
          </Link>
          <LocaleSwitch label={t("nav.language")} />
        </div>
      </div>
    </HeaderFrame>
  );
}
