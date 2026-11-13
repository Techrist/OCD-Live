p = "src/components/home/hero.tsx"
s = open(p, encoding="utf-8").read()
s = s.replace("    {/* z-20 : le carrousel déborde sur la section blanche suivante, il doit passer au-dessus d'elle. */}\n", "")
s = s.replace('<section aria-labelledby="hero" className="relative z-20 bg-[image:var(--hero)] pt-28 text-white">', '<section aria-labelledby="hero" className="relative z-20 bg-[image:var(--hero)] pt-28 text-white"> {/* z-20 : le carrousel déborde sur la section blanche suivante */}')
open(p, "w", encoding="utf-8").write(s)

p = "src/components/home/hero-carousel.tsx"
s = open(p, encoding="utf-8").read()
s = s.replace('import { useEffect, useRef, useState } from "react";', 'import { useEffect, useRef, useState, useSyncExternalStore } from "react";')
s = s.replace("function place(d: number) {", '''const REDUCED = "(prefers-reduced-motion: reduce)";
function subscribeReduced(cb: () => void) {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const nowMs = () => Date.now();

function place(d: number) {''', 1)
s = s.replace("  const [reduced, setReduced] = useState(false);\n", "  const reduced = useSyncExternalStore(subscribeReduced, () => window.matchMedia(REDUCED).matches, () => false);\n")
s = s.replace('''  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

''', "")
s = s.replace("pausedUntil.current = Date.now() + 8000;", "pausedUntil.current = nowMs() + 8000;")
s = s.replace("if (Date.now() >= pausedUntil.current) setActive", "if (nowMs() >= pausedUntil.current) setActive")
open(p, "w", encoding="utf-8").write(s)
print("ok")
