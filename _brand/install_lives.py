import json, re, shutil

# 1) test e2e : libellé exact
p = "tests/e2e/booking-flow.spec.ts"
s = open(p, encoding="utf-8").read()
s = s.replace('getByLabel("Ton numéro WhatsApp")', 'getByLabel("Ton numéro WhatsApp", { exact: true })')
open(p, "w", encoding="utf-8").write(s)

# 2) page /lives (brouillon nettoyé)
d = open("_brand/draft_lives_page.tsx", encoding="utf-8").read()
d = d.replace("import { getCountries, getPackages, getSetting, getStudioTimezone }", "import { getCountries, getPackages, getStudioTimezone }")
d = d.replace("  void getSetting;\n", "")
d = d.replace("              const span = { start: new Date(`${now.toISOString().slice(0, 10)}T00:00:00Z`) };\n              void span;\n", "")
open("src/app/[locale]/(public)/lives/page.tsx", "w", encoding="utf-8").write(d)

# 3) carte live : drapeau et pays
p = "src/components/lives/live-card.tsx"
s = open(p, encoding="utf-8").read()
s = s.replace('import { CategoryIcon } from "@/components/ui/category-icon";', 'import { CategoryIcon } from "@/components/ui/category-icon";\nimport { Flag } from "@/components/ui/flag";')
s = s.replace("  verified: boolean;\n};", "  verified: boolean;\n  country?: { code: string; name: string };\n};")
s = s.replace('''      {live.verified && (''', '''      {live.country && (
        <p className="flex items-center gap-2 text-sm font-bold"><Flag code={live.country.code} className="h-4 w-6 rounded-sm ring-1 ring-ink/30" /> {live.country.name}</p>
      )}
      {live.verified && (''')
open(p, "w", encoding="utf-8").write(s)

# 4) messages
fr = {"lives": {
    "title": "Lives en direct", "current": "Directs en cours", "currentSub": "Découvre les vendeurs actuellement en direct.", "noneNow": "Aucun live en cours pour le moment.",
    "byCountry": "Par pays", "programEyebrow": "Programme", "program": "Créneaux de diffusion du jour", "programSub": "les lives se soumettent et se valident pendant ces créneaux.", "zone": "Heure de Lomé (GMT)",
    "windowOpen": "En cours", "windowNext": "Prochain", "windowLater": "Plus tard",
    "cta": {"eyebrow": "Espace vendeurs", "title": "Tu as des produits à écouler ? Passe en direct !", "text": "Réserve ton studio à Lomé ou connecte-toi à distance : l'équipe gère la régie et la diffusion.", "button": "Réserver mon créneau live", "from": "Dès {price}", "subscribe": "S'abonner à l'annuaire"},
}}
en = {"lives": {
    "title": "Live now", "current": "Lives on air", "currentSub": "Discover the sellers who are live right now.", "noneNow": "No live right now.",
    "byCountry": "By country", "programEyebrow": "Schedule", "program": "Today's broadcast slots", "programSub": "lives are submitted and validated during these slots.", "zone": "Lomé time (GMT)",
    "windowOpen": "Open now", "windowNext": "Next", "windowLater": "Later",
    "cta": {"eyebrow": "Sellers area", "title": "Products to sell? Go live!", "text": "Book your studio in Lomé or connect remotely: the team handles production and broadcast.", "button": "Book my live slot", "from": "From {price}", "subscribe": "Subscribe to the directory"},
}}

def deep(a, b):
    for k, v in b.items():
        if isinstance(v, dict) and isinstance(a.get(k), dict):
            deep(a[k], v)
        else:
            a[k] = v

for lang, add in (("fr", fr), ("en", en)):
    path = f"src/messages/{lang}.json"
    data = json.load(open(path, encoding="utf-8"))
    deep(data, add)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
print("ok")
