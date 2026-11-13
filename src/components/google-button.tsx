"use client";

import { useState } from "react";
import { createAuthClient } from "@neon/auth/next";
import { useLocale, useTranslations } from "next-intl";

const authClient = createAuthClient();

/** « Continuer avec Google » : Neon Auth gère la connexion Google, puis /connexion/google ouvre notre session. */
export function GoogleButton() {
  const t = useTranslations("login");
  const locale = useLocale();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function go() {
    setBusy(true);
    setError(false);
    try {
      const res = await authClient.signIn.social({ provider: "google", callbackURL: `/${locale}/connexion/google` });
      if (res?.error) throw new Error(res.error.message);
    } catch {
      setError(true);
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button type="button" onClick={go} disabled={busy} className="flex min-h-16 w-full items-center justify-center gap-3 rounded-3xl border-2 border-ink/15 bg-white px-5 text-xl font-bold disabled:opacity-60">
        <svg aria-hidden="true" viewBox="0 0 48 48" className="size-6">
          <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.5 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.6 17.7 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.8c4.3-4 6.9-9.9 6.9-17.2z" />
          <path fill="#FBBC05" d="M10.4 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.9-4.7l-7.8-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.8-6.1z" />
          <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.8c-2.1 1.4-4.8 2.3-8.5 2.3-6.3 0-11.7-4.1-13.6-9.8l-7.8 6.1C6.5 42.6 14.6 48 24 48z" />
        </svg>
        {t("google")}
      </button>
      {error && <p role="alert" className="font-bold text-red-700">{t("errors.GOOGLE_FAILED")}</p>}
    </div>
  );
}
