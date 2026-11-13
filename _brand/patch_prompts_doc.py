p = "PROMPTS-IMAGES.md"
s = open(p, encoding="utf-8").read()
note = '''## État des images

**Déjà en place** (importées depuis tes images, recadrées par `_brand/import_photos.py`, originaux dans `_brand/originals/`) :
`hero-1` à `hero-5`, `cat-nourriture`, `cat-mode`, `cat-chaussures-sacs`, `cat-beaute-cheveux`, `cat-telephones-electronique`, `cat-maison`, `cat-services`.

**Encore provisoires (dégradés)** : `cat-autre`, `step-1`, `step-2`, `step-3`, `why-1`, `why-2`, `studio`.
Les prompts ci-dessous restent valables pour celles-là (et pour remplacer les autres si besoin).

'''
i = s.index("## Bloc de style")
s = s[:i] + note + s[i:]
open(p, "w", encoding="utf-8").write(s)
print("ok")
