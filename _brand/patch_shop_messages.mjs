import fs from "node:fs";

const fr = {
  nav: { shop: "Shop" },
  espaceProductsLink: "Mes produits",
  espaceProducts: {
    title: "Mes produits",
    intro: "Ajoute un produit en trois champs : nom, prix et photo. Il apparaît dans OCD Shop et sur ta vitrine ; les clients te commandent par WhatsApp.",
    viewShop: "Voir OCD Shop",
    add: "Ajouter un produit",
    name: "Nom du produit",
    price: "Prix (FCFA)",
    photo: "Photo (JPG, PNG ou WebP, 3 Mo max)",
    more: "Stock et catégorie (facultatif)",
    stock: "Stock",
    category: "Catégorie",
    save: "Ajouter",
    added: "Produit ajouté.",
    list: "Mes produits",
    empty: "Aucun produit pour l'instant.",
    hidden: "masqué",
    hide: "Masquer",
    show: "Afficher",
    delete: "Supprimer",
    confirmDelete: "Supprimer ce produit ?",
    noProfile: "Pas de profil.",
    errors: {
      network: "Connexion impossible. Réessaie.",
      INVALID_INPUT: "Vérifie le nom et le prix.",
      NO_PROFILE: "Crée d'abord ton profil vendeur en réservant un live.",
      LIMIT: "Tu as atteint la limite de 50 produits.",
      INVALID_CATEGORY: "Catégorie invalide.",
      INVALID_IMAGE: "Photo non reconnue : utilise un fichier JPG, PNG ou WebP.",
      TOO_BIG: "Photo trop lourde (3 Mo maximum).",
      FORBIDDEN: "Connecte-toi en tant que vendeur.",
    },
  },
  homeShop: {
    title: "OCD Shop",
    subtitle: "Les produits des vendeurs que tu as vus en live, à commander directement sur WhatsApp.",
    cta: "Voir tous les produits",
  },
  shop: {
    title: "OCD Shop",
    subtitle: "Les produits des vendeurs africains d'OCD Live. Choisis un article, puis commande-le par WhatsApp : aucun paiement sur le site.",
    catalogue: "Catalogue",
    filters: {
      label: "Filtrer les produits",
      search: "Recherche",
      country: "Pays",
      city: "Ville",
      category: "Catégorie",
      min: "Prix min.",
      max: "Prix max.",
      all: "Tous",
      apply: "Filtrer",
      reset: "Effacer les filtres",
    },
    count: "{count, plural, =0 {Aucun produit} one {# produit} other {# produits}}",
    empty: "Aucun produit ne correspond pour l'instant.",
    sellCta: "Tu es vendeur ? Ajoute tes produits",
    note: "Le paiement et la livraison se règlent directement avec le vendeur sur WhatsApp.",
    stock: "{count} en stock",
    soldOut: "Épuisé",
    verified: "Vendeur vérifié",
    order: {
      cta: "Commander sur WhatsApp",
      quantity: "Quantité",
      less: "Moins",
      more: "Plus",
      message: "Bonjour, je souhaite commander {qty} × {name} ({price}), soit {total}. Vu sur OCD Shop.",
    },
  },
};

const en = {
  nav: { shop: "Shop" },
  espaceProductsLink: "My products",
  espaceProducts: {
    title: "My products",
    intro: "Add a product in three fields: name, price and photo. It shows up in OCD Shop and on your showcase; customers order from you on WhatsApp.",
    viewShop: "View OCD Shop",
    add: "Add a product",
    name: "Product name",
    price: "Price (FCFA)",
    photo: "Photo (JPG, PNG or WebP, 3 MB max)",
    more: "Stock and category (optional)",
    stock: "Stock",
    category: "Category",
    save: "Add",
    added: "Product added.",
    list: "My products",
    empty: "No products yet.",
    hidden: "hidden",
    hide: "Hide",
    show: "Show",
    delete: "Delete",
    confirmDelete: "Delete this product?",
    noProfile: "No profile.",
    errors: {
      network: "Can't connect. Try again.",
      INVALID_INPUT: "Check the name and the price.",
      NO_PROFILE: "Create your seller profile first by booking a live.",
      LIMIT: "You have reached the limit of 50 products.",
      INVALID_CATEGORY: "Invalid category.",
      INVALID_IMAGE: "Photo not recognised: use a JPG, PNG or WebP file.",
      TOO_BIG: "Photo too large (3 MB maximum).",
      FORBIDDEN: "Sign in as a seller.",
    },
  },
  homeShop: {
    title: "OCD Shop",
    subtitle: "Products from the sellers you watched live, ready to order straight on WhatsApp.",
    cta: "See all products",
  },
  shop: {
    title: "OCD Shop",
    subtitle: "Products from OCD Live's African sellers. Pick an item, then order it on WhatsApp: no payment on the site.",
    catalogue: "Catalogue",
    filters: {
      label: "Filter products",
      search: "Search",
      country: "Country",
      city: "City",
      category: "Category",
      min: "Min. price",
      max: "Max. price",
      all: "All",
      apply: "Filter",
      reset: "Clear filters",
    },
    count: "{count, plural, =0 {No products} one {# product} other {# products}}",
    empty: "No product matches for now.",
    sellCta: "Are you a seller? Add your products",
    note: "Payment and delivery are settled directly with the seller on WhatsApp.",
    stock: "{count} in stock",
    soldOut: "Sold out",
    verified: "Verified seller",
    order: {
      cta: "Order on WhatsApp",
      quantity: "Quantity",
      less: "Less",
      more: "More",
      message: "Hello, I would like to order {qty} × {name} ({price}), i.e. {total}. Seen on OCD Shop.",
    },
  },
};

for (const [lang, d] of [["fr", fr], ["en", en]]) {
  const file = `src/messages/${lang}.json`;
  const j = JSON.parse(fs.readFileSync(file, "utf8"));
  j.nav.shop = d.nav.shop;
  j.espace.productsLink = d.espaceProductsLink;
  j.espace.products = d.espaceProducts;
  j.home.shop = d.homeShop;
  j.shop = d.shop;
  fs.writeFileSync(file, JSON.stringify(j, null, 2) + "\n");
}
console.log("ok");
