import { MessageCircle, PlayCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";
import { whatsappLink } from "@/lib/whatsapp";

export async function SiteFooter() {
  const [t, tw] = await Promise.all([getTranslations("footer"), getTranslations("whatsapp")]);
  return (
    <footer className="bg-ink px-6 pt-8 pb-32 text-white md:pb-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <Logo tone="white" className="w-28" />
          <p className="font-bold">{t("initiative")}</p>
          <a href="https://www.tiktok.com/@houseofchallenge" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold opacity-90 hover:underline">
            <PlayCircle aria-hidden="true" className="size-4" /> {t("tiktok")}
          </a>
        </div>
        <nav aria-label={t("nav")} className="flex flex-wrap gap-x-6 gap-y-1 font-semibold">
          <Link href="/a-propos" className="py-2 underline-offset-4 hover:underline">{t("about")}</Link>
          <Link href="/conditions" className="py-2 underline-offset-4 hover:underline">{t("terms")}</Link>
          <Link href="/confidentialite" className="py-2 underline-offset-4 hover:underline">{t("privacy")}</Link>
          <a href={whatsappLink(tw("message"))} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 py-2 underline-offset-4 hover:underline">
            <MessageCircle aria-hidden="true" className="size-4" /> {t("contact")}
          </a>
        </nav>
      </div>
    </footer>
  );
}
