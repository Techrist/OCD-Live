"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { isActive, NAV_ITEMS } from "./nav-items";

/** Navigation flottante du bas, réservée aux petits écrans : l'onglet actif porte son libellé dans une capsule dégradée. */
export function BottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  return (
    <nav aria-label={t("label")} className="fixed inset-x-0 bottom-4 z-30 flex justify-center px-4 md:hidden">
      <ul className="nav-float flex items-center gap-1 rounded-full p-2">
        {NAV_ITEMS.map(({ href, icon: Icon, key }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                aria-label={t(key)}
                className={cn(
                  "flex h-12 items-center justify-center gap-2 rounded-full font-bold transition-all",
                  active ? "grad-btn px-4" : "soft w-11",
                )}
              >
                <Icon aria-hidden="true" className="size-6" />
                {active && <span>{t(key)}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
