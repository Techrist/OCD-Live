"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { cancelMyBookingAction, rescheduleAction, saveProductSheetAction } from "@/server/actions/seller";

export function CancelButton({ bookingId, refundable }: { bookingId: string; refundable: boolean }) {
  const t = useTranslations("espace.actions");
  const router = useRouter();
  const [asking, setAsking] = useState(false);
  const [done, setDone] = useState<string>();
  if (done) return <p className="font-bold">{done}</p>;
  if (!asking) {
    return <button type="button" onClick={() => setAsking(true)} className="min-h-12 rounded-full px-4 font-bold underline">{t("cancel")}</button>;
  }
  return (
    <div className="soft flex flex-col gap-2 rounded-3xl p-4">
      <p className="font-bold">{refundable ? t("cancelRefund") : t("cancelNoRefund")}</p>
      <div className="flex gap-2">
        <button type="button" className="min-h-12 flex-1 rounded-full bg-ink font-bold text-white"
          onClick={async () => {
            const res = await cancelMyBookingAction(bookingId);
            if (res.ok) {
              setDone(res.refunded ? t("cancelledRefunded") : t("cancelled"));
              router.refresh();
            }
          }}>{t("confirmCancel")}</button>
        <button type="button" className="soft min-h-12 flex-1 rounded-full font-bold" onClick={() => setAsking(false)}>{t("keep")}</button>
      </div>
    </div>
  );
}

export function RescheduleForm({ bookingId, slots }: { bookingId: string; slots: { id: string; label: string }[] }) {
  const t = useTranslations("espace.reschedule");
  const router = useRouter();
  const [slotId, setSlotId] = useState(slots[0]?.id ?? "");
  const [msg, setMsg] = useState<{ ok: boolean; text: string }>();
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await rescheduleAction(bookingId, slotId);
    setBusy(false);
    if (res.ok) {
      setMsg({ ok: true, text: t("done") });
      return void setTimeout(() => router.push("/espace/reservations"), 1200);
    }
    setMsg({ ok: false, text: t(`errors.${res.reason}`, { hours: res.hoursLeft ?? 0, free: res.freeHours ?? 48 }) });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-lg font-bold">
        {t("choose")}
        <select value={slotId} onChange={(e) => setSlotId(e.target.value)} className="soft min-h-14 rounded-3xl px-4 text-lg font-bold">
          {slots.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </label>
      {msg && <p role="alert" className={msg.ok ? "font-bold text-wa" : "font-bold text-red-700"}>{msg.text}</p>}
      <button type="submit" disabled={busy || !slotId} className="grad-btn min-h-16 rounded-3xl text-xl font-bold disabled:opacity-60">{t("submit")}</button>
    </form>
  );
}

type Row = { name: string; price: string; quantity: string };

/** Fiche produit avant le live (RES-11) : photos plus tard, prix, quantités, adresse et numéro à afficher à l'écran. */
export function ProductSheetForm({ bookingId, initial }: { bookingId: string; initial: { address: string; phone: string; products: { name: string; price: number; quantity: number }[] } }) {
  const t = useTranslations("espace.sheet");
  const [address, setAddress] = useState(initial.address);
  const [phone, setPhone] = useState(initial.phone);
  const [rows, setRows] = useState<Row[]>(initial.products.length ? initial.products.map((p) => ({ name: p.name, price: String(p.price), quantity: String(p.quantity) })) : [{ name: "", price: "", quantity: "" }]);
  const [saved, setSaved] = useState<boolean>();
  const field = "soft min-h-12 w-full rounded-full px-4 font-bold";

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const products = rows.filter((r) => r.name.trim()).map((r) => ({ name: r.name, price: Number(r.price) || 0, quantity: Number(r.quantity) || 0 }));
    const res = await saveProductSheetAction(bookingId, { address, phone, products });
    setSaved(res.ok);
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 font-bold">{t("address")}<input value={address} onChange={(e) => setAddress(e.target.value)} className={field} /></label>
      <label className="flex flex-col gap-1 font-bold">{t("phone")}<input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={field} /></label>
      <ul className="flex flex-col gap-3">
        {rows.map((r, i) => (
          <li key={i} className="soft grid grid-cols-3 gap-2 rounded-3xl p-3">
            <input aria-label={t("productName")} placeholder={t("productName")} value={r.name} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} className={`${field} col-span-3`} />
            <input aria-label={t("price")} placeholder={t("price")} inputMode="numeric" value={r.price} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)))} className={`${field} col-span-2`} />
            <input aria-label={t("quantity")} placeholder={t("quantity")} inputMode="numeric" value={r.quantity} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, quantity: e.target.value } : x)))} className={field} />
          </li>
        ))}
      </ul>
      {rows.length < 20 && (
        <button type="button" onClick={() => setRows([...rows, { name: "", price: "", quantity: "" }])} className="soft min-h-12 rounded-full font-bold">+ {t("add")}</button>
      )}
      {saved !== undefined && <p role="status" className={saved ? "font-bold text-wa" : "font-bold text-red-700"}>{saved ? t("saved") : t("error")}</p>}
      <button type="submit" className="grad-btn min-h-16 rounded-3xl text-xl font-bold">{t("save")}</button>
    </form>
  );
}

export function BookingLinks({ bookingId }: { bookingId: string }) {
  const t = useTranslations("espace.actions");
  return (
    <div className="flex flex-wrap gap-x-4">
      <Link href={`/espace/reservations/${bookingId}/fiche`} className="inline-flex min-h-12 items-center font-bold text-copper-800 underline">{t("sheet")}</Link>
      <Link href={`/espace/reservations/${bookingId}/reporter`} className="inline-flex min-h-12 items-center font-bold text-copper-800 underline">{t("reschedule")}</Link>
    </div>
  );
}
