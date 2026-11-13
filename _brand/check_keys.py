import json, re, glob

def load(lang):
    return json.load(open(f"src/messages/{lang}.json", encoding="utf-8"))

def has(data, path):
    cur = data
    for part in path.split("."):
        if not isinstance(cur, dict) or part not in cur:
            return False
        cur = cur[part]
    return True

# (fichier, espace de noms par défaut) : on repère useTranslations("x") / getTranslations("x") puis t("clé")
missing = set()
for f in glob.glob("src/**/*.tsx", recursive=True):
    s = open(f, encoding="utf-8").read()
    names = {}
    for m in re.finditer(r"(?:const|let)\s+(\w+)\s*=\s*(?:await\s+)?(?:useTranslations|getTranslations)\(\s*(?:\"([^\"]*)\")?\s*\)", s):
        names[m.group(1)] = m.group(2) or ""
    for m in re.finditer(r"const\s+\[([^\]]+)\]\s*=\s*await Promise\.all\(\[([^\]]*)\]", s):
        pass
    for var, ns in names.items():
        for k in re.finditer(r"\b" + var + r"\(\s*\"([A-Za-z0-9_.]+)\"", s):
            key = (ns + "." if ns else "") + k.group(1)
            for lang in ("fr", "en"):
                if not has(load(lang), key):
                    missing.add((lang, key, f))
for m in sorted(missing):
    print(m)
print("manquantes:", len(missing))
