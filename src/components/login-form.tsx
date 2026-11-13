"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { GoogleButton } from "@/components/google-button";

type Step = "email" | "code";

const bigButton =
  "flex min-h-16 w-full items-center justify-center rounded-3xl grad-btn px-5 text-xl font-bold text-white shadow-md  disabled:opacity-60";
const input = "min-h-16 w-full rounded-3xl soft px-4 text-xl font-bold";

/** Connexion par code envoyé par e-mail, sans mot de passe (VEN-01), ou avec Google. Première connexion : on demande le numéro WhatsApp. */
export function LoginForm({ defaultDial, onSuccess, google = true }: { defaultDial: string; onSuccess?: () => void | Promise<void>; google?: boolean }) {
  const t = useTranslations("login");
  const locale = useLocale();
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(defaultDial);
  const [needsPhone, setNeedsPhone] = useState(false);
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

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault();
    const r = await post("/api/auth/otp/request", { email, locale });
    if (!r) return;
    if (r.data.ok) {
      setDevCode(r.data.devCode);
      setNeedsPhone(!!r.data.needsPhone);
      setStep("code");
    } else setError(t(`errors.${r.data.reason}`));
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    const r = await post("/api/auth/otp/verify", { email, code, ...(needsPhone ? { phone } : {}) });
    if (!r) return;
    if (r.data.ok) return onSuccess ? onSuccess() : router.push(r.data.redirect);
    setError(r.data.reason === "WRONG" ? t("errors.WRONG", { n: r.data.attemptsLeft }) : t(`errors.${r.data.reason}`));
  }

  return step === "email" ? (
    <div className="flex flex-col gap-4">
      {google && (
        <>
          <GoogleButton />
          <p className="text-center font-semibold text-ink/60">{t("or")}</p>
        </>
      )}
      <form onSubmit={sendCode} className="flex flex-col gap-4" noValidate>
        <label htmlFor="email" className="text-lg font-bold">{t("emailLabel")}</label>
        <input id="email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
        {error && <p role="alert" className="font-bold text-red-700">{error}</p>}
        <button type="submit" disabled={busy || !email.includes("@")} className={bigButton}>{t("send")}</button>
      </form>
    </div>
  ) : (
    <form onSubmit={verify} className="flex flex-col gap-4" noValidate>
      <label htmlFor="code" className="text-lg font-bold">{t("codeLabel", { email })}</label>
      <input
        id="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        className={`${input} text-center text-2xl tracking-[0.4em]`}
      />
      {needsPhone && (
        <>
          <label htmlFor="phone" className="text-lg font-bold">{t("phoneLabel")}</label>
          <input id="phone" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={input} />
          <p className="text-sm font-semibold text-ink/70">{t("phoneHint")}</p>
        </>
      )}
      {devCode && <p className="rounded-xl bg-amber/30 p-3 font-bold">{t("devCode", { code: devCode })}</p>}
      {error && <p role="alert" className="font-bold text-red-700">{error}</p>}
      <button type="submit" disabled={busy || code.length !== 6} className={bigButton}>{t("verify")}</button>
      <button type="button" onClick={() => sendCode()} disabled={busy} className="min-h-12 font-bold text-copper-800 underline">{t("resend")}</button>
      <button type="button" onClick={() => { setStep("email"); setCode(""); setError(undefined); }} className="min-h-12 font-bold underline">{t("changeEmail")}</button>
    </form>
  );
}
