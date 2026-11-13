"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { phoneSchema } from "@/lib/phone";
import { assertRole } from "@/server/auth/roles";
import { readSession } from "@/server/auth/session";
import { db } from "@/server/db";
import {
  assignAssistant,
  audit,
  cancelBooking,
  createAssistedBooking,
  openMonth,
  recordStudioPayment,
  setDayClosed,
} from "@/server/services/admin";

// Chaque action vérifie le rôle côté serveur (règle de la section 15) puis journalise (ADM-07).
const ADMIN = ["ADMIN"] as const;
const COUNTER = ["ADMIN", "STUDIO"] as const;

async function actor(roles: readonly ("ADMIN" | "STUDIO")[]) {
  return assertRole(await readSession(), [...roles]);
}

export type FormState = { ok?: boolean; error?: string; id?: string } | undefined;

export async function assistedBookingAction(_: FormState, form: FormData): Promise<FormState> {
  const s = await actor(COUNTER);
  const parsed = z.object({ phone: phoneSchema, packageSlug: z.string().min(1), slotId: z.string().min(1) }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "INVALID_INPUT" };
  const res = await createAssistedBooking({ ...parsed.data, actorId: s.sub });
  revalidatePath("/[locale]/admin", "layout");
  return res.ok ? { ok: true, id: res.id } : { error: res.reason };
}

export async function studioPaymentAction(bookingId: string) {
  const s = await actor(COUNTER);
  await recordStudioPayment(bookingId, s.sub);
  revalidatePath("/[locale]/admin", "layout");
}

export async function cancelBookingAction(bookingId: string, form: FormData) {
  const s = await actor(ADMIN);
  const reason = z.string().trim().min(1).max(200).parse(form.get("reason") ?? "Annulé par l'équipe");
  await cancelBooking(bookingId, s.sub, reason);
  revalidatePath("/[locale]/admin", "layout");
}

export async function assignAssistantAction(bookingId: string, form: FormData) {
  const s = await actor(ADMIN);
  const id = String(form.get("assistantId") ?? "");
  await assignAssistant(bookingId, id || null, s.sub);
  revalidatePath("/[locale]/admin", "layout");
}

export async function openMonthAction(form: FormData) {
  const s = await actor(ADMIN);
  const { month } = z.object({ month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/) }).parse(Object.fromEntries(form));
  const [y, m] = month.split("-").map(Number);
  await openMonth(y, m, s.sub);
  revalidatePath("/[locale]/admin/calendrier", "page");
}

export async function setDayClosedAction(date: string, closed: boolean) {
  const s = await actor(ADMIN);
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/).parse(date);
  await setDayClosed(date, closed, s.sub);
  revalidatePath("/[locale]/admin/calendrier", "page");
}

const packageSchema = z.object({
  name: z.string().trim().min(1).max(60),
  price: z.coerce.number().int().min(0),
  durationMinutes: z.coerce.number().int().min(15).max(1440),
  liveCount: z.coerce.number().int().min(1).max(100),
  order: z.coerce.number().int().min(0).max(999),
});

/** Prix, durée, contenu, visibilité et ordre modifiables sans développeur (PKG-03). */
export async function updatePackageAction(id: string, form: FormData) {
  const s = await actor(ADMIN);
  const parsed = packageSchema.parse(Object.fromEntries(form));
  const data = { ...parsed, active: form.get("active") === "on", highlighted: form.get("highlighted") === "on" };
  await db.package.update({ where: { id }, data });
  await audit(s.sub, "package.update", "Package", id, data);
  revalidatePath("/[locale]/admin/packages", "page");
  revalidatePath("/[locale]/reserver/package", "page");
}

export async function updateSettingAction(key: string, form: FormData) {
  const s = await actor(ADMIN);
  const raw = String(form.get("value") ?? "");
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return;
  }
  await db.setting.update({ where: { key }, data: { value: value as never } });
  await audit(s.sub, "setting.update", "Setting", key, { value });
  revalidatePath("/[locale]/admin/parametres", "page");
}
