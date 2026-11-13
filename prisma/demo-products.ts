// Produits de démonstration d'OCD Shop (développement uniquement) : deux par vendeur de démonstration, selon sa catégorie.
// `photo` : fichier de public/images/demo (photo réelle) ; sans photo, la fiche affiche le visuel de la catégorie.
type Demo = { name: string; price: number; stock: number; photo?: string };

const BY_CATEGORY: Record<string, Demo[]> = {
  nourriture: [
    { name: "Poulet sauce légumes et plantain", price: 4500, stock: 20, photo: "poulet-legumes" },
    { name: "Ndolé aux crevettes et plantain", price: 5500, stock: 12, photo: "ndole-crevettes" },
    { name: "Viande sautée aux poivrons", price: 5000, stock: 15, photo: "viande-poivrons" },
    { name: "Plateau de riz jollof (événements)", price: 25000, stock: 6, photo: "riz-jollof" },
    { name: "Ragoût de bœuf maison", price: 4000, stock: 18, photo: "ragout-boeuf" },
    { name: "Poisson braisé, riz et plantain", price: 6000, stock: 10, photo: "poisson-riz" },
    { name: "Poisson braisé, attiéké et sauces", price: 6500, stock: 10, photo: "poisson-attieke" },
    { name: "Poisson sauce arachide et plantain", price: 5500, stock: 8, photo: "poisson-arachide" },
    { name: "Burger maison et frites", price: 3500, stock: 25, photo: "burger" },
    { name: "Spaghetti sauce tomate", price: 3000, stock: 25, photo: "spaghetti" },
    { name: "Club sandwich et frites", price: 3000, stock: 20, photo: "club-sandwich" },
  ],
  "beaute-cheveux": [
    { name: "Perruque lisse méchée 14 pouces", price: 25000, stock: 6, photo: "perruque-lisse" },
    { name: "Perruques bouclées (4 coloris)", price: 28000, stock: 8, photo: "perruques-boucles" },
    { name: "Rallonges et queues de cheval", price: 12000, stock: 15, photo: "perruques-rack" },
    { name: "Perruques courtes à frange", price: 18000, stock: 10, photo: "perruques-courtes" },
    { name: "Coffret de soins naturels", price: 12000, stock: 8, photo: "soins-naturels" },
    { name: "Palette de maquillage", price: 9000, stock: 14, photo: "maquillage" },
    { name: "Crème et huile de soin", price: 7500, stock: 20, photo: "creme-huile" },
    { name: "Sérum visage éclat", price: 10000, stock: 12, photo: "serum" },
    { name: "Lait corporel (lot de 3)", price: 6000, stock: 30, photo: "lait-corporel" },
  ],
  mode: [
    { name: "Lot de vêtements seconde main", price: 15000, stock: 10, photo: "mode-seconde-main" },
    { name: "Bracelets en cauris (lot de 3)", price: 4000, stock: 30, photo: "bracelets-cauris" },
    { name: "Chemise en tissu africain", price: 9000, stock: 15 },
  ],
  "telephones-electronique": [
    { name: "Coques et accessoires de téléphone (lot)", price: 3500, stock: 40, photo: "accessoires-telephone" },
    { name: "Réparation express de téléphone", price: 5000, stock: 50, photo: "reparation" },
  ],
  maison: [
    { name: "Panier tressé décoratif", price: 6500, stock: 12 },
    { name: "Set de 4 bougies parfumées", price: 5000, stock: 18 },
  ],
  "chaussures-sacs": [
    { name: "Sac à main en cuir", price: 18000, stock: 8 },
    { name: "Sandales artisanales", price: 7500, stock: 20 },
  ],
};

/** Deux produits pour le vendeur numéro `index` de sa catégorie (on tourne dans la liste pour varier les photos). */
export function demoProductsFor(categorySlug: string, index = 0): { name: string; price: number; stock: number; photoKey?: string }[] {
  const list = BY_CATEGORY[categorySlug] ?? BY_CATEGORY.mode;
  return [0, 1].map((k) => {
    const d = list[(index * 2 + k) % list.length];
    return { name: d.name, price: d.price, stock: d.stock, ...(d.photo ? { photoKey: `/images/demo/${d.photo}.webp` } : {}) };
  });
}
