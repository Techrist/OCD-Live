// Produits de démonstration d'OCD Shop : deux par vendeur de démonstration, selon sa catégorie (développement uniquement).
const BY_CATEGORY: Record<string, [string, number, number][]> = {
  nourriture: [["Plat du jour (portion familiale)", 3500, 20], ["Sauce piment maison, pot de 250 g", 1500, 40]],
  "beaute-cheveux": [["Perruque lisse 14 pouces", 25000, 6], ["Huile de ricin pour cheveux", 3000, 30]],
  mode: [["Robe en pagne wax", 12000, 10], ["Chemise en tissu africain", 9000, 15]],
  "telephones-electronique": [["Écouteurs sans fil", 8000, 25], ["Chargeur rapide 20 W", 4500, 40]],
  maison: [["Panier tressé décoratif", 6500, 12], ["Set de 4 bougies parfumées", 5000, 18]],
  "chaussures-sacs": [["Sac à main en cuir", 18000, 8], ["Sandales artisanales", 7500, 20]],
};

export function demoProductsFor(categorySlug: string): { name: string; price: number; stock: number }[] {
  return (BY_CATEGORY[categorySlug] ?? BY_CATEGORY.mode).map(([name, price, stock]) => ({ name, price, stock }));
}
