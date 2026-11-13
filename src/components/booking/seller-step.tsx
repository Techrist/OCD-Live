"use client";

import { useEffect, useState } from "react";
import { ArrowRight, BadgeCheck, Mail, ShieldCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { firstIncompleteStep } from "@/lib/booking-draft";
import { emailSchema } from "@/lib/email";
import { phoneSchema } from "@/lib/phone";
import { cn } from "@/lib/utils";
import { CategoryIcon } from "@/components/ui/category-icon";
import { Flag } from "@/components/ui/flag";
import { useStepGuard } from "./use-booking-draft";

type Category = { id: string; name: string; icon: string };
type Country = { code: string; name: string; dialCode: string };

const field = "soft min-h-14 w-full rounded-2xl px-4 text-lg font-bold";
const primary = "grad-btn flex min-h-16 w-full items-center justify-center gap-3 rounded-3xl text-xl font-bold disabled:opacity-50";

/** Écran 2 (RES-02) : catégorie, coordonnées, puis numéro WhatsApp vérifié par un code à 6 chiffres (panneau de droite). */
export function SellerStep({ categories, countries }: { categories: Category[]; countries: Country[] }) {
  const t = useTranslations("booking.seller");
  const tl = useTranslations("login");
  const router = useRouter();
  const locale = useLocale();
  const { draft, update, allowed } = useStepGuard("vendeur");
  const [ready, setReady] = useState(false);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string>();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  // Vendeur déjà connecté avec un profil : on saute directement à l'étape suivante.
  useEffect(() => {
    if (!allowed) return;
    let cancelled = false;
    fetch("/api/seller/profile")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.session && data.profile) {
          update({ ...data.profile, sellerDone: true });
          router.replace(`/reserver/${firstIncompleteStep({ ...draft, sellerDone: true })}`);
        } else setReady(true);
      })
      .catch(() => !cancelled && setReady(true));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowed]);

  if (!allowed || !ready) return null;
  const country = countries.find((c) => c.code === draft.countryCode);
  const phoneOk = phoneSchema.safeParse(phone).success;
  const emailOk = emailSchema.safeParse(email).success;
  const formOk = !!(draft.categoryId && draft.countryCode && draft.name?.trim() && draft.shopName?.trim() && phoneOk && emailOk);

  async function post(url: string, payload: unknown) {
    setBusy(true);
    setError(undefined);
    try {
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      return await res.json();
    } catch {
      setError(tl("errors.network"));
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function requestCode() {
    const data = await post("/api/auth/otp/request", { email, locale });
    if (!data) return;
    if (data.ok) {
      setDevCode(data.devCode);
      setSent(true);
    } else setError(tl(`errors.${data.reason}`));
  }

  async function verify() {
    const data = await post("/api/auth/otp/verify", { email, code, phone });
    if (!data) return;
    if (!data.ok) return setError(data.reason === "WRONG" ? tl("errors.WRONG", { n: data.attemptsLeft }) : tl(`errors.${data.reason}`));
    const saved = await post("/api/seller/profile", {
      name: draft.name, shopName: draft.shopName, categoryId: draft.categoryId, countryCode: draft.countryCode, city: draft.city ?? "",
    });
    if (!saved?.ok) return setError(t("saveError"));
    update({ sellerDone: true });
    router.push("/reserver/package");
  }

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[1.4fr_1fr]">
      <div className="soft flex flex-col gap-7 rounded-[2rem] p-5 md:p-7">
        <section aria-labelledby="cat" className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <h2 id="cat" className="text-lg font-bold">1. {t("categoryTitle")}</h2>
            {draft.categoryId && <span className="pill">{t("selected")}</span>}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={draft.categoryId === c.id}
                onClick={() => update({ categoryId: c.id })}
                className="soft flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl p-3 text-center font-bold"
              >
                <CategoryIcon name={c.icon} className="size-8" />
                <span className="text-sm leading-tight sm:text-base">{c.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section aria-labelledby="coord" className="flex flex-col gap-4">
          <h2 id="coord" className="text-lg font-bold">2. {t("coordTitle")}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 font-bold">{t("nameLabel")}<input value={draft.name ?? ""} onChange={(e) => update({ name: e.target.value })} autoComplete="name" className={field} /></label>
            <label className="flex flex-col gap-1 font-bold">{t("shopLabel")}<input value={draft.shopName ?? ""} onChange={(e) => update({ shopName: e.target.value })} className={field} /></label>
            <label className="flex flex-col gap-1 font-bold">
              {t("countryLabel")}
              <span className="relative">
                {country && <Flag code={country.code} className="pointer-events-none absolute top-1/2 left-4 h-5 w-8 -translate-y-1/2 rounded-sm ring-1 ring-ink/30" />}
                <select
                  value={draft.countryCode ?? ""}
                  onChange={(e) => {
                    const c = countries.find((x) => x.code === e.target.value);
                    update({ countryCode: e.target.value });
                    // L'indicatif se préremplit tant que le numéro n'a pas été saisi.
                    if (c && (phone === "" || countries.some((x) => phone === x.dialCode))) setPhone(c.dialCode);
                  }}
                  className={cn(field, country && "pl-14")}
                >
                  <option value="" disabled>{t("countryPlaceholder")}</option>
                  {countries.map((c) => <option key={c.code} value={c.code}>{c.name} ({c.dialCode})</option>)}
                </select>
              </span>
            </label>
            <label className="flex flex-col gap-1 font-bold">
              {t("phoneLabel")}
              <input type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={country?.dialCode ?? "+228"} disabled={sent} className={field} />
            </label>
            <label className="flex flex-col gap-1 font-bold sm:col-span-2">
              {t("emailLabel")}
              <input type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={sent} className={field} />
            </label>
            <label className="flex flex-col gap-1 font-bold sm:col-span-2">{t("cityLabel")}<input value={draft.city ?? ""} onChange={(e) => update({ city: e.target.value })} className={field} /></label>
          </div>
        </section>

        <p className="flex items-center gap-3 rounded-2xl bg-wall-2 p-4 font-semibold">
          <Mail aria-hidden="true" className="size-6 shrink-0 text-wa" /> {t("codeInfo")}
        </p>
        <button type="button" disabled={!formOk || busy || sent} onClick={requestCode} className={primary}>
          {t("getCode")} <ArrowRight aria-hidden="true" className="size-6" />
        </button>
      </div>

      <aside aria-labelledby="otp" className="flex flex-col gap-4">
        <div className="soft flex flex-col gap-4 rounded-[2rem] p-5 md:p-6">
          <p className="pill w-fit"><BadgeCheck aria-hidden="true" className="size-4 text-wa" /> {t("panelBadge")}</p>
          <h2 id="otp" className="text-2xl leading-tight font-bold">{t("panelTitle")}</h2>
          {!sent ? (
            <p className="text-ink/80">{t("panelWaiting")}</p>
          ) : (
            <>
              <p className="font-semibold">{tl("codeLabel", { email })}</p>
              <button type="button" onClick={() => { setSent(false); setCode(""); setError(undefined); }} className="w-fit font-bold text-copper-800 underline">{t("editNumber")}</button>
              {devCode && <p className="rounded-2xl bg-amber/30 p-3 font-bold">{tl("devCode", { code: devCode })}</p>}
              <label className="flex flex-col gap-2 text-lg font-bold">
                {t("codeTitle")}
                <input
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="soft min-h-16 w-full rounded-2xl px-4 text-center text-3xl font-bold tracking-[0.4em]"
                />
              </label>
              <button type="button" disabled={busy || code.length !== 6} onClick={verify} className={primary}>
                {t("verify")} <ArrowRight aria-hidden="true" className="size-6" />
              </button>
              <p className="text-center text-sm font-semibold">
                {t("noMessage")}{" "}
                <button type="button" onClick={requestCode} disabled={busy} className="font-bold text-copper-800 underline">{t("resend")}</button>
              </p>
            </>
          )}
          {error && <p role="alert" className="font-bold text-red-700">{error}</p>}
        </div>
        <p className="soft flex items-start gap-3 rounded-3xl p-4 text-sm font-semibold">
          <ShieldCheck aria-hidden="true" className="size-6 shrink-0 text-copper-800" /> {t("privacy")}
        </p>
      </aside>
    </div>
  );
}
