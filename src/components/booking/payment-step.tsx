"use client";

import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, Check, CreditCard, LockKeyhole, MessageCircle, Radio, Receipt, ShieldCheck, Store, Timer } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { formatDuration, formatPrice, ucfirst } from "@/lib/format";
import { paymentMethodsFor, type PaymentMethod } from "@/lib/payment-methods";
import { slotTimes } from "@/lib/time";
import { cn } from "@/lib/utils";
import { useStepGuard } from "./use-booking-draft";

type Summary = {
  id: string; reference: string; status: string; holdExpiresAt: string | null; amount: number; mode: "ONSITE" | "REMOTE";
  package: { name: string; durationMinutes: number; liveCount: number };
  slot: { startsAt: string };
  lastPayment: { status: string; method: string } | null;
};
type Country = { code: string; timezone: string; name?: string };

const mmss = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

/** Écran 5 (RES-05, RES-07, PAY-01, PAY-05) : créneau verrouillé 10 min, commande à gauche, moyens de paiement à droite. */
export function PaymentStep({ studioTz, countries }: { studioTz: string; countries: Country[] }) {
  const t = useTranslations("booking.payment");
  const locale = useLocale();
  const router = useRouter();
  const { draft, update, allowed } = useStepGuard("paiement");
  const [summary, setSummary] = useState<Summary>();
  const [holdUntil, setHoldUntil] = useState<number>();
  const [now, setNow] = useState(() => Date.now());
  const [method, setMethod] = useState<PaymentMethod>();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [lost, setLost] = useState<"SLOT_FULL" | "EXPIRED" | null>(null);

  const bookingId = draft.bookingId;
  useEffect(() => {
    if (!allowed || !bookingId) return;
    let cancelled = false;
    (async () => {
      try {
        const [profile, first] = await Promise.all([
          fetch("/api/seller/profile").then((r) => r.json()),
          fetch(`/api/bookings/${bookingId}`),
        ]);
        if (first.status === 403 || first.status === 404) return router.replace("/reserver/vendeur");
        const s: Summary = await first.json();
        if (cancelled) return;
        if (s.status === "CONFIRMED") return router.replace(`/reserver/confirmation/${s.reference}`);
        const hold = await fetch(`/api/bookings/${bookingId}/hold`, { method: "POST" });
        const h = await hold.json();
        if (cancelled) return;
        if (h.ok) setHoldUntil(new Date(h.holdExpiresAt).getTime());
        else if (h.reason === "ALREADY_CONFIRMED") return router.replace(`/reserver/confirmation/${s.reference}`);
        else setLost("SLOT_FULL");
        setSummary(s);
        if (profile.phone) setPhone(profile.phone);
      } catch {
        if (!cancelled) setError(t("errorNetwork"));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [allowed, bookingId, router, t]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!allowed) return null;
  const remaining = holdUntil ? holdUntil - now : null;
  const expired = lost === "EXPIRED" || (remaining !== null && remaining <= 0);
  const country = countries.find((c) => c.code === draft.countryCode);
  const methods = paymentMethodsFor(draft.countryCode);

  function backToSlots() {
    update({ slotId: undefined, bookingId: undefined });
    router.push("/reserver/creneau");
  }

  async function pay() {
    if (!method || !bookingId) return;
    setBusy(true);
    setError(undefined);
    const res = await fetch(`/api/bookings/${bookingId}/pay`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method, payerPhone: phone, returnUrl: `/${locale}/reserver/paiement` }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setBusy(false);
    if (data?.ok && data.redirectUrl) return void (window.location.href = data.redirectUrl);
    if (data?.reason === "HOLD_EXPIRED") return setLost("EXPIRED");
    setError(data?.reason === "INVALID_INPUT" ? t("errorPhone") : t("errorNetwork"));
  }

  if (lost === "SLOT_FULL" || expired) {
    return (
      <div className="soft mx-auto flex w-full max-w-xl flex-col gap-4 rounded-[2rem] p-6">
        <p role="alert" className="text-xl font-bold">{lost === "SLOT_FULL" ? t("slotTaken") : t("expired")}</p>
        <button type="button" onClick={backToSlots} className="grad-btn min-h-16 w-full rounded-3xl text-xl font-bold">{t("backToSlots")}</button>
      </div>
    );
  }
  if (!summary) return <p className="font-semibold">{t("loading")}</p>;

  const times = slotTimes(new Date(summary.slot.startsAt), studioTz, country?.timezone);
  const dateLabel = ucfirst(new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: studioTz }).format(new Date(summary.slot.startsAt)));
  const failed = summary.lastPayment?.status === "FAILED";
  const price = formatPrice(summary.amount).replace(/ F$/, "");

  const line = (icon: React.ReactNode, label: string, value: React.ReactNode, sub?: React.ReactNode) => (
    <div className="flex items-start gap-3 rounded-2xl bg-wall-2 p-4">
      <span aria-hidden="true" className="mt-0.5 shrink-0 text-copper-800">{icon}</span>
      <div>
        <p className="text-sm font-semibold text-ink/70">{label}</p>
        <p className="text-lg leading-snug font-bold">{value}</p>
        {sub && <p className="text-sm font-semibold text-ink/70">{sub}</p>}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="soft flex flex-wrap items-center justify-between gap-3 rounded-[2rem] p-5" role="timer" aria-live="off">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="grad-btn grid size-12 place-items-center rounded-full"><Timer className="size-6" /></span>
          <div>
            <p className="text-xl font-bold">{t("locked")} <span className="rounded-lg bg-wall-2 px-2 text-copper-800 tabular-nums">{remaining === null ? "10:00" : mmss(remaining)}</span></p>
            <p className="font-semibold text-ink/80">{t("lockedText", { date: dateLabel })}</p>
          </div>
        </div>
        <span className="pill"><Check aria-hidden="true" className="size-4 text-wa" /> {t("guaranteed")}</span>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[1fr_1.4fr]">
        <section className="soft flex flex-col gap-3 rounded-[2rem] p-5" aria-labelledby="order">
          <div className="flex items-center justify-between gap-2">
            <h2 id="order" className="flex items-center gap-2 text-2xl font-bold"><Receipt aria-hidden="true" className="size-6 text-copper-800" /> {t("order")}</h2>
            <span className="pill !bg-wall-2 !shadow-none">{summary.reference}</span>
          </div>
          {line(<Radio className="size-5" />, t("offer"), `${summary.package.name} · ${formatDuration(summary.package.durationMinutes)}`)}
          {line(<CalendarDays className="size-5" />, t("when"), dateLabel, <>{times.studio} {t("lome")}{times.local && ` · ${times.local} ${t("local")}`}</>)}
          {line(<Store className="size-5" />, t("seller"), draft.shopName || "—", draft.name)}
          <div className="rounded-2xl bg-wall-2 p-4">
            <p className="flex justify-between gap-2 font-semibold"><span>{t("fees")}</span><span className="font-bold text-wa">{t("feesFree")}</span></p>
            <p className="mt-2 text-sm font-bold tracking-wide text-ink/70 uppercase">{t("totalNet")}</p>
            <p className="text-4xl font-bold text-copper-800 tabular-nums">{price} <span className="text-xl">FCFA</span></p>
          </div>
          <p className="flex items-start gap-2 rounded-2xl bg-wa/10 p-3 text-sm font-bold text-wa"><Check aria-hidden="true" className="mt-0.5 size-4 shrink-0" /> {t("freeChange")}</p>
        </section>

        <section className="soft flex flex-col gap-5 rounded-[2rem] p-5 md:p-6" aria-labelledby="how">
          <div>
            <h2 id="how" className="text-3xl leading-tight font-bold">{t("title")}</h2>
            <p className="mt-1 text-lg text-ink/80">{t("subtitle")}</p>
          </div>
          {failed && <p role="alert" className="rounded-2xl bg-red-100 p-3 font-bold text-red-800">{t("failed")}</p>}
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-2 text-lg font-bold">{t("chooseMethod")}</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {methods.map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={method === m}
                  onClick={() => setMethod(m)}
                  className={cn("soft flex min-h-20 items-center gap-3 rounded-2xl px-4 text-left", m === "CARD" && "sm:col-span-2")}
                >
                  <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-xl bg-wall-2 text-copper-800">{m === "CARD" ? <CreditCard className="size-6" /> : <span className="text-lg font-bold">{t(`methods.${m}`).slice(0, 2).toUpperCase()}</span>}</span>
                  <span className="flex-1 text-xl font-bold">{t(`methods.${m}`)}</span>
                  <span aria-hidden="true" className={cn("grid size-7 place-items-center rounded-full", method === m ? "bg-white text-copper-800" : "bg-wall-2")}>{method === m && <Check className="size-5" />}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <label className="flex flex-col gap-1 text-lg font-bold">
            {method ? t("phoneFor", { method: t(`methods.${method}`) }) : t("phoneLabel")}
            <input type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="soft min-h-14 rounded-2xl px-4 text-xl font-bold tabular-nums" />
          </label>
          <p className="flex items-center gap-2 text-sm font-semibold text-ink/70"><MessageCircle aria-hidden="true" className="size-4 shrink-0" /> {t("phoneNote")}</p>
          {error && <p role="alert" className="font-bold text-red-700">{error}</p>}
          <button type="button" disabled={!method || busy} onClick={pay} className="grad-btn flex min-h-16 w-full items-center justify-center gap-3 rounded-3xl text-xl font-bold disabled:opacity-50">
            <LockKeyhole aria-hidden="true" className="size-6" />
            {failed ? t("retry") : t("pay", { amount: formatPrice(summary.amount) })}
            <ArrowRight aria-hidden="true" className="size-6" />
          </button>
          <p className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm font-bold text-wa">
            <span className="inline-flex items-center gap-1"><ShieldCheck aria-hidden="true" className="size-4" /> {t("trust1")}</span>
            <span className="inline-flex items-center gap-1"><LockKeyhole aria-hidden="true" className="size-4" /> {t("trust2")}</span>
          </p>
        </section>
      </div>
    </div>
  );
}
