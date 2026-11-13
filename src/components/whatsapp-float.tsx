import { MessageCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { whatsappLink } from "@/lib/whatsapp";

/** Bouton « Parler à un conseiller » flottant, posé au-dessus de la navigation. */
export async function WhatsAppFloat() {
  const t = await getTranslations("whatsapp");
  return (
    <a
      href={whatsappLink(t("message"))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("float")}
      className="fixed right-4 bottom-24 z-40 md:right-6 md:bottom-6 flex size-14 items-center justify-center gap-2 rounded-full bg-wa font-bold text-white shadow-[0_14px_28px_-10px_rgba(14,122,62,0.8)] hover:brightness-110 sm:w-auto sm:px-5"
    >
      <MessageCircle className="size-6" aria-hidden="true" />
      <span className="max-sm:sr-only">{t("float")}</span>
    </a>
  );
}
