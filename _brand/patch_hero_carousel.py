import json

p = "src/components/home/hero.tsx"
s = open(p, encoding="utf-8").read()

# imports
s = s.replace('import { AfricaMap } from "@/components/brand/africa-map";\n', "")
s = s.replace('import Image from "next/image";\n', "")
s = s.replace('import { Link } from "@/i18n/navigation";', 'import { HeroCarousel } from "@/components/home/hero-carousel";\nimport { Link } from "@/i18n/navigation";')

# liste des portraits
a = s.index("// Cinq portraits")
b = s.index("/** Héros")
s = s[:a] + '// Cinq portraits de vendeurs (public/images/hero-1..5.webp, voir PROMPTS-IMAGES.md) : carrousel et fond du héros.\nconst PORTRAITS = [1, 2, 3, 4, 5].map((n) => `/images/hero-${n}.webp`);\n\n' + s[b:]

# section isolée, sans les anciens nuages ni la carte ; contenu au-dessus du fond
s = s.replace('className="relative overflow-hidden bg-[image:var(--hero)] pt-28 text-white md:rounded-b-none"', 'className="relative isolate overflow-hidden bg-[image:var(--hero)] pt-28 text-white"')
a = s.index("      {/* Nuages doux")
b = s.index('      <div className="relative mx-auto flex max-w-4xl')
s = s[:a] + s[b:]
s = s.replace('<div className="relative mx-auto flex max-w-4xl flex-col items-center gap-5 px-5 text-center">', '<div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-5 px-5 text-center">')

# l'éventail devient le carrousel
a = s.index("      {/* Éventail")
b = s.index("    </section>")
s = s[:a] + "      <HeroCarousel images={PORTRAITS} />\n" + s[b:]
open(p, "w", encoding="utf-8").write(s)

for lang, add in (
    ("fr", {"label": "Portraits de vendeurs", "prev": "Portrait précédent", "next": "Portrait suivant"}),
    ("en", {"label": "Seller portraits", "prev": "Previous portrait", "next": "Next portrait"}),
):
    path = f"src/messages/{lang}.json"
    d = json.load(open(path, encoding="utf-8"))
    d["home"]["carousel"] = add
    with open(path, "w", encoding="utf-8") as f:
        json.dump(d, f, ensure_ascii=False, indent=2)
        f.write("\n")
print("ok")
