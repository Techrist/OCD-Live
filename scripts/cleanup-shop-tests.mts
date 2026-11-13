// Supprime les produits créés par les tests e2e du shop (nom « Produit test … » / « Faux produit ») et leurs photos.
import "dotenv/config";
import { rm } from "node:fs/promises";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const p = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const rows = await p.product.findMany({ where: { OR: [{ name: { startsWith: "Produit test " } }, { name: "Faux produit" }] } });
for (const r of rows) if (r.photoKey) await rm(path.join(process.cwd(), ".uploads", ...r.photoKey.split("/")), { force: true });
const res = await p.product.deleteMany({ where: { id: { in: rows.map((r) => r.id) } } });
console.log("produits de test supprimés :", res.count);
await p.$disconnect();
