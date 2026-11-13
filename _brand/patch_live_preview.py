import json, re

def edit(path, pairs):
    s = open(path, encoding="utf-8").read()
    for a, b in pairs:
        assert a in s, (path, a[:60])
        s = s.replace(a, b, 1)
    open(path, "w", encoding="utf-8").write(s)

edit("src/app/[locale]/(vendeur)/espace/vitrine/page.tsx", [
    ('import { Link } from "@/i18n/navigation";', 'import { ProfilePhotoForm } from "@/components/espace/profile-photo-form";\nimport { Link } from "@/i18n/navigation";'),
    ('      <form action={updateShowcaseAction}', '      <ProfilePhotoForm current={profile.photoUrl} />\n      <form action={updateShowcaseAction}'),
])

edit("src/server/services/directory.ts", [
    ("      category: { select: { id: true, name: true, icon: true } },\n      seller: { select: { id: true, phone: true, city: true, sellerProfile: { select: { shopName: true, slug: true, verified: true, photoUrl: true } } } },",
     "      category: { select: { id: true, slug: true, name: true, icon: true } },\n      seller: {\n        select: {\n          id: true, phone: true, city: true,\n          sellerProfile: { select: { shopName: true, slug: true, verified: true, photoUrl: true } },\n          products: { where: { active: true, photoKey: { not: null } }, orderBy: { createdAt: \"desc\" }, take: 1, select: { photoKey: true } },\n        },\n      },"),
])

msgs = {
    "fr": {"title": "Photo de ton compte", "text": "Elle sert d'aperçu quand ton live apparaît dans les directs en cours, et en tête de ta vitrine. Sans photo, on affiche l'un de tes produits.",
           "alt": "Photo de ton compte", "add": "Ajouter une photo", "change": "Changer la photo", "remove": "Retirer la photo", "saved": "Photo enregistrée.",
           "errors": {"network": "Connexion impossible. Réessaie.", "INVALID_IMAGE": "Photo non reconnue : utilise un fichier JPG, PNG ou WebP.", "TOO_BIG": "Photo trop lourde (3 Mo maximum).", "NO_PROFILE": "Crée d'abord ton profil vendeur.", "FORBIDDEN": "Connecte-toi en tant que vendeur."}},
    "en": {"title": "Your account photo", "text": "It is the preview when your live shows up in the live now list, and the header of your showcase. Without a photo, one of your products is shown.",
           "alt": "Your account photo", "add": "Add a photo", "change": "Change photo", "remove": "Remove photo", "saved": "Photo saved.",
           "errors": {"network": "Can't connect. Try again.", "INVALID_IMAGE": "Photo not recognised: use a JPG, PNG or WebP file.", "TOO_BIG": "Photo too large (3 MB maximum).", "NO_PROFILE": "Create your seller profile first.", "FORBIDDEN": "Sign in as a seller."}},
}
for lang, photo in msgs.items():
    p = f"src/messages/{lang}.json"
    j = json.load(open(p, encoding="utf-8"))
    j["espace"]["photo"] = photo
    open(p, "w", encoding="utf-8").write(json.dumps(j, ensure_ascii=False, indent=2) + "\n")
print("ok")
