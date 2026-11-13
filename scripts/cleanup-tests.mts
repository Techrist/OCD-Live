// Nettoie les lignes laissées par une exécution de test interrompue.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const p = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const bookings = await p.booking.findMany({ where: { reference: { startsWith: "TEST-" } }, select: { id: true, sellerId: true } });
const payments = await p.payment.findMany({ where: { bookingId: { in: bookings.map((b) => b.id) } }, select: { id: true } });
await p.receipt.deleteMany({ where: { paymentId: { in: payments.map((x) => x.id) } } });
await p.payment.deleteMany({ where: { id: { in: payments.map((x) => x.id) } } });
await p.booking.deleteMany({ where: { id: { in: bookings.map((b) => b.id) } } });
await p.slot.deleteMany({ where: { startsAt: { gte: new Date(Date.UTC(2099, 0, 1)) } } });
await p.user.deleteMany({ where: { id: { in: bookings.map((b) => b.sellerId) } } });
console.log("nettoyé :", bookings.length, "réservations de test");
await p.$disconnect();
