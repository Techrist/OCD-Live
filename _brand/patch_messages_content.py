import json


def deep(a, b):
    for k, v in b.items():
        if isinstance(v, dict) and isinstance(a.get(k), dict):
            deep(a[k], v)
        else:
            a[k] = v


fr = {
    "nav": {"label": "Navigation principale"},
    "home": {
        "how": {
            "title": "Comment ça marche", "subtitle": "Trois étapes, sans mot de passe.",
            "s1": {"title": "Choisis", "text": "Au studio à Lomé, ou depuis chez toi avec une assistante."},
            "s2": {"title": "Réserve et paie", "text": "Un créneau, un paiement Mobile Money, en moins de 2 minutes."},
            "s3": {"title": "Passe en live", "text": "Ton produit, ton numéro et ton adresse à l'écran."},
        },
        "offers": {"title": "Nos offres", "subtitle": "Commence par un essai, passe à plus quand tu es prêt.", "cta": "Réserver mon live"},
        "who": {"title": "Pour tous les vendeurs", "subtitle": "Trouve ta catégorie : l'annuaire classe les lives par pays et par catégorie."},
        "why": {
            "title": "Pourquoi OCD Live",
            "marketing": {"title": "Le marketing avant la vente", "text": "Le live place d'abord ton produit, ton numéro et ton adresse devant le public de la chaîne TikTok House of Challenge."},
            "mobile": {"title": "Pensé pour ton téléphone", "text": "Mobile Money, WhatsApp et un site léger, même avec une connexion faible."},
            "support": {"title": "Tu n'es pas seul", "text": "Une assistante t'accompagne pendant ton live à distance."},
            "trust": {"title": "Des vendeurs de confiance", "text": "Une charte, des vendeurs vérifiés et un signalement simple pour garder un annuaire sûr."},
        },
        "faq": {
            "title": "Questions fréquentes",
            "price": {"q": "Combien coûte un live ?", "a": "Un live d'essai de {duration} coûte {price}. Les autres offres sont sur la page de réservation."},
            "pay": {"q": "Comment payer ?", "a": "Par Mobile Money (Orange Money, MTN MoMo, Moov Money, T-Money, Wave) ou par carte, selon ton pays."},
            "cancel": {"q": "Puis-je annuler ou reporter ?", "a": "Le report est gratuit jusqu'à {hours} h avant ton live. Une annulation plus tard n'est pas remboursée."},
            "remote": {"q": "Dois-je venir à Lomé ?", "a": "Non. Tu peux faire ton live depuis chez toi : une assistante t'accompagne."},
            "directory": {"q": "Comment apparaître dans l'annuaire ?", "a": "Abonne-toi ({sub} pour 30 jours), puis envoie le lien de ton live pendant les créneaux de validation."},
        },
        "cta": {"title": "Prêt à passer en live ?", "subtitle": "Réserve en moins de 2 minutes.", "book": "Réserver mon live", "advisor": "Parler à un conseiller"},
    },
    "legal": {"about": {
        "principleTitle": "Notre principe : le marketing avant la vente",
        "principleText": "Avant de vendre, il faut être vu. Le live sert d'abord à placer ton produit, ton numéro et ton adresse sous les yeux du public, pour que les clients te contactent directement.",
        "offerTitle": "Ce qu'on fait pour toi",
        "offer": {
            "studio": {"title": "Un studio à Lomé", "text": "Tu viens avec tes produits : l'équipe s'occupe de la régie et de la diffusion."},
            "remote": {"title": "Live à distance", "text": "Tu restes chez toi, une assistante t'accompagne pendant ton live."},
            "payment": {"title": "Réservation simple", "text": "Un créneau, un paiement Mobile Money, un reçu envoyé sur WhatsApp."},
            "directory": {"title": "Annuaire des lives", "text": "Abonné, tu apparais dans ton pays et ta catégorie quand tu es en direct."},
        },
        "studioTitle": "Le studio de Lomé", "studioText": "C'est ici que les lives en présentiel sont diffusés, sur le compte TikTok House of Challenge.",
        "studioPlace": "Lomé, Togo", "studioHours": "De {from} à {to} (heure de Lomé)", "studioClosed": "Fermé : {days}",
        "commitTitle": "Nos engagements",
        "commit": {
            "real": {"title": "De vrais produits", "text": "Chaque vendeur présente des produits réels. Les produits interdits sont refusés."},
            "contact": {"title": "Un vrai contact", "text": "Ton numéro et ton adresse sont affichés : les clients savent où te trouver."},
            "respect": {"title": "Le respect des clients", "text": "On répond, on livre, on reste honnête. Les abus sont signalés et traités."},
        },
        "commitLink": "Lire les conditions et la charte", "whoTitle": "Qui est derrière OCD Live ?",
        "contactTitle": "Une question ? On te répond sur WhatsApp.", "contactText": "Réponse rapide d'un conseiller.", "contactBook": "Réserver un live",
    }},
}

en = {
    "nav": {"label": "Main navigation"},
    "home": {
        "how": {
            "title": "How it works", "subtitle": "Three steps, no password.",
            "s1": {"title": "Choose", "text": "At the studio in Lomé, or from home with an assistant."},
            "s2": {"title": "Book and pay", "text": "One slot, one Mobile Money payment, in under 2 minutes."},
            "s3": {"title": "Go live", "text": "Your product, your number and your address on screen."},
        },
        "offers": {"title": "Our offers", "subtitle": "Start with a trial, move up when you are ready.", "cta": "Book my live"},
        "who": {"title": "For every seller", "subtitle": "Find your category: the directory sorts lives by country and category."},
        "why": {
            "title": "Why OCD Live",
            "marketing": {"title": "Marketing before selling", "text": "The live first puts your product, your number and your address in front of the House of Challenge TikTok audience."},
            "mobile": {"title": "Built for your phone", "text": "Mobile Money, WhatsApp and a light site, even on a weak connection."},
            "support": {"title": "You are not alone", "text": "An assistant supports you during your remote live."},
            "trust": {"title": "Sellers you can trust", "text": "A charter, verified sellers and simple reporting keep the directory safe."},
        },
        "faq": {
            "title": "Frequently asked questions",
            "price": {"q": "How much does a live cost?", "a": "A {duration} trial live costs {price}. Other offers are on the booking page."},
            "pay": {"q": "How do I pay?", "a": "By Mobile Money (Orange Money, MTN MoMo, Moov Money, T-Money, Wave) or card, depending on your country."},
            "cancel": {"q": "Can I cancel or reschedule?", "a": "Rescheduling is free up to {hours} h before your live. A later cancellation is not refunded."},
            "remote": {"q": "Do I have to come to Lomé?", "a": "No. You can go live from home: an assistant supports you."},
            "directory": {"q": "How do I appear in the directory?", "a": "Subscribe ({sub} for 30 days), then send your live link during the validation slots."},
        },
        "cta": {"title": "Ready to go live?", "subtitle": "Book in under 2 minutes.", "book": "Book my live", "advisor": "Talk to an advisor"},
    },
    "legal": {"about": {
        "principleTitle": "Our principle: marketing before selling",
        "principleText": "Before you sell, you need to be seen. The live first places your product, your number and your address in front of the audience, so customers contact you directly.",
        "offerTitle": "What we do for you",
        "offer": {
            "studio": {"title": "A studio in Lomé", "text": "You bring your products: the team handles the production and broadcast."},
            "remote": {"title": "Remote live", "text": "You stay at home, an assistant supports you during your live."},
            "payment": {"title": "Simple booking", "text": "One slot, one Mobile Money payment, a receipt sent on WhatsApp."},
            "directory": {"title": "Live directory", "text": "As a subscriber, you appear in your country and category while you are live."},
        },
        "studioTitle": "The Lomé studio", "studioText": "This is where in-person lives are broadcast, on the House of Challenge TikTok account.",
        "studioPlace": "Lomé, Togo", "studioHours": "From {from} to {to} (Lomé time)", "studioClosed": "Closed: {days}",
        "commitTitle": "Our commitments",
        "commit": {
            "real": {"title": "Real products", "text": "Every seller presents real products. Prohibited products are refused."},
            "contact": {"title": "A real contact", "text": "Your number and address are shown: customers know where to find you."},
            "respect": {"title": "Respect for customers", "text": "We answer, we deliver, we stay honest. Abuse is reported and handled."},
        },
        "commitLink": "Read the terms and charter", "whoTitle": "Who is behind OCD Live?",
        "contactTitle": "A question? We answer on WhatsApp.", "contactText": "Quick reply from an advisor.", "contactBook": "Book a live",
    }},
}

for lang, add in (("fr", fr), ("en", en)):
    path = f"src/messages/{lang}.json"
    data = json.load(open(path, encoding="utf-8"))
    deep(data, add)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
print("ok")
