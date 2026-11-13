import json


def deep(a, b):
    for k, v in b.items():
        if isinstance(v, dict) and isinstance(a.get(k), dict):
            deep(a[k], v)
        else:
            a[k] = v


fr = {
    "nav": {"cta": "Réserver mon live"},
    "audio": {"short": "Écouter"},
    "footer": {"initiative": "OCD Live, une initiative Bovan Group, Lomé, Togo", "tiktok": "TikTok : @houseofchallenge", "contact": "Contact WhatsApp", "nav": "Pied de page"},
    "home": {
        "launch": "Lancement le 1er décembre 2026",
        "lead": "Ton produit, ton numéro, ton adresse : vus par le public de House of Challenge.",
        "trust1": "Paiement Mobile Money", "trust2": "Assistance WhatsApp",
        "ticker": {"title": "En direct maintenant", "count": "{count} en live", "all": "Voir tous les lives"},
        "how": {
            "eyebrow": "Simplicité commerciale",
            "s1": {"title": "Choisis ton jour", "text": "Sélectionne le créneau de 1h30 idéal pour présenter tes produits."},
            "s2": {"title": "Paie par Mobile Money", "text": "Orange Money, MTN MoMo, Moov Money, T-Money ou Wave, selon ton pays."},
        },
        "offers": {"eyebrow": "Tarifs clairs et accessibles"},
        "idea": {
            "eyebrow": "Une idée de M. Bovan", "title": "Le live, c'est d'abord du marketing",
            "text": "Avant de vendre, il faut être vu. Le live sert d'abord à placer ton produit, ton numéro et ton adresse devant le public, pour que les clients te contactent directement.",
            "tiktok": "Voir House of Challenge sur TikTok",
            "mobile": {"title": "Pensé pour ton téléphone", "text": "Mobile Money, WhatsApp et un site léger, même avec une connexion faible."},
            "trust": {"title": "Des vendeurs de confiance", "text": "Une charte, des vendeurs vérifiés et un signalement simple."},
        },
        "cta": {"title": "Ta boutique mérite d'être vue.", "trust1": "Paiement sécurisé", "trust2": "Assistance WhatsApp", "trust3": "Studio basé à Lomé"},
    },
    "booking": {
        "eyebrow": "Réservation", "stepOf": "Étape {current} sur {total}",
        "steps": {"label": "Étapes de la réservation", "mode": "Mode", "vendeur": "Vendeur", "package": "Offre", "creneau": "Date", "paiement": "Paiement", "done": "Validé", "current": "En cours", "upcoming": "À venir"},
        "mode": {
            "label": "Mode de live",
            "studio": {"title": "Au studio à Lomé", "text": "Notre régie prépare et diffuse ton live.", "tag1": "Régie sur place", "tag2": "Un vendeur par créneau"},
            "remote": {"title": "Depuis chez moi", "text": "Une assistante t'accompagne en direct, à distance.", "tag1": "Partout en Afrique", "tag2": "Test réseau 15 min avant"},
            "tip": "Tu hésites ? Tu pourras modifier ton choix avant de payer.", "continue": "Continuer", "secure": "Paiement Mobile Money sécurisé", "assist": "Assistance WhatsApp",
        },
        "seller": {
            "eyebrow": "Profil commercial", "title": "Qu'est-ce que tu vends ?", "audio": "Choisis ta catégorie, écris tes coordonnées, puis entre le code reçu sur WhatsApp.",
            "selected": "1 sélectionnée", "coordTitle": "Coordonnées professionnelles", "nameLabel": "Ton nom complet", "countryLabel": "Ton pays", "countryPlaceholder": "Choisis ton pays",
            "cityLabel": "Ta ville (facultatif)", "codeInfo": "On t'envoie un code sécurisé par WhatsApp pour vérifier ton numéro.", "getCode": "Recevoir mon code",
            "panelBadge": "Vérification WhatsApp", "panelTitle": "Vérifie ton numéro WhatsApp", "panelWaiting": "Remplis le formulaire, puis demande ton code : il arrive en quelques secondes.",
            "editNumber": "Modifier le numéro", "codeTitle": "Entre ton code à 6 chiffres", "verify": "Valider mon code et continuer", "noMessage": "Tu n'as pas reçu le message ?", "resend": "Renvoyer le code",
            "privacy": "Ton numéro sert uniquement à t'envoyer ton reçu, tes rappels et à organiser ton live.",
        },
        "package": {
            "eyebrow": "Réservation", "custom": "Sur mesure", "duration": "Durée : {duration}", "chooseNamed": "Choisir {name}",
            "guaranteeTitle": "Diffusion et paiement simples", "guaranteeText": "Toutes les offres incluent la diffusion sur le compte TikTok House of Challenge. Tu paies par Mobile Money ou par carte, selon ton pays.",
        },
        "slot": {
            "eyebrow": "Réservation studio et distance", "subtitle": "Choisis le jour, puis l'heure qui te convient.", "realtime": "Créneaux ouverts en temps réel",
            "closedShort": "Fermé", "freeShort": "{count, plural, one {# créneau} other {# créneaux}}", "fullShort": "Complet",
            "legendFree": "Créneaux libres", "legendSelected": "Jour choisi", "legendClosed": "Fermé ou complet",
            "slotsTitle": "Créneaux horaires", "slotCount": "{count, plural, one {# créneau} other {# créneaux}}", "places": "{count, plural, one {# place} other {# places}}",
            "zones": "Heures dans ton pays", "zoneLome": "Lomé (GMT)", "zoneYou": "Chez toi ({country})", "zoneNote": "L'équipe se connecte 15 minutes avant le début.",
            "chosen": "Créneau retenu", "toPayment": "Continuer vers le paiement", "noteHold": "Créneau bloqué 10 minutes pendant le paiement.", "noteChange": "Report gratuit jusqu'à 48 h avant le live.",
        },
        "payment": {
            "pageTitle": "Finalise ta réservation", "eyebrow": "Réservation", "title": "Comment veux-tu payer ?", "subtitle": "Paiement direct et sécurisé par Mobile Money ou carte bancaire.",
            "locked": "Créneau verrouillé pour", "lockedText": "Ton créneau du {date} est bloqué pendant que tu paies.", "guaranteed": "Place garantie",
            "order": "Ta commande", "seller": "Boutique", "fees": "Frais supplémentaires", "feesFree": "Aucun", "totalNet": "Total net à régler",
            "freeChange": "Report sans frais possible jusqu'à 48 h avant le début du live.", "phoneFor": "Numéro qui paie avec {method}",
            "phoneNote": "Tu recevras la demande de confirmation sur ce numéro.", "trust1": "Paiement sécurisé", "trust2": "Aucune donnée de carte stockée", "loading": "Chargement…",
        },
        "confirmation": {
            "badge": "Réservation confirmée et garantie", "congrats": "Félicitations {name} !", "scheduled": "Ton direct est officiellement programmé.",
            "summary": "Ton paiement de {amount} a été validé. Ton reçu est disponible ci-dessous et part aussi sur WhatsApp au {phone}.",
            "passTitle": "Pass officiel de diffusion", "confirmed": "Confirmé et réglé", "slotReserved": "Créneau de diffusion réservé", "studioTime": "Studio Lomé (GMT)", "yourTime": "Chez toi",
            "modeLabel": "Mode", "modeOnsite": "Au studio à Lomé", "modeRemote": "À distance",
            "nextTitle": "Ce qui va se passer maintenant", "nextCount": "3 étapes simples",
            "n1": {"title": "Message WhatsApp de confirmation", "text": "Tu reçois ta confirmation, puis des rappels la veille et 1 heure avant."},
            "n2Onsite": {"title": "Arrivée au studio", "text": "Présente le QR code de ton reçu à la régie à ton arrivée."},
            "n2Remote": {"title": "Test de connexion", "text": "15 minutes avant, l'assistante teste ta connexion et ton cadrage."},
            "n3": {"title": "Ton live en direct", "text": "Ton produit, ton numéro et ton adresse passent à l'écran sur House of Challenge."},
            "kitTitle": "Checklist de préparation", "kitIntro": "Prépare ces quatre points pour un live réussi.",
            "kit": {
                "light": {"title": "Une bonne lumière", "text": "Place-toi face à une fenêtre ou une lampe."},
                "network": {"title": "Un bon réseau", "text": "Branche ton téléphone et teste ta connexion."},
                "products": {"title": "Tes produits prêts", "text": "Sélectionne 10 à 15 articles et colle les prix bien visibles."},
                "number": {"title": "Ton numéro affiché", "text": "Prépare ton numéro WhatsApp à montrer à l'écran."},
            },
            "helpTitle": "Une question sur ta réservation ?", "helpText": "Un conseiller te répond sur WhatsApp.", "helpCta": "Parler à un conseiller",
            "helpMessage": "Bonjour OCD Live, j'ai une question sur ma réservation {reference}.", "another": "Programmer un autre live",
            "shareTitle": "Prépare ton audience dès aujourd'hui", "shareText": "Partage ta réservation sur WhatsApp pour prévenir tes clients.",
        },
    },
}

en = {
    "nav": {"cta": "Book my live"},
    "audio": {"short": "Listen"},
    "footer": {"initiative": "OCD Live, an initiative of Bovan Group, Lomé, Togo", "tiktok": "TikTok: @houseofchallenge", "contact": "WhatsApp contact", "nav": "Footer"},
    "home": {
        "launch": "Launching on 1 December 2026",
        "lead": "Your product, your number, your address: seen by the House of Challenge audience.",
        "trust1": "Mobile Money payment", "trust2": "WhatsApp support",
        "ticker": {"title": "Live now", "count": "{count} live", "all": "See all lives"},
        "how": {
            "eyebrow": "Business made simple",
            "s1": {"title": "Pick your day", "text": "Choose the 1h30 slot that suits you to present your products."},
            "s2": {"title": "Pay with Mobile Money", "text": "Orange Money, MTN MoMo, Moov Money, T-Money or Wave, depending on your country."},
        },
        "offers": {"eyebrow": "Clear, affordable pricing"},
        "idea": {
            "eyebrow": "An idea from Mr Bovan", "title": "A live is first of all marketing",
            "text": "Before you sell, you need to be seen. The live first places your product, your number and your address in front of the audience, so customers contact you directly.",
            "tiktok": "See House of Challenge on TikTok",
            "mobile": {"title": "Built for your phone", "text": "Mobile Money, WhatsApp and a light site, even on a weak connection."},
            "trust": {"title": "Sellers you can trust", "text": "A charter, verified sellers and simple reporting."},
        },
        "cta": {"title": "Your shop deserves to be seen.", "trust1": "Secure payment", "trust2": "WhatsApp support", "trust3": "Studio based in Lomé"},
    },
    "booking": {
        "eyebrow": "Booking", "stepOf": "Step {current} of {total}",
        "steps": {"label": "Booking steps", "mode": "Mode", "vendeur": "Seller", "package": "Offer", "creneau": "Date", "paiement": "Payment", "done": "Done", "current": "In progress", "upcoming": "Upcoming"},
        "mode": {
            "label": "Live mode",
            "studio": {"title": "At the studio in Lomé", "text": "Our crew prepares and broadcasts your live.", "tag1": "Crew on site", "tag2": "One seller per slot"},
            "remote": {"title": "From home", "text": "An assistant supports you live, remotely.", "tag1": "Anywhere in Africa", "tag2": "Network test 15 min before"},
            "tip": "Not sure? You can change your choice before paying.", "continue": "Continue", "secure": "Secure Mobile Money payment", "assist": "WhatsApp support",
        },
        "seller": {
            "eyebrow": "Business profile", "title": "What do you sell?", "audio": "Choose your category, write your details, then enter the code you received on WhatsApp.",
            "selected": "1 selected", "coordTitle": "Business details", "nameLabel": "Your full name", "countryLabel": "Your country", "countryPlaceholder": "Choose your country",
            "cityLabel": "Your city (optional)", "codeInfo": "We send you a secure code on WhatsApp to verify your number.", "getCode": "Get my code",
            "panelBadge": "WhatsApp verification", "panelTitle": "Verify your WhatsApp number", "panelWaiting": "Fill in the form, then ask for your code: it arrives within seconds.",
            "editNumber": "Change number", "codeTitle": "Enter your 6-digit code", "verify": "Confirm my code and continue", "noMessage": "Did not get the message?", "resend": "Send the code again",
            "privacy": "Your number is only used to send your receipt, your reminders and to organise your live.",
        },
        "package": {
            "eyebrow": "Booking", "custom": "Custom", "duration": "Duration: {duration}", "chooseNamed": "Choose {name}",
            "guaranteeTitle": "Simple broadcast and payment", "guaranteeText": "Every offer includes broadcast on the House of Challenge TikTok account. You pay by Mobile Money or card, depending on your country.",
        },
        "slot": {
            "eyebrow": "Studio and remote booking", "subtitle": "Choose the day, then the time that suits you.", "realtime": "Slots open in real time",
            "closedShort": "Closed", "freeShort": "{count, plural, one {# slot} other {# slots}}", "fullShort": "Full",
            "legendFree": "Free slots", "legendSelected": "Chosen day", "legendClosed": "Closed or full",
            "slotsTitle": "Time slots", "slotCount": "{count, plural, one {# slot} other {# slots}}", "places": "{count, plural, one {# spot} other {# spots}}",
            "zones": "Times in your country", "zoneLome": "Lomé (GMT)", "zoneYou": "Your time ({country})", "zoneNote": "The team connects 15 minutes before the start.",
            "chosen": "Chosen slot", "toPayment": "Continue to payment", "noteHold": "Slot held for 10 minutes while you pay.", "noteChange": "Free rescheduling up to 48 h before the live.",
        },
        "payment": {
            "pageTitle": "Complete your booking", "eyebrow": "Booking", "title": "How do you want to pay?", "subtitle": "Direct, secure payment by Mobile Money or bank card.",
            "locked": "Slot locked for", "lockedText": "Your {date} slot is held while you pay.", "guaranteed": "Spot guaranteed",
            "order": "Your order", "seller": "Shop", "fees": "Extra fees", "feesFree": "None", "totalNet": "Total to pay",
            "freeChange": "Free rescheduling up to 48 h before the live starts.", "phoneFor": "Number paying with {method}",
            "phoneNote": "You will receive the confirmation request on this number.", "trust1": "Secure payment", "trust2": "No card data stored", "loading": "Loading…",
        },
        "confirmation": {
            "badge": "Booking confirmed and guaranteed", "congrats": "Congratulations {name}!", "scheduled": "Your live is officially scheduled.",
            "summary": "Your payment of {amount} was confirmed. Your receipt is below and is also sent on WhatsApp to {phone}.",
            "passTitle": "Official broadcast pass", "confirmed": "Confirmed and paid", "slotReserved": "Broadcast slot booked", "studioTime": "Lomé studio (GMT)", "yourTime": "Your time",
            "modeLabel": "Mode", "modeOnsite": "At the studio in Lomé", "modeRemote": "Remote",
            "nextTitle": "What happens now", "nextCount": "3 simple steps",
            "n1": {"title": "WhatsApp confirmation message", "text": "You receive your confirmation, then reminders the day before and 1 hour before."},
            "n2Onsite": {"title": "Arrival at the studio", "text": "Show the QR code on your receipt to the crew when you arrive."},
            "n2Remote": {"title": "Connection test", "text": "15 minutes before, the assistant tests your connection and framing."},
            "n3": {"title": "Your live, on air", "text": "Your product, number and address appear on screen on House of Challenge."},
            "kitTitle": "Preparation checklist", "kitIntro": "Get these four things ready for a great live.",
            "kit": {
                "light": {"title": "Good lighting", "text": "Face a window or a lamp."},
                "network": {"title": "A good connection", "text": "Plug in your phone and test your connection."},
                "products": {"title": "Your products ready", "text": "Pick 10 to 15 items and make the prices clearly visible."},
                "number": {"title": "Your number on screen", "text": "Have your WhatsApp number ready to show."},
            },
            "helpTitle": "A question about your booking?", "helpText": "An advisor answers you on WhatsApp.", "helpCta": "Talk to an advisor",
            "helpMessage": "Hello OCD Live, I have a question about my booking {reference}.", "another": "Schedule another live",
            "shareTitle": "Prepare your audience today", "shareText": "Share your booking on WhatsApp to let your customers know.",
        },
    },
}

for lang, add in (("fr", fr), ("en", en)):
    path = f"src/messages/{lang}.json"
    data = json.load(open(path, encoding="utf-8"))
    deep(data, add)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
print("ok")
