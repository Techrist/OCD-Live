import json

p = "src/components/home/hero.tsx"
s = open(p, encoding="utf-8").read()
s = s.replace('import { ArrowRight, Building2, Home } from "lucide-react";', 'import { ArrowRight, Building2, Home } from "lucide-react";')
s = s.replace('import { ResumeBanner } from "@/components/booking/resume";', 'import { AfricaMap } from "@/components/brand/africa-map";\nimport { ResumeBanner } from "@/components/booking/resume";')
s = s.replace("carrousel et fond du héros.", "carrousel en arc de cercle.")
s = s.replace("et éventail de portraits.", "et carrousel en arc de portraits.")
s = s.replace(
    '<section aria-labelledby="hero" className="relative isolate overflow-hidden bg-[image:var(--hero)] pt-28 text-white">',
    '''{/* z-20 : le carrousel déborde sur la section blanche suivante, il doit passer au-dessus d'elle. */}
    <section aria-labelledby="hero" className="relative z-20 bg-[image:var(--hero)] pt-28 text-white">
      {/* Fond : formes en contour fin (la carte lumineuse du studio), discrètes, coupées par les bords. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <AfricaMap glow={false} fill="none" stroke="#fbe3b5" className="absolute -top-24 -right-40 w-[44rem] max-w-none rotate-12 opacity-30" />
        <AfricaMap glow={false} fill="none" stroke="#fbe3b5" className="absolute -bottom-40 -left-52 w-[38rem] max-w-none -rotate-12 opacity-20" />
      </div>
''',
)
open(p, "w", encoding="utf-8").write(s)

# La section suivante laisse la place aux cartes qui la chevauchent.
p = "src/components/home/sections.tsx"
s = open(p, encoding="utf-8").read()
old = 'className="band relative -mt-10 flex flex-col gap-8 rounded-t-[2.5rem] bg-white py-14 md:py-20"'
assert old in s
s = s.replace(old, 'className="band relative -mt-10 flex flex-col gap-8 rounded-t-[2.5rem] bg-white pt-28 pb-14 md:pt-36 md:pb-20"')
open(p, "w", encoding="utf-8").write(s)

for lang, card in (("fr", "Portrait {n} sur {total}"), ("en", "Portrait {n} of {total}")):
    path = f"src/messages/{lang}.json"
    d = json.load(open(path, encoding="utf-8"))
    d["home"]["carousel"]["card"] = card
    with open(path, "w", encoding="utf-8") as f:
        json.dump(d, f, ensure_ascii=False, indent=2)
        f.write("\n")
print("ok")
