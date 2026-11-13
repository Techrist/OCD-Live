// Remet les 10 lives de démonstration en ligne pour 7 jours (développement).
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { demoProductsFor } from "../prisma/demo-products";

const p = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const demo = await p.sellerProfile.findMany({ where: { slug: { startsWith: "demo-" } }, select: { userId: true, categoryId: true, category: { select: { slug: true } } } });
const res = await p.liveSubmission.updateMany({
  where: { sellerId: { in: demo.map((d) => d.userId) } },
  data: { status: "PUBLISHED", expiresAt: new Date(Date.now() + 7 * 86_400_000) },
});
let products = 0;
for (const d of demo) {
  for (const prod of demoProductsFor(d.category.slug)) {
    const exists = await p.product.findFirst({ where: { sellerId: d.userId, name: prod.name } });
    if (!exists) { await p.product.create({ data: { sellerId: d.userId, categoryId: d.categoryId, ...prod } }); products++; }
  }
}
console.log("produits de démonstration ajoutés :", products);
console.log("lives de démonstration remis en ligne :", res.count);
await p.$disconnect();
