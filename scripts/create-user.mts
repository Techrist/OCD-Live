// Crée ou met à jour un compte (par exemple le premier administrateur) : npx tsx scripts/create-user.mts <email> <+téléphone> "<Nom>" <ADMIN|VALIDATOR|ASSISTANT|STUDIO|SELLER>
// La base visée est celle de DATABASE_URL (pour Neon : charger .env.neon, voir README).
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const [email, phone, name, role = "ADMIN"] = process.argv.slice(2);
if (!email?.includes("@") || !/^\+[1-9]\d{7,14}$/.test(phone ?? "") || !name) {
  console.error('Usage : npx tsx scripts/create-user.mts <email> <+telephone> "<Nom>" [ROLE]');
  process.exit(1);
}
if (!["ADMIN", "VALIDATOR", "ASSISTANT", "STUDIO", "SELLER"].includes(role)) {
  console.error("Rôle inconnu :", role);
  process.exit(1);
}
const p = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const user = await p.user.upsert({
  where: { email: email.toLowerCase() },
  create: { email: email.toLowerCase(), phone, name, role: role as never },
  update: { phone, name, role: role as never },
});
console.log("compte prêt :", user.role, user.email);
await p.$disconnect();
