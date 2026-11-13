"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { useTranslations } from "next-intl";

/** Photo du compte : sert d'aperçu quand ton live est affiché dans les directs en cours, et en tête de ta vitrine. */
export function ProfilePhotoForm({ current }: { current: string | null }) {
  const t = useTranslations("espace.photo");
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string }>();

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const body = new FormData();
    body.set("photo", file);
    setBusy(true);
    setMessage(undefined);
    const res = await fetch("/api/seller/photo", { method: "POST", body }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setBusy(false);
    e.target.value = "";
    if (!data) return setMessage({ ok: false, text: t("errors.network") });
    if (!data.ok) return setMessage({ ok: false, text: t(`errors.${data.reason}`) });
    setMessage({ ok: true, text: t("saved") });
    router.refresh();
  }

  async function remove() {
    setBusy(true);
    await fetch("/api/seller/photo", { method: "DELETE" }).catch(() => null);
    setBusy(false);
    router.refresh();
  }

  return (
    <section aria-labelledby="photo-title" className="flex flex-col gap-3 rounded-3xl border border-ink/10 bg-white p-5">
      <h2 id="photo-title" className="text-lg font-bold">{t("title")}</h2>
      <p className="font-semibold text-ink/70">{t("text")}</p>
      <div className="flex flex-wrap items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {current ? <img src={current} alt={t("alt")} className="size-24 rounded-full object-cover ring-2 ring-copper" /> : <span aria-hidden="true" className="grid size-24 place-items-center rounded-full bg-amber-soft text-copper-800"><Camera className="size-9" /></span>}
        <div className="flex flex-col gap-2">
          <label className="grad-btn flex min-h-12 cursor-pointer items-center gap-2 rounded-2xl px-5 font-bold">
            <Camera aria-hidden="true" className="size-5" /> {current ? t("change") : t("add")}
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} disabled={busy} className="sr-only" />
          </label>
          {current && <button type="button" onClick={remove} disabled={busy} className="min-h-10 w-fit font-bold text-red-700 underline">{t("remove")}</button>}
        </div>
      </div>
      {message && <p role="alert" className={message.ok ? "font-bold text-wa" : "font-bold text-red-700"}>{message.text}</p>}
    </section>
  );
}
