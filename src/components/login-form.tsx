"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

type Step = "phone" | "code";

const bigButton =
  "flex min-h-16 w-full items-center justify-center rounded-3xl grad-btn px-5 text-xl font-bold text-white shadow-md  disabled:opacity-60";
const input = "min-h-16 w-full rounded-3xl soft px-4 text-2xl font-bold tracking-wide";

/** Connexion par numéro WhatsApp + code OTP, sans mot de passe (VEN-01). */
export function LoginForm({ defaultDial, onSuccess }: { defaultDial: string; onSuccess?: () => void | Promise<void> }) {
  const t = useTranslations("login");
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState(defaultDial);
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string>();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function post(url: string, payload: unknown) {
    setBusy(true);
    setError(undefined);
    try {
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      return { res, data: await res.json() };
    } catch {
      setError(t("errors.network"));
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    const r = await post("/api/auth/otp/request", { phone });
    if (!r) return;
    if (r.data.ok) {
      setDevCode(r.data.devCode);
      setStep("code");
    } else setError(t(`errors.${r.data.reason}`));
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    const r = await post("/api/auth/otp/verify", { phone, code });
    if (!r) return;
    if (r.data.ok) return onSuccess ? onSuccess() : router.push(r.data.redirect);
    setError(r.data.reason === "WRONG" ? t("errors.WRONG", { n: r.data.attemptsLeft }) : t(`errors.${r.data.reason}`));
  }

  return step === "phone" ? (
    <form onSubmit={sendCode} className="flex flex-col gap-4" noValidate>
      <label htmlFor="phone" className="text-lg font-bold">
        {t("phoneLabel")}
      </label>
      <input id="phone" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={input} />
      {error && <p role="alert" className="font-bold text-red-700">{error}</p>}
      <button type="submit" disabled={busy} className={bigButton}>
        {t("send")}
      </button>
    </form>
  ) : (
    <form onSubmit={verify} className="flex flex-col gap-4" noValidate>
      <label htmlFor="code" className="text-lg font-bold">
        {t("codeLabel", { phone })}
      </label>
      <input
        id="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        className={`${input} text-center tracking-[0.4em]`}
      />
      {devCode && <p className="rounded-xl bg-amber/30 p-3 font-bold">{t("devCode", { code: devCode })}</p>}
      {error && <p role="alert" className="font-bold text-red-700">{error}</p>}
      <button type="submit" disabled={busy || code.length !== 6} className={bigButton}>
        {t("verify")}
      </button>
      <button type="button" onClick={() => { setStep("phone"); setCode(""); setError(undefined); }} className="min-h-12 font-bold underline">
        {t("changeNumber")}
      </button>
    </form>
  );
}
