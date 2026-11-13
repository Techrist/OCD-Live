p = "src/components/home/hero-carousel.tsx"
s = open(p, encoding="utf-8").read()

# flèches de navigation retirées (clic sur une carte, balayage et clavier restent)
a = s.index('        <button type="button" onClick={() => go(active - 1)} aria-label={t("prev")}')
b = s.index("      </div>\n    </div>\n  );")
s = s[:a] + s[b:]
s = s.replace('import { ChevronLeft, ChevronRight } from "lucide-react";\n', "")

# l'arc occupe toute la largeur du conteneur : l'unité de taille suit la largeur disponible
s = s.replace("const update = () => setUnit(Math.min(1, el.clientWidth / 560));", "const update = () => setUnit(Math.min(2.1, Math.max(0.58, el.clientWidth / 620)));")
s = s.replace('className="relative mx-auto w-full max-w-3xl touch-pan-y select-none"', 'className="relative mx-auto w-full max-w-6xl touch-pan-y select-none"')
s = s.replace('className="relative z-10 mt-10 -mb-14 w-full sm:-mb-16"', 'className="relative z-10 mt-10 -mb-14 w-full px-5 sm:-mb-20"')
open(p, "w", encoding="utf-8").write(s)
print("ok")
