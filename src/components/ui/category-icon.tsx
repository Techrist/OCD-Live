import { House, Package, Scissors, Shirt, ShoppingBag, Smartphone, UtensilsCrossed, Wrench, type LucideIcon } from "lucide-react";

// Icône = nom lucide-react stocké en base. Liste explicite : on n'embarque pas toute la bibliothèque.
const ICONS: Record<string, LucideIcon> = { UtensilsCrossed, Shirt, ShoppingBag, Scissors, Smartphone, House, Wrench, Package };

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Package;
  return <Icon aria-hidden="true" className={className} />;
}
