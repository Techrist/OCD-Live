import json

add = {
    "fr": {"liveBadge": "En direct", "figures": "En bref", "productsCount": "produits en ligne", "category": "Catégorie", "status": "Statut",
           "about": "À propos de la boutique", "productsSub": "Les produits de {shop}, à commander sur WhatsApp.", "allShop": "Voir tout OCD Shop",
           "noProducts": "Cette boutique n'a pas encore mis de produits en ligne. Écris-lui sur WhatsApp pour connaître son catalogue.",
           "contactTitle": "Une question pour {shop} ?", "contactText": "Écris directement au vendeur : produits, prix, livraison."},
    "en": {"liveBadge": "Live", "figures": "At a glance", "productsCount": "products online", "category": "Category", "status": "Status",
           "about": "About the shop", "productsSub": "{shop}'s products, to order on WhatsApp.", "allShop": "See all of OCD Shop",
           "noProducts": "This shop hasn't put products online yet. Message them on WhatsApp to see their catalogue.",
           "contactTitle": "A question for {shop}?", "contactText": "Message the seller directly: products, prices, delivery."},
}
for lang, d in add.items():
    p = f"src/messages/{lang}.json"
    j = json.load(open(p, encoding="utf-8"))
    j["showcase"].update(d)
    open(p, "w", encoding="utf-8").write(json.dumps(j, ensure_ascii=False, indent=2) + "\n")
print("ok")
