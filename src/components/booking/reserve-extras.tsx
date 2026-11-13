import Image from "next/image";
import { FileText, Headset, MessageCircle, Tv } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { whatsappLink } from "@/lib/whatsapp";
import { getSetting } from "@/server/services/catalog";

/** Contenu rassurant sous le parcours de réservation : ce qui est inclus, questions fréquentes, aide WhatsApp. */
export async function ReserveExtras() {
  const [t, hours, tw] = await Promise.all([getTranslations("booking.extras"), getSetting<number>("booking.cancelFreeHoursBefore"), getTranslations("whatsapp")]);
  const items = [
    { key: "i1", icon: Tv },
    { key: "i2", icon: Headset },
    { key: "i3", icon: MessageCircle },
    { key: "i4", icon: FileText },
  ] as const;
  return (
    <>
      <section aria-labelledby="included" className="band mt-10 flex flex-col gap-8 bg-white py-12 md:py-16">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-2 text-center">
          <h2 id="included" className="text-3xl">{t("title")}</h2>
          <p className="text-lg text-ink/70">{t("subtitle")}</p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ key, icon: Icon }) => (
            <li key={key} className="flex flex-col gap-3 rounded-3xl border border-ink/10 p-5">
              <span aria-hidden="true" className="grid size-12 place-items-center rounded-full grad-btn"><Icon className="size-6" /></span>
              <h3 className="text-lg font-bold">{t(`${key}.title`)}</h3>
              <p className="font-semibold text-ink/70">{t(`${key}.text`)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="faq-booking" className="band grid items-center gap-8 bg-[#fffaf2] py-12 md:grid-cols-2 md:py-16">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
          <Image src="/images/studio.webp" alt={t("studioAlt")} fill sizes="(min-width: 768px) 36rem, 100vw" className="object-cover" />
        </div>
        <div className="flex flex-col gap-4">
          <h2 id="faq-booking" className="text-3xl">{t("faqTitle")}</h2>
          {(["q1", "q2", "q3"] as const).map((q) => (
            <details key={q} className="group rounded-2xl border border-ink/10 bg-white p-4">
              <summary className="cursor-pointer text-lg font-bold">{t(`${q}.q`)}</summary>
              <p className="mt-2 font-semibold text-ink/70">{t(`${q}.a`, { hours })}</p>
            </details>
          ))}
        </div>
      </section>

      <section aria-label={t("helpTitle")} className="band flex flex-col items-center gap-4 bg-[image:var(--hero)] py-12 text-center text-white">
        <h2 className="text-3xl">{t("helpTitle")}</h2>
        <p className="max-w-xl text-lg font-semibold">{t("helpText")}</p>
        <a href={whatsappLink(tw("message"))} target="_blank" rel="noopener noreferrer" className="flex min-h-14 items-center gap-2 rounded-2xl bg-white px-8 text-lg font-bold text-copper-800">
          <MessageCircle aria-hidden="true" className="size-5" /> {t("helpCta")}
        </a>
      </section>
    </>
  );
}
