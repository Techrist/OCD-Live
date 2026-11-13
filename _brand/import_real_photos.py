"""Importe les photos réelles fournies : visuels de catégories et photos des produits de démonstration."""
import os
from PIL import Image

SRC = "C:/Users/tenim/AppData/Local/Temp/claude/b3b96244fed573b8/627657ed-f658-47da-9b72-7199ce649268/images"
OUT = "public/images"
os.makedirs(f"{OUT}/demo", exist_ok=True)


def open_img(n):
    for ext in ("webp", "png"):
        p = f"{SRC}/{n}.{ext}"
        if os.path.exists(p):
            return Image.open(p).convert("RGB")
    raise FileNotFoundError(n)


def crop_ratio(im, ratio, cx=0.5, cy=0.5):
    """Recadre au rapport largeur/hauteur voulu autour du point (cx, cy)."""
    w, h = im.size
    if w / h > ratio:
        nw, nh = int(h * ratio), h
    else:
        nw, nh = w, int(w / ratio)
    x = min(max(int(cx * w - nw / 2), 0), w - nw)
    y = min(max(int(cy * h - nh / 2), 0), h - nh)
    return im.crop((x, y, x + nw, y + nh))


def save(im, path, max_w):
    if im.width > max_w:
        im = im.resize((max_w, int(im.height * max_w / im.width)), Image.LANCZOS)
    im.save(path, "WEBP", quality=82, method=6)
    print(path, im.size, os.path.getsize(path) // 1024, "Ko")


# Visuels de catégories (4:3, 800 px) : cartes de l'accueil, du shop et aperçus des lives.
CATS = {
    "cat-nourriture": (37, 0.5, 0.55),
    "cat-beaute-cheveux": (47, 0.5, 0.5),
    "cat-mode": (42, 0.5, 0.5),
    "cat-telephones-electronique": (43, 0.5, 0.5),
    "cat-services": (44, 0.5, 0.5),
    "cat-autre": (45, 0.5, 0.5),
}
for name, (n, cx, cy) in CATS.items():
    save(crop_ratio(open_img(n), 4 / 3, cx, cy), f"{OUT}/{name}.webp", 800)

# Photos des produits de démonstration (carrées, 800 px).
DEMO = {
    "poulet-legumes": 34, "ndole-crevettes": 35, "viande-poivrons": 36, "riz-jollof": 37, "ragout-boeuf": 38,
    "poisson-riz": 39, "poisson-attieke": 40, "poisson-arachide": 41, "burger": 31, "spaghetti": 32, "club-sandwich": 33,
    "mode-seconde-main": 42, "accessoires-telephone": 43, "reparation": 44,
    "soins-naturels": 47, "maquillage": 48, "creme-huile": 49, "serum": 50, "lait-corporel": 46,
}
for name, n in DEMO.items():
    save(crop_ratio(open_img(n), 1, 0.5, 0.5), f"{OUT}/demo/{name}.webp", 800)
