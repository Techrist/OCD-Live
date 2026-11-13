p = "README.md"
s = open(p, encoding="utf-8").read()
s = s.replace("**État** : MVP (étapes 1 à 10 du plan, section 20). La V1 (annuaire par abonnement, étapes 11 à 14) reste à construire.",
              "**État** : MVP et V1 construits (étapes 1 à 14 du plan, section 20). La V2 et la V3 (section 13) feront l'objet d'un plan séparé.")
s = s.replace("- **Pages** : à propos, conditions, confidentialité ; métadonnées, Open Graph, `sitemap.xml`, `robots.txt`.",
"""- **Pages** : à propos, conditions, confidentialité ; métadonnées, Open Graph, `sitemap.xml`, `robots.txt`.
- **Annuaire (V1)** : abonnement de 30 jours (rappel J-3, expiration), soumission d'un lien de live pendant les fenêtres de validation, file de validation (`/admin/validation`), pages publiques `/lives` et `/lives/<pays>` (ordre tournant), vitrine `/v/<slug>`, statistiques vendeur (vues et clics, un par visiteur et par jour).
- **Confort (V1)** : report gratuit et annulation selon la politique des 48 h, fiche produit avant le live, check-in par QR code (`/admin/checkin/<référence>`, rôle STUDIO ou ADMIN), liste d'attente sur les créneaux complets, battement entre deux lives vérifié à l'ouverture d'un mois.""")
s = s.replace("| `npm run db:reset` | Recrée la base et relance le seed |", "| `npm run db:reset` | Recrée la base et relance le seed |\n| `npm run db:demo` | Remet les 10 lives de démonstration en ligne pour 7 jours |")
s = s.replace("| VALIDATOR | +22890000002 | file de validation (V1) |", "| VALIDATOR | +22890000002 | file de validation des lives |")
s = s.replace("Tâche `GET /api/cron/tick` (en-tête `x-cron-secret`), à appeler toutes les 5 min.", "Tâche `GET /api/cron/tick` (en-tête `x-cron-secret`), à appeler toutes les 5 min : libère les blocages, envoie les rappels, expire les abonnements, archive les lives en fin de fenêtre, clôt les réservations (terminée ou absent).")
open(p, "w", encoding="utf-8").write(s)

with open("DECISIONS.md", "a", encoding="utf-8") as f:
    f.write("""- **V1 (étapes 11 à 14)** : un abonnement renouvelé démarre à la fin du précédent (aucun jour perdu) ; « actif » = statut ACTIVE et période en cours. Un live soumis expire à la fin de la fenêtre où il a été soumis ; hors fenêtre, la soumission est refusée avec l'heure de la prochaine (ANN-01). La file du validateur signale les cas douteux (lien déjà vu, premier live) mais ne publie rien automatiquement. Les compteurs (vues, clics) sont uniques par visiteur (cookie anonyme `ocd_vid`), par jour et par type (contrainte unique en base). Annulation vendeur : remboursée à plus de 48 h (remboursement simulé par l'adaptateur), sinon aucun remboursement ; report refusé à moins de 48 h. Les lives à distance passent automatiquement « terminés » après le créneau ; un live au studio sans check-in passe « absent ». Le QR du reçu ouvre `/admin/checkin/<référence>`.
- **À brancher plus tard** : le remboursement réel dépend de l'agrégateur ; les photos de la fiche produit (stockage S3) ne sont pas faites ; classement « Sponsoris\u00e9 » et avis (V2) non faits.
""")
print("ok")
