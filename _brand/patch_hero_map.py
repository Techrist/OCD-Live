import re

# 1) Retire les pastilles « 01 · Découvrir » au-dessus des titres de section.
p = "src/components/home/sections.tsx"
s = open(p, encoding="utf-8").read()
s = s.replace('''function Heading({ n, eyebrow, title, subtitle, id }: { n: string; eyebrow: string; title: string; subtitle?: string; id: string }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-2 text-center">
      <p className="eyebrow"><b>{n}</b> {eyebrow}</p>
      <h2 id={id}>{title}</h2>''', '''function Heading({ title, subtitle, id }: { title: string; subtitle?: string; id: string }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-2 text-center">
      <h2 id={id}>{title}</h2>''')
s, n = re.subn(r' n="\d\d" eyebrow=\{[^}]*\}', "", s)
print("appels nettoyés :", n)
open(p, "w", encoding="utf-8").write(s)

# 2) La carte de l'Afrique en arrière-plan du héros.
p = "src/components/home/hero.tsx"
s = open(p, encoding="utf-8").read()
s = s.replace('import { ResumeBanner } from "@/components/booking/resume";', 'import { AfricaMap } from "@/components/brand/africa-map";\nimport { ResumeBanner } from "@/components/booking/resume";')
marker = '      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-5 px-5 text-center">'
assert marker in s
s = s.replace(marker, '''      {/* La carte de l'Afrique lumineuse du studio, en grand derrière le contenu. */}
      <AfricaMap
        fill="rgba(255,255,255,0.10)"
        stroke="#fbe3b5"
        className="pointer-events-none absolute top-16 left-1/2 w-[42rem] max-w-none -translate-x-1/2 opacity-70 sm:top-10 sm:w-[60rem]"
      />

''' + marker)
open(p, "w", encoding="utf-8").write(s)
print("ok")
