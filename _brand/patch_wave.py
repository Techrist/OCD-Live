p = "src/app/globals.css"
s = open(p, encoding="utf-8").read()
a = s.index("/* Bande ondulée")
s = s[:a] + '''/* Bande ondulée ambre : bords en vagues (festons de la couleur de la page qui mordent la bande). */
.wave-band {
  position: relative;
  background: linear-gradient(180deg, #fbe3b5, #f6cf86);
}
.wave-band::before,
.wave-band::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  height: 14px;
  background: radial-gradient(circle at 14px 0, #fdeccf 13px, transparent 14px) repeat-x;
  background-size: 28px 14px;
}
.wave-band::before {
  top: 0;
}
.wave-band::after {
  bottom: 0;
  transform: scaleY(-1);
}
'''
open(p, "w", encoding="utf-8").write(s)

p = "src/components/home/hero.tsx"
s = open(p, encoding="utf-8").read()
s = s.replace("mt-10 flex h-56 max-w-3xl items-end justify-center gap-2 px-5 sm:h-80 sm:gap-3", "mt-10 flex h-44 max-w-3xl items-end justify-center gap-2 px-5 sm:h-60 sm:gap-3")
open(p, "w", encoding="utf-8").write(s)

p = "src/components/top-nav.tsx"
s = open(p, encoding="utf-8").read()
s = s.replace('<ul className="nav-float flex items-center gap-1 rounded-full p-1.5">', '<ul className="nav-float flex items-center gap-1 rounded-full p-1.5 text-ink">')
open(p, "w", encoding="utf-8").write(s)
print("ok")
