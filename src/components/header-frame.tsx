"use client";

import { useEffect, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * Cadre de l'en-tête. Sur l'accueil, il est transparent sur le héros (texte blanc) puis, dès qu'on défile,
 * devient la même barre claire collante que sur les autres pages. Sur téléphone, c'est la navigation du bas qui sert.
 */
export function HeaderFrame({ children }: { children: React.ReactNode }) {
  const isHome = usePathname() === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onHero = isHome && !scrolled;
  return (
    <header
      data-hero={onHero}
      className={cn(
        "group z-30 w-full transition-colors duration-300",
        isHome ? "absolute inset-x-0 top-0 md:fixed" : "md:sticky md:top-0",
        onHero ? "text-white" : "md:bg-[#fffaf2]/85 md:backdrop-blur-md",
        isHome && !onHero && "max-md:text-white",
      )}
    >
      {children}
    </header>
  );
}
