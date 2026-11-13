import json


def deep(a, b):
    for k, v in b.items():
        if isinstance(v, dict) and isinstance(a.get(k), dict):
            deep(a[k], v)
        else:
            a[k] = v


fr = {"home": {
    "heroTitle": "Ton business en live, vu partout en Afrique",
    "bar": {"studio": "Au studio à Lomé", "remote": "Depuis chez moi", "cta": "Réserver mon live"},
    "popular": {"eyebrow": "Découvrir", "title": "Catégories populaires", "subtitle": "Tout ce qui se vend en live.", "cta": "Voir les lives en direct"},
    "steps": {"eyebrow": "Étapes simples", "title": "Réserve en 3 étapes", "subtitle": "Un chemin clair, de l'idée au live."},
    "why": {"eyebrow": "Pourquoi nous", "subtitle": "Un service local, pensé pour les vendeurs africains."},
    "countriesBand": {"title": "Ouvert dans {count} pays d'Afrique"},
    "idea": {"studioEyebrow": "Le studio", "title": "Un vrai studio à Lomé"},
    "faq": {"eyebrow": "Réponses", "subtitle": "Tout ce qu'il faut savoir avant de réserver."},
}}
en = {"home": {
    "heroTitle": "Your business live, seen all over Africa",
    "bar": {"studio": "At the studio in Lomé", "remote": "From home", "cta": "Book my live"},
    "popular": {"eyebrow": "Discover", "title": "Popular categories", "subtitle": "Everything that sells live.", "cta": "See lives on air"},
    "steps": {"eyebrow": "Simple steps", "title": "Book in 3 steps", "subtitle": "A clear path from idea to live."},
    "why": {"eyebrow": "Why us", "subtitle": "A local service built for African sellers."},
    "countriesBand": {"title": "Open in {count} African countries"},
    "idea": {"studioEyebrow": "The studio", "title": "A real studio in Lomé"},
    "faq": {"eyebrow": "Answers", "subtitle": "Everything to know before booking."},
}}

for lang, add in (("fr", fr), ("en", en)):
    path = f"src/messages/{lang}.json"
    data = json.load(open(path, encoding="utf-8"))
    deep(data, add)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
print("ok")
