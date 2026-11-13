// Données de test (sections 15 et 21). Seul endroit où les valeurs par défaut sont écrites :
// le reste du code les lit en base. Lancer avec `npm run db:reset`.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { demoProductsFor } from "./demo-products";
import { generateMonthSlots } from "../src/server/services/slots";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const COUNTRIES = [
  ["TG", "Togo", "+228", "XOF", "Africa/Lome"],
  ["CM", "Cameroun", "+237", "XAF", "Africa/Douala"],
  ["BJ", "Bénin", "+229", "XOF", "Africa/Porto-Novo"],
  ["CI", "Côte d'Ivoire", "+225", "XOF", "Africa/Abidjan"],
  ["SN", "Sénégal", "+221", "XOF", "Africa/Dakar"],
  ["BF", "Burkina Faso", "+226", "XOF", "Africa/Ouagadougou"],
  ["GA", "Gabon", "+241", "XAF", "Africa/Libreville"],
  ["CD", "RD Congo", "+243", "CDF", "Africa/Kinshasa"],
  ["CG", "Congo", "+242", "XAF", "Africa/Brazzaville"],
  ["TD", "Tchad", "+235", "XAF", "Africa/Ndjamena"],
  ["CF", "Centrafrique", "+236", "XAF", "Africa/Bangui"],
  ["ML", "Mali", "+223", "XOF", "Africa/Bamako"],
  ["NE", "Niger", "+227", "XOF", "Africa/Niamey"],
  ["GN", "Guinée", "+224", "GNF", "Africa/Conakry"],
] as const;

const CATEGORIES = [
  ["nourriture", "Nourriture", "UtensilsCrossed"],
  ["mode", "Mode et vêtements", "Shirt"],
  ["chaussures-sacs", "Chaussures et sacs", "ShoppingBag"],
  ["beaute-cheveux", "Beauté et cheveux", "Scissors"],
  ["telephones-electronique", "Téléphones et électronique", "Smartphone"],
  ["maison", "Maison", "House"],
  ["services", "Services", "Wrench"],
  ["autre", "Autre", "Package"],
] as const;

const PACKAGES = [
  { slug: "essai", name: "Essai", mode: "BOTH", durationMinutes: 90, liveCount: 1, price: 15000, order: 1, features: ["1 live de 1h30", "Ton numéro et ton adresse à l'écran"], highlighted: true },
  { slug: "studio-long", name: "Studio long", mode: "ONSITE", durationMinutes: 240, liveCount: 1, price: 45000, order: 2, features: ["1 live de 4 h", "Moins cher à l'heure"] },
  { slug: "pack-4-lives", name: "Pack 4 lives", mode: "BOTH", durationMinutes: 90, liveCount: 4, price: 50000, order: 3, features: ["4 lives de 1h30 dans le mois", "Lives utilisables quand tu veux"] },
  { slug: "annonce-bovan", name: "Annonce Bovan", mode: "BOTH", durationMinutes: 90, liveCount: 1, price: 35000, order: 4, includesAnnouncement: true, features: ["Vidéo d'annonce publiée par Bovan", "Puis ton live"] },
  { slug: "mensuel", name: "Mensuel", mode: "BOTH", durationMinutes: 90, liveCount: 8, price: 90000, order: 5, features: ["8 lives dans le mois", "Lives récurrents"] },
  { slug: "sur-mesure", name: "Sur mesure", mode: "BOTH", durationMinutes: 90, liveCount: 1, price: 0, quoteOnly: true, order: 6, features: ["Contact WhatsApp", "Pour un besoin spécifique"] },
] as const;

const SETTINGS: Record<string, unknown> = {
  "booking.holdMinutes": 10,
  "booking.cancelFreeHoursBefore": 48,
  "booking.bufferMinutes": 30,
  "booking.slotDurationMinutes": 90,
  "studio.timezone": "Africa/Lome",
  "studio.startHours": [8, 10, 12, 14, 16, 18],
  "studio.closedWeekdays": [0],
  "studio.remoteCapacity": 2,
  "subscription.priceFcfa": 5000,
  "subscription.durationDays": 30,
  "subscription.remindDaysBefore": 3,
  "studio.address": "Studio OCD Live, Lomé, Togo",
  "studio.mapsUrl": "",
  "directory.platforms": ["TIKTOK", "FACEBOOK", "INSTAGRAM", "YOUTUBE"],
};

async function main() {
  for (const [code, name, dialCode, currency, timezone] of COUNTRIES) {
    await prisma.country.create({ data: { code, name, dialCode, currency, timezone } });
  }
  const categories: Record<string, string> = {};
  for (const [i, [slug, name, icon]] of CATEGORIES.entries()) {
    const c = await prisma.category.create({ data: { slug, name, icon, order: i + 1 } });
    categories[slug] = c.id;
  }
  const packages: Record<string, string> = {};
  for (const p of PACKAGES) {
    const row = await prisma.package.create({ data: { ...p, features: [...p.features] } });
    packages[p.slug] = row.id;
  }
  for (const [key, value] of Object.entries(SETTINGS)) {
    await prisma.setting.create({ data: { key, value: value as never } });
  }
  await prisma.validationWindow.createMany({
    data: [
      { label: "Matin", startTime: "08:00", endTime: "11:00" },
      { label: "Soir", startTime: "18:00", endTime: "21:00" },
    ],
  });

  // Créneaux de décembre 2026 (lus depuis les réglages ci-dessus, pas codés dans le service).
  const slots = generateMonthSlots(2026, 12, {
    timezone: SETTINGS["studio.timezone"] as string,
    startHours: SETTINGS["studio.startHours"] as number[],
    durationMinutes: SETTINGS["booking.slotDurationMinutes"] as number,
    closedWeekdays: SETTINGS["studio.closedWeekdays"] as number[],
    capacity: { ONSITE: 1, REMOTE: SETTINGS["studio.remoteCapacity"] as number },
  });
  await prisma.slot.createMany({ data: slots });

  // Comptes de test (section 21).
  const team = [
    ["+22890000001", "Admin Bovan", "ADMIN", "admin@ocdlive.test"],
    ["+22890000002", "Validateur", "VALIDATOR", "validateur@ocdlive.test"],
    ["+22890000003", "Assistante", "ASSISTANT", "assistante@ocdlive.test"],
    ["+22890000004", "Régie studio", "STUDIO", "studio@ocdlive.test"],
  ] as const;
  const users: Record<string, string> = {};
  for (const [phone, name, role, email] of team) {
    users[role] = (await prisma.user.create({ data: { phone, email, name, role, countryCode: "TG" } })).id;
  }
  const cm = await prisma.user.create({ data: { phone: "+237690000005", email: "aicha@ocdlive.test", name: "Aïcha Mballa", role: "SELLER", countryCode: "CM", city: "Douala" } });
  const bj = await prisma.user.create({ data: { phone: "+22990000006", email: "koffi@ocdlive.test", name: "Koffi Adjovi", role: "SELLER", countryCode: "BJ", city: "Cotonou" } });
  await prisma.sellerProfile.create({ data: { userId: cm.id, slug: "chez-aicha", shopName: "Chez Aïcha", activity: "Plats camerounais", categoryId: categories["nourriture"], verified: true } });
  await prisma.sellerProfile.create({ data: { userId: bj.id, slug: "koffi-mode", shopName: "Koffi Mode", activity: "Vêtements", categoryId: categories["mode"] } });

  // Vendeur camerounais : abonnement actif + 2 réservations confirmées payées avec reçu.
  const now = new Date();
  const sub = await prisma.subscription.create({ data: { sellerId: cm.id, startsAt: now, endsAt: new Date(now.getTime() + 30 * 86_400_000) } });
  await prisma.payment.create({ data: { subscriptionId: sub.id, provider: "mock", method: "ORANGE_MONEY", amount: 5000, currency: "XAF", status: "SUCCEEDED", providerRef: "mock_sub_seed_1", payerPhone: cm.phone } });
  const bookingSlots = await prisma.slot.findMany({ where: { mode: "REMOTE" }, orderBy: { startsAt: "asc" }, take: 2, skip: 3 });
  for (const [i, slot] of bookingSlots.entries()) {
    const n = String(i + 1).padStart(6, "0");
    const booking = await prisma.booking.create({
      data: { reference: `OCD-2026-${n}`, sellerId: cm.id, slotId: slot.id, packageId: packages["essai"], mode: "REMOTE", status: "CONFIRMED", amount: 15000, currency: "XAF", assistantId: users["ASSISTANT"] },
    });
    const payment = await prisma.payment.create({ data: { bookingId: booking.id, provider: "mock", method: "MTN_MOMO", amount: 15000, currency: "XAF", status: "SUCCEEDED", providerRef: `mock_booking_seed_${i + 1}`, payerPhone: cm.phone } });
    await prisma.receipt.create({ data: { paymentId: payment.id, number: `R-2026-${n}` } });
  }

  // 10 lives publiés sur 4 pays pour que l'annuaire ne soit pas vide.
  const demo = [
    ["CM", "Douala", "nourriture", "Poulet DG de Mama Rose", "tiktok.com/@mamarose/live"],
    ["CM", "Yaoundé", "beaute-cheveux", "Perruques Divine", "tiktok.com/@perruquesdivine/live"],
    ["CM", "Douala", "mode", "Wax Style 237", "tiktok.com/@waxstyle237/live"],
    ["TG", "Lomé", "nourriture", "Délices de Lomé", "tiktok.com/@delicesdelome/live"],
    ["TG", "Lomé", "telephones-electronique", "Tech Togo", "tiktok.com/@techtogo/live"],
    ["TG", "Kpalimé", "maison", "Déco Kpalimé", "tiktok.com/@decokpalime/live"],
    ["BJ", "Cotonou", "chaussures-sacs", "Sacs de Cotonou", "tiktok.com/@sacscotonou/live"],
    ["BJ", "Porto-Novo", "mode", "Pagne Premium", "tiktok.com/@pagnepremium/live"],
    ["CI", "Abidjan", "nourriture", "Attiéké Express", "tiktok.com/@attiekeexpress/live"],
    ["CI", "Abidjan", "beaute-cheveux", "Tresses d'Abidjan", "tiktok.com/@tressesabidjan/live"],
  ] as const;
  for (const [i, [cc, city, cat, shop, url]] of demo.entries()) {
    const dial = COUNTRIES.find((c) => c[0] === cc)![2];
    const seller = await prisma.user.create({ data: { phone: `${dial}9100${String(i).padStart(4, "0")}`, name: shop, role: "SELLER", countryCode: cc, city } });
    await prisma.sellerProfile.create({ data: { userId: seller.id, slug: `demo-${i + 1}`, shopName: shop, activity: shop, categoryId: categories[cat], verified: i % 3 === 0 } });
    for (const prod of demoProductsFor(cat)) {
      await prisma.product.create({ data: { sellerId: seller.id, categoryId: categories[cat], ...prod } });
    }
    await prisma.liveSubmission.create({
      data: {
        sellerId: seller.id, url: `https://www.${url}`, platform: "TIKTOK", countryCode: cc, categoryId: categories[cat],
        status: "PUBLISHED", validatedById: users["VALIDATOR"], publishedAt: now, expiresAt: new Date(now.getTime() + 7 * 86_400_000),
      },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
