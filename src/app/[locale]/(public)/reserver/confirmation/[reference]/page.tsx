import { CalendarPlus, Check, CheckCircle2, Download, Headset, ListChecks, MessageCircle, Share2 } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import QRCode from "qrcode";
import { ClearDraft } from "@/components/booking/clear-draft";
import { Stepper } from "@/components/booking/step-header";
import { Link } from "@/i18n/navigation";
import { formatPrice, ucfirst } from "@/lib/format";
import { slotTimes } from "@/lib/time";
import { whatsappLink } from "@/lib/whatsapp";
import { db } from "@/server/db";
import { requireRole } from "@/server/auth/session";
import { checkInUrl } from "@/server/receipts/load-receipt";
import { getStudioTimezone } from "@/server/services/catalog";

export const dynamic = "force-dynamic";

/** Confirmation : pass officiel (référence, créneau, QR, reçu), puis « ce qui va se passer » et checklist de préparation. */
export default async function ConfirmationPage({ params }: { params: Promise<{ locale: string; reference: string }> }) {
  const { locale, reference } = await params;
  setRequestLocale(locale);
  const session = await requireRole(locale, ["SELLER"]);
  const t = await getTranslations("booking.confirmation");
  const booking = await db.booking.findFirst({
    where: { reference, sellerId: session.sub, status: "CONFIRMED" },
    include: {
      package: true, slot: true,
      seller: { include: { country: true, sellerProfile: true } },
      payments: { include: { receipt: true }, orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!booking) return <p className="font-bold">{t("notFound")}</p>;

  const receipt = booking.payments[0]?.receipt;
  const tz = await getStudioTimezone();
  const times = slotTimes(booking.slot.startsAt, tz, booking.seller.country?.timezone);
  const date = ucfirst(new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: tz }).format(booking.slot.startsAt));
  const qr = await QRCode.toDataURL(checkInUrl(booking.reference), { margin: 1, width: 240 });
  const onsite = booking.mode === "ONSITE";
  const firstName = booking.seller.name?.split(" ")[0];
  const shareText = t("whatsappMessage", { reference: booking.reference });

  const next = [
    { key: "n1" },
    { key: onsite ? "n2Onsite" : "n2Remote" },
    { key: "n3" },
  ] as const;

  return (
    <>
      <ClearDraft />
      <section className="flex flex-col gap-4" aria-labelledby="done">
        <p className="pill w-fit !bg-wa !text-white"><CheckCircle2 aria-hidden="true" className="size-4" /> {t("badge")}</p>
        <h1 id="done" className="max-w-3xl text-[2rem] leading-tight font-bold md:text-5xl">
          {t("congrats", { name: firstName ?? "" })} <span className="text-copper-800">{t("scheduled")}</span>
        </h1>
        <p className="max-w-3xl text-lg text-ink/80">{t("summary", { amount: formatPrice(booking.amount), phone: booking.seller.phone })}</p>
        <Stepper step="paiement" allDone />
      </section>

      <div className="grid items-start gap-5 lg:grid-cols-[1fr_1.3fr]">
        <section className="soft flex flex-col gap-4 overflow-hidden rounded-[2rem]" aria-label={t("passTitle")}>
          <div className="grad-btn flex items-center justify-between gap-3 px-5 py-4">
            <div>
              <p className="text-xs font-bold tracking-wide uppercase">{t("passTitle")}</p>
              <p className="text-2xl font-bold tabular-nums">{booking.reference}</p>
            </div>
            <span className="pill"><Check aria-hidden="true" className="size-4 text-wa" /> {t("confirmed")}</span>
          </div>
          <div className="flex flex-col gap-4 px-5 pb-5">
            <p className="text-lg font-bold">{booking.seller.name} <span className="font-semibold text-ink/70">· {booking.seller.sellerProfile?.shopName}</span></p>
            <div className="rounded-2xl bg-wall-2 p-4">
              <p className="text-xs font-bold tracking-wide text-ink/70 uppercase">{t("slotReserved")}</p>
              <p className="text-xl font-bold text-copper-800">{date}</p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm font-semibold">
                <p className="soft rounded-xl p-2">{t("studioTime")}<span className="block text-lg font-bold tabular-nums">{times.studio}</span></p>
                {times.local && <p className="soft rounded-xl p-2">{t("yourTime")}<span className="block text-lg font-bold tabular-nums">{times.local}</span></p>}
              </div>
            </div>
            <dl className="flex flex-col gap-1 text-sm font-semibold">
              <div className="flex justify-between gap-3"><dt>{t("offer")}</dt><dd className="font-bold">{booking.package.name}</dd></div>
              <div className="flex justify-between gap-3"><dt>{t("modeLabel")}</dt><dd className="font-bold">{onsite ? t("modeOnsite") : t("modeRemote")}</dd></div>
              <div className="flex justify-between gap-3 border-t border-ink/15 pt-2 text-base"><dt className="font-bold">{t("paid")}</dt><dd className="font-bold text-copper-800">{formatPrice(booking.amount)}</dd></div>
            </dl>
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-wall-2 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr} alt={t("qrAlt")} width={160} height={160} className="rounded-xl bg-white p-1" />
              <p className="text-center text-sm font-semibold">{onsite ? t("qrOnsite") : t("qrRemote")}</p>
            </div>
            {receipt && (
              <a href={`/api/receipts/${receipt.number}.pdf`} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-wall-2 font-bold">
                <Download aria-hidden="true" className="size-5" /> {t("download")} {receipt.number}
              </a>
            )}
          </div>
        </section>

        <div className="flex flex-col gap-5">
          <section className="soft flex flex-col gap-3 rounded-[2rem] p-5" aria-labelledby="next">
            <div className="flex items-center justify-between gap-2">
              <h2 id="next" className="flex items-center gap-2 text-xl font-bold"><ListChecks aria-hidden="true" className="size-6 text-copper-800" /> {t("nextTitle")}</h2>
              <span className="pill !bg-wall-2 !shadow-none">{t("nextCount")}</span>
            </div>
            <ol className="flex flex-col gap-3">
              {next.map(({ key }, i) => (
                <li key={key} className="flex items-start gap-3 rounded-2xl bg-wall-2 p-4">
                  <span aria-hidden="true" className="grad-btn grid size-9 shrink-0 place-items-center rounded-full font-bold">{i + 1}</span>
                  <div>
                    <p className="font-bold">{t(`${key}.title`)}</p>
                    <p className="text-ink/80">{t(`${key}.text`)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="soft flex flex-col gap-3 rounded-[2rem] p-5" aria-labelledby="kit">
            <h2 id="kit" className="flex items-center gap-2 text-xl font-bold"><Check aria-hidden="true" className="size-6 text-wa" /> {t("kitTitle")}</h2>
            <p className="text-ink/80">{t("kitIntro")}</p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {(["light", "network", "products", "number"] as const).map((k) => (
                <li key={k} className="flex items-start gap-2 rounded-2xl bg-wall-2 p-3">
                  <Check aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-wa" />
                  <span><span className="block font-bold">{t(`kit.${k}.title`)}</span><span className="text-sm text-ink/80">{t(`kit.${k}.text`)}</span></span>
                </li>
              ))}
            </ul>
          </section>

          <section className="soft flex flex-col gap-3 rounded-[2rem] p-5" aria-label={t("helpTitle")}>
            <p className="flex items-center gap-2 text-lg font-bold"><Headset aria-hidden="true" className="size-6 text-copper-800" /> {t("helpTitle")}</p>
            <p className="text-ink/80">{t("helpText")}</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <a href={whatsappLink(t("helpMessage", { reference: booking.reference }))} target="_blank" rel="noopener noreferrer" className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-wa font-bold text-white">
                <MessageCircle aria-hidden="true" className="size-5" /> {t("helpCta")}
              </a>
              <Link href="/reserver" className="soft flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl font-bold">
                <CalendarPlus aria-hidden="true" className="size-5" /> {t("another")}
              </Link>
            </div>
          </section>
        </div>
      </div>

      <section className="soft flex flex-col items-start gap-3 rounded-[2rem] p-5 md:flex-row md:items-center md:justify-between" aria-label={t("shareTitle")}>
        <div>
          <p className="text-lg font-bold">{t("shareTitle")}</p>
          <p className="text-ink/80">{t("shareText")}</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
          <a href={whatsappLink(shareText)} target="_blank" rel="noopener noreferrer" className="grad-btn flex min-h-14 items-center justify-center gap-2 rounded-2xl px-6 font-bold">
            <Share2 aria-hidden="true" className="size-5" /> {t("whatsapp")}
          </a>
          <Link href="/espace/reservations" className="soft flex min-h-14 items-center justify-center rounded-2xl px-6 font-bold">{t("mySpace")}</Link>
        </div>
      </section>
    </>
  );
}
