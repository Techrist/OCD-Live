"""Importe les photos générées : recadrage au format voulu, redimensionnement, WebP léger.
Usage : python _brand/import_photos.py"""
import os
import shutil
from PIL import Image

SRC = "C:/Users/tenim/AppData/Local/Temp/claude/b3b96244fed573b8/627657ed-f658-47da-9b72-7199ce649268/images"
OUT = "public/images"
KEEP = "_brand/originals"
os.makedirs(KEEP, exist_ok=True)

# (n° du fichier reçu, nom du site, largeur, hauteur, position horizontale du centre de recadrage en %)
JOBS = [
    (6, "hero-1", 600, 800, 0.44),   # vendeuse avec plat et trépied
    (7, "hero-2", 600, 800, 0.42),   # créateur wax avec robe et ring light
    (8, "hero-3", 600, 800, 0.48),   # coiffeuse avec produits
    (9, "hero-4", 600, 800, 0.45),   # vendeur de téléphones
    (10, "hero-5", 600, 800, 0.48),  # vendeuse de paniers
    (11, "cat-nourriture", 800, 600, 0.5),
    (12, "cat-mode", 800, 600, 0.5),
    (13, "cat-chaussures-sacs", 800, 600, 0.5),
    (14, "cat-beaute-cheveux", 800, 600, 0.5),
    (15, "cat-telephones-electronique", 800, 600, 0.5),
    (4, "cat-maison", 800, 600, 0.5),
    (5, "cat-services", 800, 600, 0.5),
]


def crop_to_ratio(img, w, h, cx):
    iw, ih = img.size
    target = w / h
    if iw / ih > target:  # trop large : on coupe sur les côtés autour du centre voulu
        cw = int(ih * target)
        left = int(iw * cx - cw / 2)
        left = max(0, min(iw - cw, left))
        return img.crop((left, 0, left + cw, ih))
    ch = int(iw / target)  # trop haut : on coupe en haut et en bas (un peu plus en bas)
    top = max(0, min(ih - ch, int((ih - ch) * 0.35)))
    return img.crop((0, top, iw, top + ch))


for n, name, w, h, cx in JOBS:
    path = f"{SRC}/{n}.webp"
    shutil.copy(path, f"{KEEP}/{n}-{name}.webp")
    img = Image.open(path).convert("RGB")
    img = crop_to_ratio(img, w, h, cx).resize((w, h), Image.LANCZOS)
    q = 78
    while True:
        img.save(f"{OUT}/{name}.webp", "WEBP", quality=q, method=6)
        size = os.path.getsize(f"{OUT}/{name}.webp")
        if size < 150_000 or q <= 50:
            break
        q -= 6
    print(f"{name:32s} {w}x{h}  {size // 1024} Ko (q={q})")
