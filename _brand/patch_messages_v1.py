import json


def deep(a, b):
    for k, v in b.items():
        if isinstance(v, dict) and isinstance(a.get(k), dict):
            deep(a[k], v)
        else:
            a[k] = v


fr = {
    "nav": {"lives": "Lives"},
    "booking": {"slot": {"waitlist": "Me prévenir si une place se libère", "waitlistDone": "C'est noté : tu seras prévenu sur WhatsApp."}},
    "admin": {
        "nav": {"validation": "Validation"},
        "booking": {"checkedIn": "Arrivé à {time}", "sheet": "Fiche produit"},
        "validation": {
            "title": "Lives à valider", "empty": "Aucun live en attente.", "open": "Ouvrir le lien", "validate": "Valider", "reject": "Refuser", "reason": "Motif de refus",
            "reasons": {"PROHIBITED": "Produit interdit", "BAD_LINK": "Lien incorrect", "NOT_LIVE": "Pas en direct", "OTHER": "Autre motif"},
            "flags": {"duplicate": "Lien déjà vu", "firstLive": "Premier live", "verified": "Vendeur vérifié"},
            "errors": {"NOT_FOUND": "Ce live a déjà été traité.", "WINDOW_CLOSED": "La fenêtre est terminée : le live est archivé.", "REASON_REQUIRED": "Indique un motif.", "NETWORK": "Pas de réseau.", "INVALID_INPUT": "Demande invalide.", "FORBIDDEN": "Accès refusé."},
        },
        "checkin": {
            "title": "Arrivée au studio", "reference": "Réservation", "seller": "Vendeur", "slot": "Créneau", "offer": "Offre", "status": "Arrivée",
            "checkedIn": "Enregistrée à {time}", "notYet": "Pas encore", "confirm": "Valider l'arrivée",
            "result": {"ok": "Arrivée enregistrée.", "already": "Arrivée déjà enregistrée.", "NOT_FOUND": "Réservation introuvable.", "INVALID_STATE": "Cette réservation n'est pas un live au studio confirmé.", "TOO_EARLY": "Trop tôt : le check-in ouvre 2 h avant le créneau.", "TOO_LATE": "Le créneau est terminé."},
        },
    },
    "lives": {
        "title": "Lives en direct", "subtitle": "Choisis un pays, puis une catégorie.", "next": "Prochain créneau : {time} (heure de Lomé)",
        "liveCount": "{count, plural, =0 {Aucun live} other {# en live}}", "live": "En direct", "verified": "Vendeur vérifié", "watch": "Voir le live", "whatsapp": "WhatsApp",
        "showcase": "Voir la vitrine", "categories": "Catégories", "all": "Tous", "empty": "Aucun live en cours dans ce pays pour le moment.", "allCountries": "Tous les pays",
        "waMessage": "Bonjour, je vous contacte depuis OCD Live.",
    },
    "showcase": {"verified": "Vendeur vérifié", "liveNow": "En direct maintenant", "noLive": "Pas en direct pour le moment", "watch": "Voir le live", "contact": "Écrire sur WhatsApp", "waMessage": "Bonjour {shop}, je vous contacte depuis OCD Live."},
    "espace": {
        "submitLive": "Soumettre mon live", "subscriptionLink": "Mon abonnement", "showcaseLink": "Ma vitrine", "statsLink": "Mes statistiques",
        "subscription": {
            "title": "Abonnement annuaire", "active": "Abonnement actif", "until": "Jusqu'au {date}", "inactive": "Pas d'abonnement actif", "price": "{price} pour 30 jours",
            "perks": "Soumets ton live deux fois par jour pour apparaître dans ton pays et ta catégorie.", "chooseMethod": "Comment veux-tu payer ?", "phoneLabel": "Numéro qui paie",
            "subscribe": "S'abonner · {price}", "renew": "Renouveler · {price}", "error": "Le paiement n'a pas pu démarrer. Réessaie.", "statusActive": "Actif", "statusExpired": "Terminé",
        },
        "submit": {
            "title": "Soumettre mon live", "windows": "Créneaux : {list} (heure de Lomé)", "open": "Un créneau est ouvert : colle le lien de ton live.", "closed": "Aucun créneau ouvert pour le moment.",
            "urlLabel": "Lien de ton live", "send": "Envoyer", "ok": "Live envoyé : l'équipe le valide.", "recent": "Mes derniers envois", "subscribe": "S'abonner",
            "status": {"PENDING": "En attente", "PUBLISHED": "Publié", "REJECTED": "Refusé", "ARCHIVED": "Terminé"},
            "errors": {
                "NO_SUBSCRIPTION": "Il faut un abonnement actif pour soumettre un live.", "OUTSIDE_WINDOW": "Les lives se soumettent pendant les créneaux. Prochain créneau : {time} (heure de Lomé).",
                "INVALID_URL": "Lien invalide. Colle le lien TikTok, Facebook, Instagram ou YouTube.", "DUPLICATE": "Ce lien est déjà envoyé.", "NO_PROFILE": "Complète d'abord ton profil.", "network": "Pas de réseau. Réessaie.",
            },
        },
        "showcase": {"title": "Ma vitrine", "view": "Voir ma vitrine", "shop": "Nom de ma boutique", "activity": "Ce que je vends", "description": "Présentation (300 caractères)", "save": "Enregistrer", "noProfile": "Pas de profil."},
        "stats": {"title": "Mes statistiques", "last30": "30 derniers jours", "views": "Vues de ma fiche", "liveClicks": "Clics vers mon live", "whatsappClicks": "Clics WhatsApp"},
        "actions": {
            "cancel": "Annuler ma réservation", "cancelRefund": "Tu seras remboursé : l'annulation est gratuite plus de 48 h avant le live.", "cancelNoRefund": "Attention : à moins de 48 h du live, il n'y a aucun remboursement.",
            "cancelledRefunded": "Réservation annulée et remboursée.", "cancelled": "Réservation annulée.", "confirmCancel": "Oui, annuler", "keep": "Non, garder", "sheet": "Fiche produit", "reschedule": "Reporter",
        },
        "reschedule": {
            "title": "Reporter mon live", "current": "Actuellement : {date}", "choose": "Nouveau créneau", "submit": "Reporter", "done": "Live reporté.",
            "errors": {"TOO_LATE": "Le report n'est plus possible : il reste {hours} h avant ton live, et le report est gratuit jusqu'à {free} h avant.", "SLOT_FULL": "Ce créneau est complet.", "INVALID_SLOT": "Créneau invalide.", "NOT_FOUND": "Réservation introuvable.", "INVALID_STATE": "Cette réservation ne peut pas être reportée."},
        },
        "sheet": {"title": "Fiche produit", "intro": "La régie reçoit cette fiche à l'avance pour afficher tes produits, ton numéro et ton adresse à l'écran.", "address": "Adresse à afficher", "phone": "Numéro à afficher", "productName": "Produit", "price": "Prix (F)", "quantity": "Quantité", "add": "Ajouter un produit", "save": "Enregistrer la fiche", "saved": "Fiche enregistrée.", "error": "Enregistrement impossible."},
    },
}

en = {
    "nav": {"lives": "Lives"},
    "booking": {"slot": {"waitlist": "Notify me if a spot opens", "waitlistDone": "Noted: you will be notified on WhatsApp."}},
    "admin": {
        "nav": {"validation": "Validation"},
        "booking": {"checkedIn": "Arrived at {time}", "sheet": "Product sheet"},
        "validation": {
            "title": "Lives to validate", "empty": "No live waiting.", "open": "Open link", "validate": "Approve", "reject": "Reject", "reason": "Rejection reason",
            "reasons": {"PROHIBITED": "Prohibited product", "BAD_LINK": "Wrong link", "NOT_LIVE": "Not live", "OTHER": "Other reason"},
            "flags": {"duplicate": "Link already seen", "firstLive": "First live", "verified": "Verified seller"},
            "errors": {"NOT_FOUND": "This live was already handled.", "WINDOW_CLOSED": "The window is over: the live is archived.", "REASON_REQUIRED": "Give a reason.", "NETWORK": "No network.", "INVALID_INPUT": "Invalid request.", "FORBIDDEN": "Access denied."},
        },
        "checkin": {
            "title": "Studio arrival", "reference": "Booking", "seller": "Seller", "slot": "Slot", "offer": "Offer", "status": "Arrival",
            "checkedIn": "Recorded at {time}", "notYet": "Not yet", "confirm": "Confirm arrival",
            "result": {"ok": "Arrival recorded.", "already": "Arrival already recorded.", "NOT_FOUND": "Booking not found.", "INVALID_STATE": "This is not a confirmed studio live.", "TOO_EARLY": "Too early: check-in opens 2 h before the slot.", "TOO_LATE": "The slot is over."},
        },
    },
    "lives": {
        "title": "Live now", "subtitle": "Choose a country, then a category.", "next": "Next slot: {time} (Lomé time)",
        "liveCount": "{count, plural, =0 {No live} other {# live}}", "live": "Live", "verified": "Verified seller", "watch": "Watch live", "whatsapp": "WhatsApp",
        "showcase": "See showcase", "categories": "Categories", "all": "All", "empty": "No live in this country right now.", "allCountries": "All countries",
        "waMessage": "Hello, I am contacting you from OCD Live.",
    },
    "showcase": {"verified": "Verified seller", "liveNow": "Live right now", "noLive": "Not live at the moment", "watch": "Watch live", "contact": "Write on WhatsApp", "waMessage": "Hello {shop}, I am contacting you from OCD Live."},
    "espace": {
        "submitLive": "Submit my live", "subscriptionLink": "My subscription", "showcaseLink": "My showcase", "statsLink": "My statistics",
        "subscription": {
            "title": "Directory subscription", "active": "Active subscription", "until": "Until {date}", "inactive": "No active subscription", "price": "{price} for 30 days",
            "perks": "Submit your live twice a day to appear in your country and category.", "chooseMethod": "How do you want to pay?", "phoneLabel": "Paying number",
            "subscribe": "Subscribe · {price}", "renew": "Renew · {price}", "error": "The payment could not start. Try again.", "statusActive": "Active", "statusExpired": "Ended",
        },
        "submit": {
            "title": "Submit my live", "windows": "Slots: {list} (Lomé time)", "open": "A slot is open: paste your live link.", "closed": "No slot is open right now.",
            "urlLabel": "Your live link", "send": "Send", "ok": "Live sent: the team will validate it.", "recent": "My latest submissions", "subscribe": "Subscribe",
            "status": {"PENDING": "Pending", "PUBLISHED": "Published", "REJECTED": "Rejected", "ARCHIVED": "Ended"},
            "errors": {
                "NO_SUBSCRIPTION": "An active subscription is needed to submit a live.", "OUTSIDE_WINDOW": "Lives are submitted during the slots. Next slot: {time} (Lomé time).",
                "INVALID_URL": "Invalid link. Paste a TikTok, Facebook, Instagram or YouTube link.", "DUPLICATE": "This link is already sent.", "NO_PROFILE": "Complete your profile first.", "network": "No network. Try again.",
            },
        },
        "showcase": {"title": "My showcase", "view": "See my showcase", "shop": "Shop name", "activity": "What I sell", "description": "Presentation (300 characters)", "save": "Save", "noProfile": "No profile."},
        "stats": {"title": "My statistics", "last30": "Last 30 days", "views": "Showcase views", "liveClicks": "Clicks to my live", "whatsappClicks": "WhatsApp clicks"},
        "actions": {
            "cancel": "Cancel my booking", "cancelRefund": "You will be refunded: cancelling is free more than 48 h before the live.", "cancelNoRefund": "Warning: less than 48 h before the live, there is no refund.",
            "cancelledRefunded": "Booking cancelled and refunded.", "cancelled": "Booking cancelled.", "confirmCancel": "Yes, cancel", "keep": "No, keep it", "sheet": "Product sheet", "reschedule": "Reschedule",
        },
        "reschedule": {
            "title": "Reschedule my live", "current": "Currently: {date}", "choose": "New slot", "submit": "Reschedule", "done": "Live rescheduled.",
            "errors": {"TOO_LATE": "Rescheduling is no longer possible: {hours} h left before your live, and rescheduling is free up to {free} h before.", "SLOT_FULL": "This slot is full.", "INVALID_SLOT": "Invalid slot.", "NOT_FOUND": "Booking not found.", "INVALID_STATE": "This booking cannot be rescheduled."},
        },
        "sheet": {"title": "Product sheet", "intro": "The studio crew receives this sheet in advance to show your products, number and address on screen.", "address": "Address to show", "phone": "Number to show", "productName": "Product", "price": "Price (F)", "quantity": "Quantity", "add": "Add a product", "save": "Save the sheet", "saved": "Sheet saved.", "error": "Could not save."},
    },
}

for lang, add in (("fr", fr), ("en", en)):
    path = f"src/messages/{lang}.json"
    data = json.load(open(path, encoding="utf-8"))
    deep(data, add)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

# Boutons de l'accueil vendeur : clés distinctes des espaces de noms (espace.subscription, espace.showcase, espace.stats).
p = "src/app/[locale]/(vendeur)/espace/page.tsx"
s = open(p, encoding="utf-8").read()
s = s.replace('t("subscription")', 't("subscriptionLink")').replace('t("showcase")', 't("showcaseLink")').replace('t("stats")', 't("statsLink")')
open(p, "w", encoding="utf-8").write(s)
print("ok")
