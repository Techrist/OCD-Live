# Prompts pour générer les images du site

Chaque image remplace un fichier provisoire de `public/images/` : **même nom, format `.webp`**, même orientation.
Compresse en WebP (qualité 75, moins de 150 Ko par image) pour garder l'accueil léger (cible : moins de 300 Ko).

## État des images

**Déjà en place** (importées depuis tes images, recadrées par `_brand/import_photos.py`, originaux dans `_brand/originals/`) :
`hero-1` à `hero-5`, `cat-nourriture`, `cat-mode`, `cat-chaussures-sacs`, `cat-beaute-cheveux`, `cat-telephones-electronique`, `cat-maison`, `cat-services`.

**Photos réelles fournies (à vérifier côté droits d'utilisation avant la mise en ligne)** : visuels des catégories `cat-nourriture`, `cat-beaute-cheveux`, `cat-mode`, `cat-telephones-electronique`, `cat-services`, `cat-autre` et photos des produits de démonstration (`public/images/demo/`). Restent générées par IA : `cat-chaussures-sacs`, `cat-maison`, `hero-1..5`, `step-1..3`, `why-1/2`, `cta`, `studio`.

**Images de remplacement** : `studio` (recadrage de `why-1`) et `cat-autre` (recadrage de `cta`) viennent de photos existantes ; à remplacer par de vraies photos du studio et de la catégorie « Autre » quand elles existent.
Les prompts ci-dessous restent valables pour celles-là (et pour remplacer les autres si besoin).

## Bloc de style à coller à la fin de chaque prompt

> Photographie réaliste de qualité magazine, lumière naturelle chaude, palette cuivre / terre cuite / ambre,
> peau et textures naturelles, expressions sincères, arrière-plan net et simple, aucune écriture lisible,
> aucun logo, aucun filigrane, mains et visages anatomiquement corrects, sans déformation.

Conseil : génère les portraits des vendeurs avec des personnes **réelles et consentantes** de préférence (shooting au studio de Lomé).
Le cahier des charges demande des photos réelles du studio ; ces prompts servent de repère ou de solution provisoire.

## Accueil — héros (cartes en éventail, portrait 3:4, 600 × 800)

| Fichier | Prompt |
| --- | --- |
| `hero-1.webp` | Portrait d'une vendeuse africaine souriante qui tient un grand plat de cuisine ouest-africaine fumant devant un smartphone sur trépied, tablier coloré, cuisine lumineuse. |
| `hero-2.webp` | Portrait d'un créateur de mode africain en tissu wax éclatant, présentant une robe sur cintre devant un anneau lumineux (ring light), atelier chaleureux. |
| `hero-3.webp` | Portrait d'une coiffeuse-esthéticienne africaine montrant des produits de soin capillaire, sourire confiant, fond rose-ambre doux, ring light visible. |
| `hero-4.webp` | Portrait d'un jeune vendeur africain de téléphones et écouteurs qui montre un smartphone à la caméra, énergique, comptoir de boutique en arrière-plan. |
| `hero-5.webp` | Portrait d'une vendeuse africaine d'objets de décoration maison (paniers tressés, coussins) dans un salon lumineux, regard vers la caméra. |

## Accueil — catégories populaires (paysage 4:3, 800 × 600)

| Fichier | Prompt |
| --- | --- |
| `cat-nourriture.webp` | Étal de cuisine ouest-africaine : plats en sauce, bananes plantains, épices, sur une table en bois, vue légèrement en plongée. |
| `cat-mode.webp` | Portants de vêtements en tissu wax coloré dans une boutique lumineuse, tissus pliés au premier plan. |
| `cat-chaussures-sacs.webp` | Sacs en cuir et sandales artisanales disposés sur une étagère en bois clair, lumière douce. |
| `cat-beaute-cheveux.webp` | Produits de beauté naturels (beurre de karité, huiles) et peignes sur une table, fond chaud. |
| `cat-telephones-electronique.webp` | Smartphones, écouteurs et chargeurs soigneusement alignés sur un comptoir, éclairage net. |
| `cat-maison.webp` | Coin salon avec coussins colorés, paniers tressés et plantes, lumière du matin. |
| `cat-services.webp` | Deux personnes en discussion souriante autour d'une table, ordinateur portable, ambiance de petit commerce. |
| `cat-autre.webp` | Marché coloré avec objets variés d'artisanat, vue d'ensemble chaleureuse. |

## Accueil — « Réserve en 3 étapes » (portrait 4:5, 800 × 1000)

| Fichier | Prompt |
| --- | --- |
| `step-1.webp` | Femme africaine qui choisit un jour sur un calendrier affiché sur son smartphone, assise dans sa boutique, sourire détendu. |
| `step-2.webp` | Homme africain qui valide un paiement Mobile Money sur son téléphone, en tenant son téléphone devant lui, écran non lisible. |
| `step-3.webp` | Vendeuse en direct devant un smartphone sur trépied avec ring light, présentant un produit à la caméra, ambiance de studio. |

## Accueil — « Pourquoi OCD Live » (portrait 3:4, 1200 × 1600)

| Fichier | Prompt |
| --- | --- |
| `why-1.webp` | Régie de studio de télévision : technicien africain derrière une console, caméra au premier plan, lumières chaudes. |
| `why-2.webp` | Assistante à distance avec un casque audio devant un ordinateur, souriante, qui accompagne un vendeur en direct. |

## Accueil et À propos — le studio (paysage 3:2, 1400 × 900)

| Fichier | Prompt |
| --- | --- |
| `studio.webp` | Plateau de studio de live shopping à Lomé : bureau en bois, décor de tissus wax, deux caméras, ring lights, lumière chaude, personne de dos ou en flou. |

## Après génération

1. Nomme chaque fichier comme dans la colonne « Fichier » et copie-les dans `public/images/` (écrase les provisoires).
2. Vérifie qu'aucun texte parasite n'apparaît dans l'image.
3. Régénère les provisoires si besoin : `python _brand/make_placeholders.py`.
