"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

/** Soumission d'un live : un seul champ, le lien à coller (ANN-02). */
export function SubmitLiveForm({ studioTz }: { studioTz: string }) {
  const t = useTranslations("espace.submit");
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string }>();
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(undefined);
    const res = await fetch("/api/lives", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setBusy(false);
    if (!data) return setMessage({ ok: false, text: t("errors.network") });
    if (data.ok) {
      setUrl("");
      return setMessage({ ok: true, text: t("ok") });
    }
    if (data.reason === "OUTSIDE_WINDOW") {
      const time = data.next
        ? new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: studioTz }).format(new Date(data.next.start))
        : "—";
      return setMessage({ ok: false, text: t("errors.OUTSIDE_WINDOW", { time }) });
    }
    setMessage({ ok: false, text: t(`errors.${data.reason}`) });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <label htmlFor="live-url" className="text-lg font-bold">{t("urlLabel")}</label>
      <input id="live-url" type="url" inputMode="url" required value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.tiktok.com/@…/live" className="soft min-h-16 w-full rounded-3xl px-4 text-lg font-bold" />
      {message && <p role="alert" className={message.ok ? "font-bold text-wa" : "font-bold text-red-700"}>{message.text}</p>}
      <button type="submit" disabled={busy} className="grad-btn min-h-16 w-full rounded-3xl text-xl font-bold disabled:opacity-60">{t("send")}</button>
    </form>
  );
}
