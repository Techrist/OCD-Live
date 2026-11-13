"use client";

import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * Cadre de l'en-tête : sur l'accueil, il flotte en transparence sur le héros (texte blanc) ;
 * ailleurs, c'est une barre claire qui reste visible en haut sur grand écran.
 */
export function HeaderFrame({ children }: { children: React.ReactNode }) {
  const onHero = usePathname() === "/";
  return (
    <header
      data-hero={onHero}
      className={cn(
        "group z-30 w-full",
        onHero ? "absolute inset-x-0 top-0 text-white" : "md:sticky md:top-0 md:bg-[#fffaf2]/85 md:backdrop-blur-md",
      )}
    >
      {children}
    </header>
  );
}
