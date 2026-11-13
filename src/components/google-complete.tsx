"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

const input = "min-h-16 w-full rounded-3xl soft px-4 text-xl font-bold";

/** Retour de Google : ouvre notre session ; à la première connexion, demande le numéro WhatsApp. */
export function GoogleComplete({ defaultDial }: { defaultDial: string }) {
  const t = useTranslations("login");
  const router = useRouter();
  const [needsPhone, setNeedsPhone] = useState(false);
  const [phone, setPhone] = useState(defaultDial);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(true);
  const started = useRef(false);

  async function complete(withPhone?: string) {
    setBusy(true);
    setError(undefined);
    const res = await fetch("/api/auth/google/complete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(withPhone ? { phone: withPhone } : {}) }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setBusy(false);
    if (!data) return setError(t("errors.network"));
    if (data.ok) return router.push(data.redirect);
    if (data.reason === "PHONE_REQUIRED") return setNeedsPhone(true);
    setError(t(`errors.${data.reason}`));
  }

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void complete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (needsPhone) {
    return (
      <form onSubmit={(e) => { e.preventDefault(); void complete(phone); }} className="flex flex-col gap-4" noValidate>
        <label htmlFor="phone" className="text-lg font-bold">{t("phoneLabel")}</label>
        <input id="phone" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={input} />
        <p className="text-sm font-semibold text-ink/70">{t("phoneHint")}</p>
        {error && <p role="alert" className="font-bold text-red-700">{error}</p>}
        <button type="submit" disabled={busy} className="grad-btn flex min-h-16 w-full items-center justify-center rounded-3xl text-xl font-bold disabled:opacity-60">{t("verify")}</button>
      </form>
    );
  }
  return error ? <p role="alert" className="font-bold text-red-700">{error}</p> : <p className="font-semibold" aria-live="polite">{t("googleWait")}</p>;
}
