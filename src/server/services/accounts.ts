import "server-only";
import { db } from "@/server/db";

/** Compte vendeur créé à la première connexion (code par e-mail ou Google) ; le pays se déduit de l'indicatif du numéro. */
export async function createSellerAccount(input: { email: string; phone: string; name?: string | null }) {
  const countries = await db.country.findMany({ where: { active: true } });
  const country = countries.filter((c) => input.phone.startsWith(c.dialCode)).sort((a, b) => b.dialCode.length - a.dialCode.length)[0];
  return db.user.create({ data: { email: input.email, phone: input.phone, name: input.name ?? undefined, role: "SELLER", countryCode: country?.code } });
}
