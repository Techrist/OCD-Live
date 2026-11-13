"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

// Les cartes sont posées sur la circonférence d'un grand cercle (rayon R) : la carte à l'écart `d` du centre se trouve à
// l'angle d × STEP, donc x = R·sin(a), y = R·(1 − cos(a)) (elle descend en s'éloignant) et elle s'incline de a vers l'extérieur.
const R = 700; // rayon de l'arc (px, taille de base)
const STEP = 0.18; // angle entre deux cartes voisines (radians)
const CARD_W = 152; // carte active, largeur de base (px)
const CARD_H = 192; // carte active, hauteur de base (px)
const LIFT = 10; // la carte active est un peu plus haute que l'arc

const REDUCED = "(prefers-reduced-motion: reduce)";
function subscribeReduced(cb: () => void) {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const nowMs = () => Date.now();

function place(d: number) {
  const a = d * STEP;
  return {
    x: Math.sin(a) * R,
    y: R * (1 - Math.cos(a)) - (d === 0 ? LIFT : 0),
    rotate: (a * 180) / Math.PI,
    scale: 1 - 0.13 * Math.abs(d), // plus on s'éloigne du centre, plus la carte est petite
    z: 10 - Math.abs(d),
  };
}

/**
 * Carrousel en arc de cercle des portraits du héros : la carte active est au centre (droite, plus grande, au premier plan),
 * les voisines suivent l'arc en s'inclinant et se chevauchent légèrement. Clic sur une carte, flèches, balayage ou clavier
 * la ramènent au centre ; autoplay discret (désactivé si la personne préfère moins d'animations).
 */
export function HeroCarousel({ images }: { images: string[] }) {
  const t = useTranslations("home.carousel");
  const n = images.length;
  const [active, setActive] = useState(Math.floor(n / 2));
  const [unit, setUnit] = useState(1);
  const reduced = useSyncExternalStore(subscribeReduced, () => window.matchMedia(REDUCED).matches, () => false);
  const stage = useRef<HTMLDivElement>(null);
  const pausedUntil = useRef(0);
  const swipe = useRef<number | null>(null);

  // Taille adaptée à la largeur disponible : l'arc complet ne déborde jamais.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const update = () => setUnit(Math.min(2.1, Math.max(0.58, el.clientWidth / 620)));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pause = () => {
    pausedUntil.current = nowMs() + 8000;
  };
  const go = (to: number) => {
    pause();
    setActive(((to % n) + n) % n);
  };

  // Autoplay discret : une carte toutes les 5 s, en pause 8 s après une action.
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      if (nowMs() >= pausedUntil.current) setActive((a) => (a + 1) % n);
    }, 5000);
    return () => clearInterval(id);
  }, [n, reduced]);

  const half = Math.floor(n / 2);
  const offset = (i: number) => ((i - active + n + half) % n) - half; // écart signé le plus court : -2 … 2

  return (
    <div role="group" aria-roledescription="carousel" aria-label={t("label")} className="relative z-10 mt-10 -mb-14 w-full px-5 sm:-mb-20">
      <div
        ref={stage}
        className="relative mx-auto w-full max-w-6xl touch-pan-y select-none"
        style={{ height: (CARD_H + LIFT + 6) * unit }}
        onPointerDown={(e) => {
          swipe.current = e.clientX;
          pause();
        }}
        onPointerUp={(e) => {
          if (swipe.current !== null && Math.abs(e.clientX - swipe.current) > 40) go(active + (e.clientX < swipe.current ? 1 : -1));
          swipe.current = null;
        }}
        onPointerCancel={() => (swipe.current = null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") go(active - 1);
          if (e.key === "ArrowRight") go(active + 1);
        }}
      >
        {images.map((src, i) => {
          const d = offset(i);
          const p = place(d);
          const isActive = d === 0;
          return (
            <button
              key={src}
              type="button"
              aria-label={t("card", { n: i + 1, total: n })}
              aria-current={isActive ? "true" : undefined}
              onClick={() => go(i)}
              className={cn(
                "absolute bottom-0 left-1/2 overflow-hidden rounded-2xl border-4 border-white/70 bg-wall-2",
                isActive ? "shadow-[0_24px_45px_-12px_rgba(60,25,5,0.65)]" : "shadow-[0_14px_28px_-12px_rgba(60,25,5,0.5)]",
                !reduced && "transition-transform duration-700 ease-[cubic-bezier(0.22,0.8,0.2,1)]",
              )}
              style={{
                width: CARD_W * unit,
                height: CARD_H * unit,
                zIndex: p.z,
                transform: `translateX(-50%) translate(${p.x * unit}px, ${p.y * unit}px) rotate(${p.rotate}deg) scale(${p.scale})`,
              }}
            >
              <Image src={src} alt="" fill sizes="(min-width: 1024px) 340px, 220px" priority draggable={false} className="pointer-events-none object-cover" />
              {/* Voile cuivre : fond les photos dans la palette du site ; plus léger sur la carte mise en avant. */}
              <span aria-hidden="true" className={cn("pointer-events-none absolute inset-0 bg-gradient-to-t from-[#7a3510] via-[#c76524] to-[#f0a24a] mix-blend-multiply transition-opacity duration-700", isActive ? "opacity-25" : "opacity-55")} />
              <span aria-hidden="true" className={cn("pointer-events-none absolute inset-0 bg-[#c76524] mix-blend-soft-light transition-opacity duration-700", isActive ? "opacity-20" : "opacity-40")} />
            </button>
          );
        })}

      </div>
    </div>
  );
}
