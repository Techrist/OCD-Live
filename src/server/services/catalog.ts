import "server-only";
import { db } from "@/server/db";

// Lectures de la base pour le parcours : aucun prix ni horaire n'est codé en dur.

export async function getSetting<T>(key: string): Promise<T> {
  const row = await db.setting.findUniqueOrThrow({ where: { key } });
  return row.value as T;
}

export const getStudioTimezone = () => getSetting<string>("studio.timezone");

export function getCategories() {
  return db.category.findMany({ where: { active: true }, orderBy: { order: "asc" }, select: { id: true, slug: true, name: true, icon: true } });
}

export function getCountries() {
  return db.country.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { code: true, name: true, dialCode: true, timezone: true },
  });
}

export function getPackages() {
  return db.package.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    select: {
      slug: true, name: true, mode: true, durationMinutes: true, liveCount: true, price: true,
      currency: true, features: true, highlighted: true, quoteOnly: true,
    },
  });
}

/** Premier mois (AAAA-MM, heure du studio) qui a encore des créneaux ouverts à venir. */
export async function getFirstOpenMonth(): Promise<string> {
  const tz = await getStudioTimezone();
  const slot = await db.slot.findFirst({ where: { status: "OPEN", startsAt: { gt: new Date() } }, orderBy: { startsAt: "asc" } });
  const { formatInTimeZone } = await import("date-fns-tz");
  return formatInTimeZone(slot?.startsAt ?? new Date(), tz, "yyyy-MM");
}
