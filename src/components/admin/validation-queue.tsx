"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export type QueueItem = {
  id: string;
  url: string;
  platform: string;
  shop: string;
  country: string;
  category: string;
  submittedAt: string;
  flags: { duplicate: boolean; firstLive: boolean; verified: boolean };
};

const REASONS = ["PROHIBITED", "BAD_LINK", "NOT_LIVE", "OTHER"] as const;

/** ANN-03 : aperçu du lien, boutons Valider et Refuser avec motif prédéfini. */
export function ValidationQueue({ items }: { items: QueueItem[] }) {
  const t = useTranslations("admin.validation");
  const router = useRouter();
  const [busy, setBusy] = useState<string>();
  const [reason, setReason] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>();

  async function decide(id: string, decision: "VALIDATE" | "REJECT") {
    setBusy(id);
    setError(undefined);
    const res = await fetch(`/api/admin/lives/${id}/decision`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, reason: decision === "REJECT" ? t(`reasons.${reason[id] ?? "PROHIBITED"}`) : undefined }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setBusy(undefined);
    if (data?.ok) return router.refresh();
    setError(t(`errors.${data?.reason ?? "NETWORK"}`));
    router.refresh();
  }

  if (items.length === 0) return <p className="soft rounded-3xl p-5 font-semibold">{t("empty")}</p>;
  return (
    <>
      {error && <p role="alert" className="font-bold text-red-700">{error}</p>}
      <ul className="grid gap-4 md:grid-cols-2">
        {items.map((it) => (
          <li key={it.id} className="soft flex flex-col gap-3 rounded-[2rem] p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="pill">{it.platform}</span>
              {it.flags.duplicate && <span className="pill !bg-red-100 !text-red-800">{t("flags.duplicate")}</span>}
              {it.flags.firstLive && <span className="pill">{t("flags.firstLive")}</span>}
              {it.flags.verified && <span className="pill">{t("flags.verified")}</span>}
            </div>
            <p className="text-lg font-bold">{it.shop}</p>
            <p className="text-sm font-semibold text-ink/70">{it.country} · {it.category} · {new Date(it.submittedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p>
            <a href={it.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 font-bold break-all text-copper-800 underline">
              <ExternalLink aria-hidden="true" className="mt-1 size-4 shrink-0" /> {t("open")}: {it.url}
            </a>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" disabled={busy === it.id} onClick={() => decide(it.id, "VALIDATE")} className="grad-btn min-h-12 flex-1 rounded-full px-5 font-bold">{t("validate")}</button>
              <select aria-label={t("reason")} value={reason[it.id] ?? "PROHIBITED"} onChange={(e) => setReason({ ...reason, [it.id]: e.target.value })} className="soft min-h-12 rounded-full px-3 font-bold">
                {REASONS.map((r) => <option key={r} value={r}>{t(`reasons.${r}`)}</option>)}
              </select>
              <button type="button" disabled={busy === it.id} onClick={() => decide(it.id, "REJECT")} className="min-h-12 rounded-full bg-ink px-5 font-bold text-white">{t("reject")}</button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
