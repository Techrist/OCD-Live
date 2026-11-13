"""Remplace les portraits générés par l'IA (carrousel du héros et étapes) par les photos réelles fournies."""
import os
from PIL import Image

SRC = "C:/Users/tenim/AppData/Local/Temp/claude/b3b96244fed573b8/627657ed-f658-47da-9b72-7199ce649268/images"
OUT = "public/images"


def open_img(n):
    for ext in ("webp", "png"):
        p = f"{SRC}/{n}.{ext}"
        if os.path.exists(p):
            return Image.open(p).convert("RGB")
    raise FileNotFoundError(n)


def crop_ratio(im, ratio, cx=0.5, cy=0.5):
    w, h = im.size
    if w / h > ratio:
        nw, nh = int(h * ratio), h
    else:
        nw, nh = w, int(w / ratio)
    x = min(max(int(cx * w - nw / 2), 0), w - nw)
    y = min(max(int(cy * h - nh / 2), 0), h - nh)
    return im.crop((x, y, x + nw, y + nh))


def save(im, name, scale=1.0):
    if scale != 1.0:
        im = im.resize((int(im.width * scale), int(im.height * scale)), Image.LANCZOS)
    path = f"{OUT}/{name}.webp"
    im.save(path, "WEBP", quality=85, method=6)
    print(name, im.size, os.path.getsize(path) // 1024, "Ko")


# Carrousel du héros (3:4) : la carte du centre est hero-3.
HERO = {"hero-1": (55, 0.5, 0.5), "hero-2": (54, 0.5, 0.4), "hero-3": (52, 0.5, 0.45), "hero-4": (57, 0.5, 0.5), "hero-5": (53, 0.5, 0.42)}
for name, (n, cx, cy) in HERO.items():
    save(crop_ratio(open_img(n), 3 / 4, cx, cy), name, 1.2)

# Étapes (4:5) : choisir son tissu / produit, vendre dans la rue, présenter son produit.
STEPS = {"step-1": (59, 0.45, 0.5, 2.0), "step-2": (56, 0.5, 0.4, 1.4), "step-3": (58, 0.55, 0.5, 2.0)}
for name, (n, cx, cy, sc) in STEPS.items():
    save(crop_ratio(open_img(n), 4 / 5, cx, cy), name, sc)
