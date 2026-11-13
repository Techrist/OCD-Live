import { getTranslations, setRequestLocale } from "next-intl/server";
import { SubmitLiveForm } from "@/components/espace/submit-live-form";
import { BigActionButton } from "@/components/ui/big-action-button";
import { Link } from "@/i18n/navigation";
import { formatDateTime } from "@/lib/format";
import { currentWindow } from "@/lib/windows";
import { requireRole } from "@/server/auth/session";
import { db } from "@/server/db";
import { getStudioTimezone } from "@/server/services/catalog";
import { activeSubscriptionEnd } from "@/server/services/subscriptions";
import { BadgeDollarSign } from "lucide-react";

export const dynamic = "force-dynamic";

/** ANN-02 : un seul champ à coller. Réservé aux abonnés actifs, pendant une fenêtre de validation (règle 4). */
export default async function SubmitLivePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireRole(locale, ["SELLER"]);
  const t = await getTranslations("espace.submit");
  const [tz, active, windows] = await Promise.all([getStudioTimezone(), activeSubscriptionEnd(session.sub), db.validationWindow.findMany({ where: { active: true }, orderBy: { startTime: "asc" } })]);
  const open = currentWindow(windows, new Date(), tz);
  const recent = await db.liveSubmission.findMany({ where: { sellerId: session.sub }, orderBy: { createdAt: "desc" }, take: 5 });

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-5 pt-2">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <p className="pill w-fit">{t("windows", { list: windows.map((w) => `${w.startTime}–${w.endTime}`).join(" · ") })}</p>
      {!active ? (
        <>
          <p role="alert" className="font-bold">{t("errors.NO_SUBSCRIPTION")}</p>
          <BigActionButton href="/espace/abonnement" icon={<BadgeDollarSign />} label={t("subscribe")} />
        </>
      ) : (
        <>
          <p className="font-semibold">{open ? t("open") : t("closed")}</p>
          <SubmitLiveForm studioTz={tz} />
        </>
      )}
      {recent.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold">{t("recent")}</h2>
          <ul className="flex flex-col gap-2">
            {recent.map((r) => (
              <li key={r.id} className="soft flex flex-col gap-1 rounded-3xl px-4 py-3 text-sm font-semibold">
                <span className="flex justify-between gap-2"><span className="font-bold">{r.platform}</span><span>{t(`status.${r.status}`)}</span></span>
                <span className="break-all text-ink/70">{r.url}</span>
                {r.rejectReason && <span className="text-red-700">{r.rejectReason}</span>}
                <span className="text-ink/60">{formatDateTime(r.createdAt, tz)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <Link href="/espace" className="text-center font-bold underline">←</Link>
    </div>
  );
}
