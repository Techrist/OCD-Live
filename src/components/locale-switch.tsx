"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

/** Pastille ronde FR / EN (la maquette place des boutons ronds en haut à droite). */
export function LocaleSwitch({ label }: { label: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const target = locale === "fr" ? "en" : "fr";
  return (
    <Link
      href={pathname}
      locale={target}
      aria-label={label}
      className="soft inline-flex size-12 items-center justify-center rounded-full text-sm font-bold uppercase"
    >
      {target}
    </Link>
  );
}
