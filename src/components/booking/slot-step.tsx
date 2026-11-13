"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Ban, CalendarCheck, ChevronLeft, ChevronRight, Clock, Globe, LockKeyhole, Repeat } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { ucfirst } from "@/lib/format";
import { hourLabel, slotTimes } from "@/lib/time";
import { cn } from "@/lib/utils";
import { useStepGuard } from "./use-booking-draft";

type Country = { code: string; name: string; timezone: string };
type SlotView = { id: string; startsAt: string; endsAt: string; remaining: number };
type DayView = { date: string; free: number; slots: SlotView[] };

const shift = (month: string, by: number) => {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + by, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
};

/** Écran 4 (RES-03, RES-04, RES-10) : calendrier du mois à gauche, créneaux du jour et récapitulatif à droite. */
export function SlotStep({ firstMonth, studioTz, countries }: { firstMonth: string; studioTz: string; countries: Country[] }) {
  const t = useTranslations("booking.slot");
  const locale = useLocale();
  const router = useRouter();
  const { draft, update, allowed } = useStepGuard("creneau");
  const [month, setMonth] = useState(firstMonth);
  const [loaded, setLoaded] = useState<{ key: string; days: DayView[] } | null>(null);
  const [selected, setSelected] = useState<string>();
  const [slotId, setSlotId] = useState<string>();
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [busy, setBusy] = useState(false);

  const mode = draft.mode;
  const key = `${month}|${mode}`;
  useEffect(() => {
    if (!allowed || !mode) return;
    let cancelled = false;
    fetch(`/api/slots?month=${month}&mode=${mode}`)
      .then((r) => r.json())
      .then((data) => !cancelled && setLoaded({ key, days: data.days }))
      .catch(() => !cancelled && setError(t("errorNetwork")));
    return () => {
      cancelled = true;
    };
  }, [allowed, month, mode, key, t]);

  const days = useMemo(() => new Map((loaded?.key === key ? loaded.days : []).map((d) => [d.date, d])), [loaded, key]);
  if (!allowed || !mode) return null;

  const country = countries.find((c) => c.code === draft.countryCode);
  const sellerTz = country?.timezone;
  const [y, m] = month.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const offset = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7; // semaine commençant le lundi
  const fmt = (o: Intl.DateTimeFormatOptions, d: Date) => new Intl.DateTimeFormat(locale, { ...o, timeZone: "UTC" }).format(d);
  const monthLabel = ucfirst(fmt({ month: "long", year: "numeric" }, new Date(Date.UTC(y, m - 1, 1))));
  const weekdays = Array.from({ length: 7 }, (_, i) => fmt({ weekday: "short" }, new Date(Date.UTC(2026, 0, 5 + i))));
  const day = selected ? days.get(selected) : undefined;
  const slot = day?.slots.find((s) => s.id === slotId);
  const loading = loaded?.key !== key;
  const dayLabel = selected ? ucfirst(fmt({ weekday: "long", day: "numeric", month: "long", year: "numeric" }, new Date(`${selected}T12:00:00Z`))) : "";
  const range = (s: SlotView, tz: string) => `${hourLabel(new Date(s.startsAt), tz)} – ${hourLabel(new Date(s.endsAt), tz)}`;
  const sellerRange = slot && sellerTz && range(slot, sellerTz) !== range(slot, studioTz) ? range(slot, sellerTz) : null;

  // Créneau complet : le vendeur s'inscrit et sera prévenu sur WhatsApp en cas de désistement (RES-09).
  async function joinWaitlist(id: string) {
    setError(undefined);
    const res = await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slotId: id }) }).catch(() => null);
    if (res?.status === 403) return router.push("/reserver/vendeur");
    if (res?.ok) return setNotice(t("waitlistDone"));
    setError(t("errorNetwork"));
  }

  async function goToPayment() {
    if (!slot) return;
    setBusy(true);
    setError(undefined);
    const res = await fetch("/api/bookings", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId: slot.id, packageSlug: draft.packageSlug, mode }),
    }).catch(() => null);
    setBusy(false);
    if (!res) return setError(t("errorNetwork"));
    const data = await res.json();
    if (res.ok) {
      update({ slotId: slot.id, bookingId: data.id });
      return router.push("/reserver/paiement");
    }
    if (res.status === 403) return router.push("/reserver/vendeur");
    if (data.reason === "SLOT_FULL") {
      setError(t("errorFull"));
      setSlotId(undefined);
      setLoaded(null);
    } else setError(t("errorNetwork"));
  }

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[1.25fr_1fr]">
      <section className="soft flex flex-col gap-4 rounded-[2rem] p-5 md:p-6" aria-labelledby="cal">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 id="cal" className="text-2xl font-bold">{monthLabel}</h2>
            <p className="text-sm font-semibold text-ink/70">{t("realtime")}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" aria-label={t("prevMonth")} disabled={month <= firstMonth} onClick={() => { setMonth(shift(month, -1)); setSelected(undefined); setSlotId(undefined); }} className="soft grid size-12 place-items-center rounded-2xl disabled:opacity-30"><ChevronLeft aria-hidden="true" /></button>
            <button type="button" aria-label={t("nextMonth")} disabled={month >= shift(firstMonth, 5)} onClick={() => { setMonth(shift(month, 1)); setSelected(undefined); setSlotId(undefined); }} className="soft grid size-12 place-items-center rounded-2xl disabled:opacity-30"><ChevronRight aria-hidden="true" /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2" aria-busy={loading}>
          {weekdays.map((w, i) => <span key={i} className="py-1 text-center text-xs font-bold text-ink/60 uppercase sm:text-sm">{w}</span>)}
          {Array.from({ length: offset }, (_, i) => <span key={`b${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const date = `${month}-${String(i + 1).padStart(2, "0")}`;
            const d = days.get(date);
            const open = !!d && d.free > 0;
            return (
              <button
                key={date}
                type="button"
                disabled={!open}
                aria-pressed={selected === date}
                onClick={() => { setSelected(date); setSlotId(undefined); setNotice(undefined); }}
                aria-label={`${i + 1} — ${!d ? t("closed") : open ? t("free", { count: d.free }) : t("full")}`}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center rounded-2xl text-lg font-bold sm:min-h-16",
                  open ? "soft" : "bg-ink/5 text-ink/40",
                )}
              >
                {i + 1}
                <span aria-hidden="true" className={cn("mt-0.5 rounded-full px-1.5 text-[10px] leading-4 font-bold sm:text-xs", open ? "bg-wa/15 text-wa" : "text-ink/50")}>
                  {!d ? t("closedShort") : open ? t("freeShort", { count: d.free }) : t("fullShort")}
                </span>
              </button>
            );
          })}
        </div>
        <p className="flex flex-wrap gap-x-5 gap-y-1 rounded-2xl bg-wall-2 px-4 py-3 text-sm font-semibold">
          <span className="inline-flex items-center gap-1.5"><span className="size-3 rounded-full bg-wa" /> {t("legendFree")}</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-3 rounded-full bg-copper" /> {t("legendSelected")}</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-3 rounded-full bg-ink/30" /> {t("legendClosed")}</span>
        </p>
        {loading && <p className="text-sm font-semibold">{t("loading")}</p>}
      </section>

      <aside className="soft flex flex-col gap-4 rounded-[2rem] p-5 md:p-6" aria-labelledby="slots">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold tracking-wide text-copper-800 uppercase">{t("slotsTitle")}</p>
            <h2 id="slots" className="text-xl leading-tight font-bold">{selected ? dayLabel : t("pickDay")}</h2>
          </div>
          {day && <span className="pill !bg-wall-2 !shadow-none">{t("slotCount", { count: day.slots.length })}</span>}
        </div>

        {selected && !day && <p className="font-semibold">{t("noSlots")}</p>}
        {day && (
          <ul className="flex flex-col gap-2">
            {day.slots.map((s) => {
              const full = s.remaining === 0;
              const on = slotId === s.id;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    data-slot
                    disabled={full}
                    aria-pressed={on}
                    onClick={() => setSlotId(s.id)}
                    className={cn("soft flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl px-4 text-left font-bold", full && "line-through")}
                  >
                    <span className="inline-flex items-center gap-2 text-lg tabular-nums">
                      {full ? <Ban aria-hidden="true" className="size-5" /> : <Clock aria-hidden="true" className="size-5" />} {range(s, studioTz)}
                    </span>
                    <span className={cn("rounded-full px-3 py-0.5 text-sm no-underline", full ? "bg-red-100 text-red-800" : on ? "bg-white text-copper-800" : "bg-wa/15 text-wa")}>
                      {full ? t("full") : t("places", { count: s.remaining })}
                    </span>
                  </button>
                  {full && (
                    <button type="button" onClick={() => joinWaitlist(s.id)} className="mt-1 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl font-bold text-copper-800 underline">
                      <Repeat aria-hidden="true" className="size-4" /> {t("waitlist")}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {slot && (
          <>
            <div className="flex flex-col gap-1 rounded-2xl bg-wall-2 p-4 text-sm font-semibold">
              <p className="flex items-center gap-2 font-bold text-copper-800"><Globe aria-hidden="true" className="size-4" /> {t("zones")}</p>
              <p className="flex justify-between gap-2"><span>{t("zoneLome")}</span><span className="font-bold tabular-nums">{range(slot, studioTz)}</span></p>
              {sellerRange && <p className="flex justify-between gap-2"><span>{t("zoneYou", { country: country?.name ?? "" })}</span><span className="font-bold tabular-nums">{sellerRange}</span></p>}
              {mode === "REMOTE" && <p className="mt-1 text-ink/70">{t("zoneNote")}</p>}
            </div>
            <div className="flex items-start gap-3 rounded-2xl bg-wall-2 p-4">
              <CalendarCheck aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-copper-800" />
              <p className="font-semibold">
                <span className="block text-sm text-ink/70">{t("chosen")}</span>
                <span>{dayLabel}</span> · {slotTimes(new Date(slot.startsAt), studioTz, sellerTz).studio}
              </p>
            </div>
          </>
        )}

        {notice && <p role="status" className="font-bold text-wa">{notice}</p>}
        {error && <p role="alert" className="font-bold text-red-700">{error}</p>}
        <button type="button" disabled={!slot || busy} onClick={goToPayment} className="grad-btn flex min-h-16 w-full items-center justify-center gap-3 rounded-3xl text-xl font-bold disabled:opacity-50">
          {t("toPayment")} <ArrowRight aria-hidden="true" className="size-6" />
        </button>
        <ul className="flex flex-col gap-1 text-sm font-semibold text-ink/80">
          <li className="flex items-center gap-2"><LockKeyhole aria-hidden="true" className="size-4 shrink-0 text-wa" /> {t("noteHold")}</li>
          <li className="flex items-center gap-2"><Repeat aria-hidden="true" className="size-4 shrink-0 text-wa" /> {t("noteChange")}</li>
        </ul>
      </aside>
    </div>
  );
}
