"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { formatPrice } from "@/lib/format";

type Item = { id: string; name: string; price: number; stock: number | null; active: boolean; photoUrl: string | null; category: string };
type Category = { id: string; name: string };

/** Catalogue du vendeur : ajout en 3 champs (nom, prix, photo), prix et stock modifiables, masquer ou supprimer (SHP-01). */
export function ProductManager({ items, categories, defaultCategoryId, limit }: { items: Item[]; categories: Category[]; defaultCategoryId: string; limit: number }) {
  const t = useTranslations("espace.products");
  const router = useRouter();
  const [message, setMessage] = useState<{ ok: boolean; text: string }>();
  const [busy, setBusy] = useState(false);
  const field = "soft min-h-14 w-full rounded-3xl px-4 text-lg font-bold";

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    setMessage(undefined);
    const res = await fetch("/api/seller/products", { method: "POST", body: new FormData(form) }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setBusy(false);
    if (!data) return setMessage({ ok: false, text: t("errors.network") });
    if (!data.ok) return setMessage({ ok: false, text: t(`errors.${data.reason}`) });
    form.reset();
    setMessage({ ok: true, text: t("added") });
    router.refresh();
  }

  async function patch(id: string, body: Record<string, unknown>) {
    await fetch("/api/seller/products", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...body }) });
    router.refresh();
  }

  async function remove(id: string) {
    if (!window.confirm(t("confirmDelete"))) return;
    await fetch(`/api/seller/products?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={add} className="flex flex-col gap-4" aria-label={t("add")}>
        <h2 className="text-xl font-bold">{t("add")}</h2>
        <label className="flex flex-col gap-1 font-bold">{t("name")}<input name="name" required maxLength={80} className={field} /></label>
        <label className="flex flex-col gap-1 font-bold">{t("price")}<input name="price" type="number" inputMode="numeric" min={0} required className={field} /></label>
        <label className="flex flex-col gap-1 font-bold">{t("photo")}<input name="photo" type="file" accept="image/jpeg,image/png,image/webp" className="soft w-full rounded-3xl p-3 font-semibold" /></label>
        <details className="rounded-3xl bg-white/60 p-4">
          <summary className="cursor-pointer font-bold">{t("more")}</summary>
          <div className="mt-3 flex flex-col gap-4">
            <label className="flex flex-col gap-1 font-bold">{t("stock")}<input name="stock" type="number" inputMode="numeric" min={0} className={field} /></label>
            <label className="flex flex-col gap-1 font-bold">{t("category")}
              <select name="categoryId" defaultValue={defaultCategoryId} className={field}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
          </div>
        </details>
        {message && <p role="alert" className={message.ok ? "font-bold text-wa" : "font-bold text-red-700"}>{message.text}</p>}
        <button type="submit" disabled={busy} className="grad-btn min-h-16 w-full rounded-3xl text-xl font-bold disabled:opacity-60">{t("save")}</button>
      </form>

      <section aria-labelledby="my-products" className="flex flex-col gap-3">
        <h2 id="my-products" className="text-xl font-bold">{t("list")} <span className="text-base text-ink/60">({items.length}/{limit})</span></h2>
        {items.length === 0 && <p className="font-semibold text-ink/70">{t("empty")}</p>}
        <ul className="flex flex-col gap-3">
          {items.map((p) => (
            <li key={p.id} data-testid="my-product" className="soft flex flex-col gap-3 rounded-3xl p-4">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.photoUrl ? <img src={p.photoUrl} alt="" className="h-16 w-16 rounded-2xl object-cover" /> : <span className="h-16 w-16 rounded-2xl bg-amber-soft" aria-hidden />}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{p.name}</p>
                  <p className="text-sm font-semibold text-ink/70">{p.category} · {formatPrice(p.price)}{!p.active ? ` · ${t("hidden")}` : ""}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-end gap-2">
                <label className="flex flex-col text-sm font-bold">{t("price")}
                  <input type="number" min={0} defaultValue={p.price} onBlur={(e) => Number(e.target.value) !== p.price && e.target.value !== "" && patch(p.id, { price: Number(e.target.value) })} className="soft min-h-11 w-28 rounded-2xl px-3 font-bold" />
                </label>
                <label className="flex flex-col text-sm font-bold">{t("stock")}
                  <input type="number" min={0} defaultValue={p.stock ?? ""} onBlur={(e) => { const v = e.target.value === "" ? null : Number(e.target.value); if (v !== p.stock) patch(p.id, { stock: v }); }} className="soft min-h-11 w-24 rounded-2xl px-3 font-bold" />
                </label>
                <button type="button" onClick={() => patch(p.id, { active: !p.active })} className="pill min-h-11 font-bold">{p.active ? t("hide") : t("show")}</button>
                <button type="button" onClick={() => remove(p.id)} className="min-h-11 rounded-full px-4 font-bold text-red-700 underline">{t("delete")}</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
