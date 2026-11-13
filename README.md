# OCD Live

Plateforme qui donne de la visibilité aux vendeurs africains par le live : réservation et paiement d'un créneau
(au studio de Lomé ou à distance), back-office pour l'équipe Bovan, espace vendeur.
Cahier des charges : `OCD Live — Cahier des charges fonctionnel.pdf` (sections 15 à 21 pour la construction).

**État** : MVP et V1 construits (étapes 1 à 14 du plan, section 20). La V2 et la V3 (section 13) feront l'objet d'un plan séparé.

## Installation

Prérequis : Node.js 20+.

```bash
npm install
cp .env.example .env        # puis .env.local si besoin ; les valeurs par défaut suffisent en développement
```

### Base de données PostgreSQL

Avec Docker :

```bash
docker compose up -d
```

Sans Docker (PostgreSQL embarqué, laisser tourner dans un terminal) :

```bash
npm run dev:db
```

Puis créer les tables et les données de test :

```bash
npm run db:reset            # migrations + seed (6 packages, 14 pays, 8 catégories, créneaux de décembre 2026, comptes de test)
```

## Lancement

```bash
npm run dev                 # http://localhost:3000 -> redirige vers /fr
```

| Commande | Rôle |
| --- | --- |
| `npm run lint` / `npm run typecheck` | ESLint, TypeScript strict |
| `npm test` | Vitest : tests unitaires + tests d'intégration sur PostgreSQL (ignorés si la base est absente) |
| `npm run test:e2e` | Playwright, parcours complet à 360 px et 1440 px (`npx playwright install chromium` une fois) |
| `npm run db:reset` | Recrée la base et relance le seed |
| `npm run db:demo` | Remet les 10 lives de démonstration en ligne pour 7 jours |

## Comptes de test (seed)

En développement, le code OTP s'affiche sous le champ de saisie.

| Rôle | Numéro | Accès |
| --- | --- | --- |
| ADMIN | +22890000001 | `/admin` complet |
| VALIDATOR | +22890000002 | file de validation des lives |
| ASSISTANT | +22890000003 | planning des lives à distance (V1) |
| STUDIO | +22890000004 | réservations, encaissement au studio |
| SELLER | +237690000005 | vendeur camerounais, abonnement actif, 2 réservations |
| SELLER | +22990000006 | vendeur béninois sans abonnement |

Un numéro finissant par `0000` fait échouer le paiement simulé (pour tester « Réessayer »).
Tout autre numéro crée un compte vendeur à la première connexion.

## Ce qui est construit

- **Réservation** (`/reserver/*`) : mode, profil vendeur + OTP WhatsApp, offre, calendrier, paiement, confirmation. Reprise automatique à l'étape en cours.
- **Paiement** : blocage de 10 min avec verrou en base, webhook signé et idempotent, reçu PDF avec QR code.
- **Notifications** : confirmation, rappels J-1 / H-1, alerte équipe. Tâche `GET /api/cron/tick` (en-tête `x-cron-secret`), à appeler toutes les 5 min : libère les blocages, envoie les rappels, expire les abonnements, archive les lives en fin de fenêtre, clôt les réservations (terminée ou absent).
- **Back-office** (`/admin`) : tableau du jour, réservations (filtres, détail, réservation assistée, encaissement au studio, annulation), calendrier, packages et prix, paramètres, journal d'audit, journal des envois.
- **Espace vendeur** (`/espace`) : prochain live, réservations, reçus.
- **Pages** : à propos, conditions, confidentialité ; métadonnées, Open Graph, `sitemap.xml`, `robots.txt`.
- **Annuaire (V1)** : abonnement de 30 jours (rappel J-3, expiration), soumission d'un lien de live pendant les fenêtres de validation, file de validation (`/admin/validation`), pages publiques `/lives` et `/lives/<pays>` (ordre tournant), vitrine `/v/<slug>`, statistiques vendeur (vues et clics, un par visiteur et par jour).
- **Confort (V1)** : report gratuit et annulation selon la politique des 48 h, fiche produit avant le live, check-in par QR code (`/admin/checkin/<référence>`, rôle STUDIO ou ADMIN), liste d'attente sur les créneaux complets, battement entre deux lives vérifié à l'ouverture d'un mois.
- **OCD Shop (V2)** : `/shop` navigable par pays, ville, catégorie, prix et recherche ; chaque vendeur gère ses produits dans `/espace/produits` (nom, prix, photo, stock) ; la fiche produit du live alimente la vitrine `/v/<slug>` ; commande par message WhatsApp prérempli, sans paiement sur le site. Panier, Mobile Money, séquestre et livraison restent en V3.

## Passage en mode réel

Chaque service externe passe par un adaptateur ; la variable `*_PROVIDER=mock` (défaut) active la simulation.

| Service | Variables | À faire |
| --- | --- | --- |
| Paiement | `PAYMENT_PROVIDER`, `PAYMENT_API_KEY`, `PAYMENT_WEBHOOK_SECRET` | Ajouter un connecteur dans `src/server/adapters/payment/` (interface `PaymentProvider`) et le brancher dans `index.ts`. Déclarer l'URL du webhook `/api/webhooks/payment/<provider>` chez l'agrégateur. |
| WhatsApp / SMS | `MESSAGING_PROVIDER`, `WHATSAPP_API_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `SMS_API_KEY` | Connecteur `MessagingProvider` dans `src/server/adapters/messaging/` ; modèles de messages à faire approuver (otp, booking_confirmed, reminder_d1, reminder_h1, team_new_booking). |
| E-mail | `EMAIL_PROVIDER`, `EMAIL_API_KEY` | Adaptateur à créer (non utilisé par le MVP). |
| Fichiers | `STORAGE_PROVIDER`, `S3_*` | `STORAGE_PROVIDER=s3` : Neon Object Storage (ou R2 / S3) via `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT_URL_S3`, `AWS_REGION` et `S3_BUCKET` (`assets` par défaut). En simulation (`mock`), les photos vont dans `./.uploads` (ignoré par git). |

Autres réglages de production : `SESSION_SECRET` (32 caractères minimum), `CRON_SECRET`, `APP_URL`, `OCD_WHATSAPP_NUMBER`.
Les prix, durées, horaires, délais et l'adresse du studio se modifient dans `/admin` (packages, paramètres), sans toucher au code.
Les pages `/dev/*` n'existent pas quand `NODE_ENV=production`.

## À valider avec M. Bovan avant la mise en ligne

Les prix des packages autres que l'essai (15 000 F), la liste des produits interdits, la politique d'annulation,
l'agrégateur de paiement et le numéro WhatsApp officiel sont des valeurs de développement : voir `DECISIONS.md`.
