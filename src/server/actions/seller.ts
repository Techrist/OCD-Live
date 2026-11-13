"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertRole } from "@/server/auth/roles";
import { readSession } from "@/server/auth/session";
import { db } from "@/server/db";
import { cancelBySeller, productSheetSchema, rescheduleBooking, saveProductSheet } from "@/server/services/reservations";

// Actions du vendeur connecté : le rôle est vérifié côté serveur et chaque requête est limitée à ses propres données.
async function seller() {
  return assertRole(await readSession(), ["SELLER"]);
}

const showcaseSchema = z.object({
  shopName: z.string().trim().min(1).max(80),
  activity: z.string().trim().min(1).max(120),
  description: z.string().trim().max(300),
});

/** ANN-12 : le vendeur modifie sa vitrine. */
export async function updateShowcaseAction(form: FormData) {
  const s = await seller();
  const data = showcaseSchema.parse(Object.fromEntries(form));
  await db.sellerProfile.update({ where: { userId: s.sub }, data: { ...data, description: data.description || null } });
  revalidatePath("/[locale]/espace/vitrine", "page");
}

export async function cancelMyBookingAction(bookingId: string) {
  const s = await seller();
  const res = await cancelBySeller(bookingId, s.sub);
  revalidatePath("/[locale]/espace/reservations", "page");
  return res;
}

export async function rescheduleAction(bookingId: string, slotId: string) {
  const s = await seller();
  const res = await rescheduleBooking(bookingId, s.sub, slotId);
  revalidatePath("/[locale]/espace/reservations", "page");
  return res;
}

export async function saveProductSheetAction(bookingId: string, input: unknown) {
  const s = await seller();
  const parsed = productSheetSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const };
  const res = await saveProductSheet(bookingId, s.sub, parsed.data);
  revalidatePath("/[locale]/espace/reservations", "page");
  return res;
}
