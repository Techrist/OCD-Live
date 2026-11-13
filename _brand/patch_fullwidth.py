import re


def edit(path, pairs):
    s = open(path, encoding="utf-8").read()
    for a, b in pairs:
        if a not in s:
            print("MISSING in", path, ":", a[:80])
        s = s.replace(a, b)
    open(path, "w", encoding="utf-8").write(s)


# --- CSS : « band » = section pleine largeur dont le contenu est centré (72 rem max) -------------------------
edit("src/app/globals.css", [
    ("/* Feuille blanche des sections de l'accueil. */\n.sheet {\n  background: #fff;\n  border-radius: 2.5rem;\n  box-shadow: var(--shadow-soft);\n}",
     "/* Section pleine largeur : le fond va jusqu'aux bords, le contenu reste centré (72 rem max). */\n.band {\n  padding-inline: max(1.25rem, calc((100% - 72rem) / 2));\n}\n.sheet {\n  background: #fff;\n}"),
])

# --- Accueil : sections sans cadre ------------------------------------------------------------------------
S = "src/components/home/sections.tsx"
edit(S, [
    ('className="sheet -mt-10 flex flex-col gap-8 px-5 py-12 md:px-10"', 'className="band relative -mt-10 flex flex-col gap-8 rounded-t-[2.5rem] bg-white py-14 md:py-20"'),
    # étapes : fond crème
    ('<section aria-labelledby="steps" className="sheet flex flex-col gap-8 px-5 py-12 md:px-10">', '<section aria-labelledby="steps" className="band flex flex-col gap-8 bg-[#fffaf2] py-14 md:py-20">'),
    ('<section aria-labelledby="why" className="sheet flex flex-col gap-8 px-5 py-12 md:px-10">', '<section aria-labelledby="why" className="band flex flex-col gap-8 bg-white py-14 md:py-20">'),
    ('className="wave-band -mx-0 flex flex-col items-center gap-4 px-5 py-14"', 'className="wave-band band flex flex-col items-center gap-4 py-16"'),
    ('<section aria-labelledby="offers" className="sheet flex flex-col gap-8 px-5 py-12 md:px-10">', '<section aria-labelledby="offers" className="band flex flex-col gap-8 bg-white py-14 md:py-20">'),
    ('<section aria-labelledby="studio" className="sheet flex flex-col gap-8 px-5 py-12 md:px-10">', '<section aria-labelledby="studio" className="band flex flex-col gap-8 bg-[#fffaf2] py-14 md:py-20">'),
    ('<section aria-labelledby="faq" className="sheet flex flex-col gap-6 px-5 py-12 md:px-10">', '<section aria-labelledby="faq" className="band flex flex-col gap-6 bg-white py-14 md:py-20">'),
    ('className="mx-auto flex w-full flex-col items-center gap-5 rounded-[2.5rem] bg-[image:var(--hero)] px-5 py-14 text-center text-white"', 'className="band flex w-full flex-col items-center gap-5 bg-[image:var(--hero)] py-20 text-center text-white"'),
    # l'offre en avant : plus de cadre autour de la grille, cartes d'offre gardées (ce sont des contenus)
])

H = "src/app/[locale]/(public)/page.tsx"
s = open(H, encoding="utf-8").read()
s = s.replace('''      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-3 pb-6 md:gap-8 md:px-5">
        <Popular />
        <Steps />
        <Why />
      </div>
      <CountriesBand />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-3 pt-8 md:gap-8 md:px-5">
        <Offers />
        <StudioLive />
        <Faq />
        <FinalCta />
      </div>''', '''      <Popular />
      <Steps />
      <Why />
      <CountriesBand />
      <Offers />
      <StudioLive />
      <Faq />
      <FinalCta />''')
open(H, "w", encoding="utf-8").write(s)

# --- À propos : bandes pleine largeur -------------------------------------------------------------------
A = "src/app/[locale]/(public)/a-propos/page.tsx"
s = open(A, encoding="utf-8").read()
s = s.replace('<div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-5 pt-2 md:gap-16">', '<div className="flex w-full flex-col">')
s = s.replace('<section className="grid items-center gap-6 md:grid-cols-[1.2fr_1fr]">', '<section className="band grid items-center gap-6 py-10 md:grid-cols-[1.2fr_1fr] md:py-16">')
s = s.replace('className="rounded-[2.5rem] bg-[image:var(--hero)] p-6 text-white md:p-8"', 'className="band bg-[image:var(--hero)] py-14 text-white md:py-16"')
s = s.replace('<section aria-labelledby="offer" className="flex flex-col gap-4">', '<section aria-labelledby="offer" className="band flex flex-col gap-4 bg-white py-14 md:py-16">')
s = s.replace('className="sheet flex flex-col gap-4 p-6 md:p-8"', 'className="band flex flex-col gap-4 bg-[#fffaf2] py-14 md:py-16"')
s = s.replace('<section aria-labelledby="commit" className="flex flex-col gap-4">', '<section aria-labelledby="commit" className="band flex flex-col gap-4 bg-white py-14 md:py-16">')
s = s.replace('className="sheet p-6 md:p-8"', 'className="band bg-[#fffaf2] py-14 md:py-16"')
s = s.replace('className="flex flex-col items-start gap-4 rounded-[2.5rem] bg-[image:var(--hero)] p-6 text-white md:flex-row md:items-center md:justify-between"', 'className="band flex flex-col items-start gap-4 bg-[image:var(--hero)] py-14 text-white md:flex-row md:items-center md:justify-between"')
open(A, "w", encoding="utf-8").write(s)

# --- Lives : bandes pleine largeur -------------------------------------------------------------------------
L = "src/app/[locale]/(public)/lives/page.tsx"
s = open(L, encoding="utf-8").read()
s = s.replace('<div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-5 pt-2 md:gap-16">', '<div className="flex w-full flex-col">')
s = s.replace('<header className="flex flex-col gap-2">', '<header className="band flex flex-col gap-2 py-10 md:py-14">')
s = s.replace('<section aria-labelledby="current" className="flex flex-col gap-4">', '<section aria-labelledby="current" className="band flex flex-col gap-4 bg-white py-12 md:py-16">')
s = s.replace('<section aria-labelledby="countries" className="flex flex-col gap-4">', '<section aria-labelledby="countries" className="band flex flex-col gap-4 bg-[#fffaf2] py-12 md:py-16">')
s = s.replace('className="soft flex flex-col gap-4 rounded-[2.5rem] p-6 md:p-8"', 'className="band flex flex-col gap-4 bg-white py-12 md:py-16"')
s = s.replace('className="grad-btn -mx-5 flex flex-col gap-4 px-5 py-10 md:mx-0 md:rounded-[2.5rem] md:px-10"', 'className="band flex flex-col gap-4 bg-[image:var(--hero)] py-14 text-white"')
open(L, "w", encoding="utf-8").write(s)

# --- Pages légales : texte pleine largeur, sans boîte -------------------------------------------------------
G = "src/components/legal-page.tsx"
s = open(G, encoding="utf-8").read()
s = s.replace('<article className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-5 pt-2">', '<article className="band flex w-full flex-col gap-6 bg-white py-12 md:py-16">')
s = s.replace('<div className="soft flex flex-col gap-3 rounded-[2rem] p-6">', '<div className="flex max-w-3xl flex-col gap-5">')
open(G, "w", encoding="utf-8").write(s)
print("ok")
