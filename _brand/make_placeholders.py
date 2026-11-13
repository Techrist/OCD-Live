"""Images provisoires (dégradés cuivre / ambre avec une silhouette) aux noms définitifs.
Remplace chaque fichier de public/images/ par la vraie photo (même nom, même format .webp)."""
import os
from PIL import Image, ImageDraw, ImageFilter

OUT = "public/images"
os.makedirs(OUT, exist_ok=True)

# nom -> (largeur, hauteur, couleur haut, couleur bas, silhouette)
SPECS = {
    "hero-1": (600, 800, "#C76524", "#F6B24A", True),
    "hero-2": (600, 800, "#9A4311", "#E8913F", True),
    "hero-3": (600, 800, "#E8913F", "#FBE3B5", True),
    "hero-4": (600, 800, "#7A3510", "#C76524", True),
    "hero-5": (600, 800, "#C76524", "#FBE3B5", True),
    "cat-nourriture": (800, 600, "#C76524", "#F6B24A", False),
    "cat-mode": (800, 600, "#9A4311", "#E8913F", False),
    "cat-chaussures-sacs": (800, 600, "#7A3510", "#C76524", False),
    "cat-beaute-cheveux": (800, 600, "#E8913F", "#FBE3B5", False),
    "cat-telephones-electronique": (800, 600, "#0A0A10", "#7A3510", False),
    "cat-maison": (800, 600, "#C76524", "#FBE3B5", False),
    "cat-services": (800, 600, "#9A4311", "#F6B24A", False),
    "cat-autre": (800, 600, "#7A3510", "#E8913F", False),
    "step-1": (800, 1000, "#C76524", "#FBE3B5", True),
    "step-2": (800, 1000, "#9A4311", "#F6B24A", True),
    "step-3": (800, 1000, "#7A3510", "#E8913F", True),
    "why-1": (900, 700, "#C76524", "#F6B24A", True),
    "why-2": (900, 700, "#9A4311", "#FBE3B5", True),
    "studio": (1400, 900, "#7A3510", "#E8913F", False),
}


def hex_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def make(name, w, h, top, bottom, figure):
    a, b = hex_rgb(top), hex_rgb(bottom)
    img = Image.new("RGB", (w, h))
    px = img.load()
    for y in range(h):
        t = y / (h - 1)
        row = tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))
        for x in range(w):
            px[x, y] = row
    over = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(over)
    d.ellipse((w * 0.62, h * 0.05, w * 1.2, h * 0.55), fill=(255, 255, 255, 40))  # halo
    if figure:
        cx = w * 0.5
        d.ellipse((cx - w * 0.14, h * 0.28, cx + w * 0.14, h * 0.28 + w * 0.28), fill=(10, 10, 16, 70))  # tête
        d.ellipse((cx - w * 0.34, h * 0.28 + w * 0.3, cx + w * 0.34, h * 1.05), fill=(10, 10, 16, 70))  # épaules
    over = over.filter(ImageFilter.GaussianBlur(2))
    img = Image.alpha_composite(img.convert("RGBA"), over).convert("RGB")
    img.save(os.path.join(OUT, f"{name}.webp"), "WEBP", quality=70)


for n, (w, h, t, b, f) in SPECS.items():
    make(n, w, h, t, b, f)
print(len(SPECS), "images provisoires dans", OUT)
