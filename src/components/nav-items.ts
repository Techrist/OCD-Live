import { CalendarPlus, House, Radio, ShoppingBag, UserRound, type LucideIcon } from "lucide-react";

export type NavItem = { href: "/" | "/reserver" | "/lives" | "/shop" | "/espace"; icon: LucideIcon; key: "home" | "book" | "lives" | "shop" | "space" };

// Mêmes entrées pour la navigation du bas (téléphone) et celle du haut (grands écrans).
export const NAV_ITEMS: NavItem[] = [
  { href: "/", icon: House, key: "home" },
  { href: "/reserver", icon: CalendarPlus, key: "book" },
  { href: "/lives", icon: Radio, key: "lives" },
  { href: "/shop", icon: ShoppingBag, key: "shop" },
  { href: "/espace", icon: UserRound, key: "space" },
];

export function isActive(pathname: string, href: NavItem["href"]): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
