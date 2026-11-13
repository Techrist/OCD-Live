"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { isActive, NAV_ITEMS } from "./nav-items";

/** Navigation du haut, pour les grands écrans (à partir de 768 px) ; sur téléphone, c'est la navigation du bas. */
export function TopNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  return (
    <nav aria-label={t("label")} className="hidden md:block">
      <ul className="nav-float flex items-center gap-1 rounded-full p-1.5 text-ink">
        {NAV_ITEMS.map(({ href, icon: Icon, key }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-11 items-center gap-2 rounded-full px-4 font-bold whitespace-nowrap transition-colors",
                  active ? "grad-btn" : "hover:bg-white",
                )}
              >
                <Icon aria-hidden="true" className="size-5" />
                {t(key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
