"use client";

import { BadgeDollarSign, BarChart3, LayoutDashboard, ListChecks, Radio, ShoppingBag, Store } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/espace", icon: LayoutDashboard, key: "overview" },
  { href: "/espace/reservations", icon: ListChecks, key: "bookings" },
  { href: "/espace/produits", icon: ShoppingBag, key: "products" },
  { href: "/espace/soumettre-live", icon: Radio, key: "live" },
  { href: "/espace/vitrine", icon: Store, key: "showcase" },
  { href: "/espace/statistiques", icon: BarChart3, key: "stats" },
  { href: "/espace/abonnement", icon: BadgeDollarSign, key: "subscription" },
] as const;

/** Sous-navigation de l'espace vendeur : une rangée d'onglets qui défile sur téléphone. */
export function EspaceNav() {
  const t = useTranslations("espace.nav");
  const pathname = usePathname();
  return (
    <nav aria-label={t("label")} className="band border-b border-ink/10 bg-white/70">
      <ul className="-mx-1 flex gap-1 overflow-x-auto py-2">
        {ITEMS.map(({ href, icon: Icon, key }) => {
          const active = href === "/espace" ? pathname === "/espace" : pathname.startsWith(href);
          return (
            <li key={href} className="shrink-0">
              <Link href={href} aria-current={active ? "page" : undefined} className={cn("flex min-h-11 items-center gap-2 rounded-full px-4 font-bold whitespace-nowrap", active ? "grad-btn" : "hover:bg-wall-2")}>
                <Icon aria-hidden="true" className="size-5" /> {t(key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
