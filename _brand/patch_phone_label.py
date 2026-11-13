import json
for lang, val in (("fr", "Ton numéro WhatsApp"), ("en", "Your WhatsApp number")):
    p = f"src/messages/{lang}.json"
    d = json.load(open(p, encoding="utf-8"))
    d["booking"]["seller"]["phoneLabel"] = val
    json.dump(d, open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    open(p, "a", encoding="utf-8").write("\n")
print("ok")
