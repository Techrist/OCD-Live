"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { assistedBookingAction, type FormState } from "@/server/actions/admin";

export function AssistedBookingForm({ packages, slots }: { packages: { slug: string; name: string }[]; slots: { id: string; label: string }[] }) {
  const t = useTranslations("admin.assisted");
  const [state, action, pending] = useActionState<FormState, FormData>(assistedBookingAction, undefined);
  const field = "soft min-h-14 w-full rounded-3xl px-4 text-lg font-bold";
  return (
    <form action={action} className="flex max-w-xl flex-col gap-4">
      <label className="flex flex-col gap-1 font-bold">
        {t("phone")}
        <input name="phone" type="tel" required defaultValue="+" className={field} />
      </label>
      <label className="flex flex-col gap-1 font-bold">
        {t("package")}
        <select name="packageSlug" required className={field}>
          {packages.map((p) => (
            <option key={p.slug} value={p.slug}>{p.name}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 font-bold">
        {t("slot")}
        <select name="slotId" required className={field}>
          {slots.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </label>
      {state?.error && <p role="alert" className="font-bold text-red-700">{t(`errors.${state.error}`)}</p>}
      {state?.ok && state.id && (
        <p className="font-bold">
          {t("created")} <Link href={`/admin/reservations/${state.id}`} className="text-copper-800 underline">→</Link>
        </p>
      )}
      <button type="submit" disabled={pending} className="grad-btn min-h-16 rounded-full text-xl font-bold disabled:opacity-60">
        {t("submit")}
      </button>
    </form>
  );
}
