import json

STATUS_FR = {"DRAFT": "Brouillon", "HELD": "Bloquée", "CONFIRMED": "Confirmée", "EXPIRED": "Expirée", "CANCELLED": "Annulée", "COMPLETED": "Terminée", "NO_SHOW": "Absent"}
STATUS_EN = {"DRAFT": "Draft", "HELD": "Held", "CONFIRMED": "Confirmed", "EXPIRED": "Expired", "CANCELLED": "Cancelled", "COMPLETED": "Completed", "NO_SHOW": "No-show"}

fr = {
    "admin": {
        "title": "Back-office",
        "common": {"save": "Enregistrer"},
        "nav": {"today": "Aujourd'hui", "bookings": "Réservations", "calendar": "Calendrier", "packages": "Packages", "notifications": "Envois", "journal": "Journal", "settings": "Paramètres"},
        "mode": {"ONSITE": "Studio", "REMOTE": "À distance"},
        "status": STATUS_FR,
        "payStatus": {"NONE": "Non payé", "PENDING": "Paiement en cours", "SUCCEEDED": "Payé", "FAILED": "Paiement échoué", "REFUNDED": "Remboursé"},
        "today": {"title": "Qui passe aujourd'hui", "empty": "Aucun live aujourd'hui.", "unassigned": "Sans assistante"},
        "bookings": {"title": "Réservations", "new": "Réservation assistée", "filterStatus": "Statut", "filterDate": "Jour du live", "all": "Tous", "filter": "Filtrer", "empty": "Aucune réservation."},
        "booking": {"status": "Statut", "seller": "Vendeur", "shop": "Boutique", "country": "Pays", "offer": "Offre", "slot": "Créneau", "amount": "Montant", "payments": "Paiements", "assistant": "Assistante", "studioPay": "Encaisser au studio", "cancel": "Annuler la réservation", "cancelReason": "Motif d'annulation"},
        "assisted": {"title": "Réservation assistée", "phone": "Numéro WhatsApp du vendeur", "package": "Offre", "slot": "Créneau", "submit": "Créer (bloquée 24 h)", "created": "Réservation créée.", "errors": {"INVALID_INPUT": "Vérifie le numéro et les choix.", "INVALID_PACKAGE": "Offre indisponible.", "INVALID_SLOT": "Créneau introuvable.", "SLOT_FULL": "Ce créneau est complet.", "NOT_A_SELLER": "Ce numéro appartient à un membre de l'équipe."}},
        "calendar": {"title": "Calendrier", "month": "Mois", "show": "Afficher", "openMonth": "Ouvrir ce mois", "none": "Aucun créneau ce mois-ci : ouvre le mois.", "closed": "Fermé", "openCount": "{open} ouverts sur {total}", "closeDay": "Fermer le jour", "reopenDay": "Rouvrir le jour"},
        "packages": {"title": "Packages et prix", "name": "Nom", "price": "Prix (FCFA)", "duration": "Durée (min)", "lives": "Nombre de lives", "order": "Ordre", "active": "Visible", "highlighted": "Le plus choisi", "save": "Enregistrer"},
        "settings": {"title": "Paramètres", "hint": "Valeurs au format JSON (nombre, texte entre guillemets, liste entre crochets).", "save": "Enregistrer"},
        "journal": {"title": "Journal d'audit", "empty": "Aucune action enregistrée."},
        "notifications": {"title": "Journal des envois", "empty": "Aucun envoi."},
    },
    "espace": {
        "title": "Mon espace", "hello": "Bonjour", "next": "Mon prochain live", "noNext": "Aucun live prévu.", "book": "Réserver un live",
        "bookings": "Mes réservations", "empty": "Tu n'as pas encore de réservation.", "receipt": "Reçu", "resume": "Terminer le paiement",
        "status": STATUS_FR, "onsite": "Au studio à Lomé", "remote": "À distance", "lome": "(heure de Lomé)",
    },
    "legal": {
        "about": {"title": "À propos", "p1": "OCD Live donne de la visibilité aux vendeurs africains par le live : un studio à Lomé (Togo) diffuse sur le compte TikTok House of Challenge, et les vendeurs à distance sont accompagnés par une assistante.", "p2": "Le principe : le marketing avant la vente. Le live sert d'abord à placer ton produit, ton numéro et ton adresse.", "p3": "OCD Live est une initiative de Bovan Group."},
        "terms": {"title": "Conditions et annulation", "h1": "Réservation", "p1": "Une réservation est confirmée après le paiement. Le créneau choisi est bloqué 10 minutes le temps de payer, puis il est libéré.", "h2": "Report et annulation", "p2": "Le report est gratuit jusqu'à 48 h avant le live. Une annulation moins de 48 h avant le live n'est pas remboursée.", "h3": "Produits interdits", "p3": "Les produits interdits entraînent le refus du live et, en cas de récidive, la suspension du compte. La liste complète sera publiée par l'équipe.", "h4": "Charte du vendeur", "p4": "Je présente des produits réels, je donne mon vrai numéro et ma vraie adresse, et je réponds à mes clients."},
        "privacy": {"title": "Confidentialité", "h1": "Données collectées", "p1": "Nous gardons ton numéro WhatsApp, ton nom, ta boutique, ton pays et tes réservations pour faire fonctionner le service et t'envoyer reçus et rappels.", "h2": "Paiement", "p2": "Aucune donnée de carte n'est stockée par OCD Live : le paiement passe par un prestataire agréé.", "h3": "Tes droits", "p3": "Tu peux demander l'accès, la correction ou la suppression de tes données en nous écrivant sur WhatsApp. Nous respectons la loi togolaise sur la protection des données et celles des pays des vendeurs."},
    },
}

en = {
    "admin": {
        "title": "Back-office",
        "common": {"save": "Save"},
        "nav": {"today": "Today", "bookings": "Bookings", "calendar": "Calendar", "packages": "Packages", "notifications": "Messages", "journal": "Audit log", "settings": "Settings"},
        "mode": {"ONSITE": "Studio", "REMOTE": "Remote"},
        "status": STATUS_EN,
        "payStatus": {"NONE": "Not paid", "PENDING": "Payment pending", "SUCCEEDED": "Paid", "FAILED": "Payment failed", "REFUNDED": "Refunded"},
        "today": {"title": "Who is live today", "empty": "No live today.", "unassigned": "No assistant"},
        "bookings": {"title": "Bookings", "new": "Assisted booking", "filterStatus": "Status", "filterDate": "Live day", "all": "All", "filter": "Filter", "empty": "No booking."},
        "booking": {"status": "Status", "seller": "Seller", "shop": "Shop", "country": "Country", "offer": "Offer", "slot": "Slot", "amount": "Amount", "payments": "Payments", "assistant": "Assistant", "studioPay": "Take payment at the studio", "cancel": "Cancel booking", "cancelReason": "Cancellation reason"},
        "assisted": {"title": "Assisted booking", "phone": "Seller WhatsApp number", "package": "Offer", "slot": "Slot", "submit": "Create (held 24 h)", "created": "Booking created.", "errors": {"INVALID_INPUT": "Check the number and choices.", "INVALID_PACKAGE": "Offer unavailable.", "INVALID_SLOT": "Slot not found.", "SLOT_FULL": "This slot is full.", "NOT_A_SELLER": "This number belongs to a team member."}},
        "calendar": {"title": "Calendar", "month": "Month", "show": "Show", "openMonth": "Open this month", "none": "No slot this month: open the month.", "closed": "Closed", "openCount": "{open} open out of {total}", "closeDay": "Close day", "reopenDay": "Reopen day"},
        "packages": {"title": "Packages and prices", "name": "Name", "price": "Price (FCFA)", "duration": "Duration (min)", "lives": "Number of lives", "order": "Order", "active": "Visible", "highlighted": "Most popular", "save": "Save"},
        "settings": {"title": "Settings", "hint": "Values in JSON format (number, quoted text, list in brackets).", "save": "Save"},
        "journal": {"title": "Audit log", "empty": "No action recorded."},
        "notifications": {"title": "Message log", "empty": "No message."},
    },
    "espace": {
        "title": "My space", "hello": "Hello", "next": "My next live", "noNext": "No live planned.", "book": "Book a live",
        "bookings": "My bookings", "empty": "You have no booking yet.", "receipt": "Receipt", "resume": "Finish payment",
        "status": STATUS_EN, "onsite": "At the studio in Lomé", "remote": "Remote", "lome": "(Lomé time)",
    },
    "legal": {
        "about": {"title": "About", "p1": "OCD Live gives African sellers visibility through live video: a studio in Lomé (Togo) broadcasts on the House of Challenge TikTok account, and remote sellers are supported by an assistant.", "p2": "The idea: marketing before selling. The live is first used to place your product, your number and your address.", "p3": "OCD Live is an initiative of Bovan Group."},
        "terms": {"title": "Terms and cancellation", "h1": "Booking", "p1": "A booking is confirmed after payment. The chosen slot is held for 10 minutes while you pay, then released.", "h2": "Rescheduling and cancellation", "p2": "Rescheduling is free up to 48 hours before the live. A cancellation less than 48 hours before the live is not refunded.", "h3": "Prohibited products", "p3": "Prohibited products lead to the live being refused and, on repeat, account suspension. The full list will be published by the team.", "h4": "Seller charter", "p4": "I present real products, give my real number and address, and answer my customers."},
        "privacy": {"title": "Privacy", "h1": "Data we collect", "p1": "We keep your WhatsApp number, name, shop, country and bookings to run the service and send you receipts and reminders.", "h2": "Payment", "p2": "OCD Live stores no card data: payment goes through an approved provider.", "h3": "Your rights", "p3": "You can ask for access, correction or deletion of your data by writing to us on WhatsApp. We follow Togolese data protection law and that of the sellers' countries."},
    },
}

for lang, add in (("fr", fr), ("en", en)):
    path = f"src/messages/{lang}.json"
    data = json.load(open(path, encoding="utf-8"))
    data.update(add)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
print("ok")
