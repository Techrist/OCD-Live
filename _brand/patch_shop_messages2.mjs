import fs from "node:fs";
const fr = {
  lowStock: "Plus que {count}",
  hero: {
    label: "À la une",
    eyebrow: "Nouveau · OCD Shop",
    text: "Découvre les produits des vendeurs d'Afrique vus en live et commande-les directement sur WhatsApp.",
    cta: "Voir le catalogue",
    sellTitle: "Tu vends ?",
    sellText: "Mets tes produits en ligne en quelques secondes : nom, prix, photo.",
    sellCta: "Ajouter mes produits",
  },
  sections: {
    items: "{count, plural, =0 {Aucun produit} one {# produit} other {# produits}}",
    freshTitle: "Nouveautés de la semaine",
    freshSub: "Les derniers produits ajoutés par les vendeurs.",
    byCategory: "Parcourir par catégorie",
    byCategorySub: "Mode, beauté, maison, nourriture : trouve vite ce qu'il te faut.",
    popular: "Tous les produits",
    popularSub: "Filtre par pays, ville, catégorie et prix.",
    more: "Voir plus de produits",
    cheapTitle: "Petits prix",
    cheapSub: "Des produits à 5 000 F ou moins.",
    seeAll: "Tout voir",
    shopsTitle: "Boutiques à suivre",
    shopsSub: "Les vendeurs qui ont le plus de produits en ligne.",
    viewShop: "Voir la boutique",
    reassure: "Nos engagements",
    reassureItems: {
      wa: { title: "Commande sur WhatsApp", text: "Un message prérempli part chez le vendeur : produit, quantité et prix." },
      verified: { title: "Vendeurs identifiés", text: "Chaque boutique est liée à un numéro WhatsApp vérifié par code." },
      direct: { title: "Paiement avec le vendeur", text: "Prix, paiement et livraison se règlent directement avec lui, sans passer par le site." },
    },
  },
  detail: {
    breadcrumb: "Fil d'Ariane",
    available: "Disponible",
    soldBy: "Vendu par",
    howTitle: "Comment commander",
    how1: "Tu choisis la quantité et tu touches « Commander » : WhatsApp s'ouvre avec ton message prêt.",
    how2: "Tu confirmes avec le vendeur le paiement et la livraison.",
    how3: "Tu reçois ton produit, directement du vendeur.",
    others: "Autres produits de {shop}",
    similar: "Produits similaires",
    similarSub: "Par défaut dans la même catégorie : change la catégorie, le pays ou le prix.",
    similarEmpty: "Aucun produit similaire avec ces filtres.",
  },
};
const en = {
  lowStock: "Only {count} left",
  hero: {
    label: "Featured",
    eyebrow: "New · OCD Shop",
    text: "Discover products from African sellers seen live and order them straight on WhatsApp.",
    cta: "See the catalogue",
    sellTitle: "Selling?",
    sellText: "Put your products online in seconds: name, price, photo.",
    sellCta: "Add my products",
  },
  sections: {
    items: "{count, plural, =0 {No products} one {# product} other {# products}}",
    freshTitle: "This week's new arrivals",
    freshSub: "The latest products added by sellers.",
    byCategory: "Browse by category",
    byCategorySub: "Fashion, beauty, home, food: quickly find what you need.",
    popular: "All products",
    popularSub: "Filter by country, city, category and price.",
    more: "See more products",
    cheapTitle: "Small prices",
    cheapSub: "Products at 5,000 F or less.",
    seeAll: "See all",
    shopsTitle: "Shops to follow",
    shopsSub: "The sellers with the most products online.",
    viewShop: "View the shop",
    reassure: "Our commitments",
    reassureItems: {
      wa: { title: "Order on WhatsApp", text: "A prefilled message goes to the seller: product, quantity and price." },
      verified: { title: "Identified sellers", text: "Every shop is tied to a WhatsApp number verified by code." },
      direct: { title: "Pay the seller directly", text: "Price, payment and delivery are settled with the seller, not through the site." },
    },
  },
  detail: {
    breadcrumb: "Breadcrumb",
    available: "Available",
    soldBy: "Sold by",
    howTitle: "How to order",
    how1: "Pick the quantity and tap “Order”: WhatsApp opens with your message ready.",
    how2: "Confirm payment and delivery with the seller.",
    how3: "You receive your product straight from the seller.",
    others: "More from {shop}",
    similar: "Similar products",
    similarSub: "In the same category by default: change the category, country or price.",
    similarEmpty: "No similar product with these filters.",
  },
};
for (const [lang, d] of [["fr", fr], ["en", en]]) {
  const file = `src/messages/${lang}.json`;
  const j = JSON.parse(fs.readFileSync(file, "utf8"));
  Object.assign(j.shop, d);
  fs.writeFileSync(file, JSON.stringify(j, null, 2) + "\n");
}
console.log("ok");
