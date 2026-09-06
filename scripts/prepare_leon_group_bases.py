from pathlib import Path
from PIL import Image
import colorsys


ROOT = Path("/Users/macbook/Documents/Codex/2026-08-23/eu-x20")
SRC = ROOT / "outputs" / "leon-group-refined"

CONFIG = {
    "A": {"dark": (22, 22, 22), "accent": (225, 88, 24)},
    "B": {"dark": (18, 51, 101), "accent": (242, 182, 50)},
    "E": {"dark": (16, 60, 50), "accent": (242, 169, 0)},
}


def clamp(value):
    return max(0, min(255, round(value)))


for letter, cfg in CONFIG.items():
    im = Image.open(SRC / f"{letter}-leon-group-raw.png").convert("RGB")
    out = Image.new("RGBA", im.size, (0, 0, 0, 0))
    src = im.load()
    dst = out.load()

    for y in range(im.height):
        for x in range(im.width):
            r, g, b = src[x, y]
            avg = (r + g + b) / 3
            mx, mn = max(r, g, b), min(r, g, b)
            saturation = 0 if mx == 0 else (mx - mn) / mx

            darkness_alpha = clamp((222 - avg) * 255 / 82)
            color_alpha = clamp((saturation - 0.10) * 255 / 0.24)
            alpha = max(darkness_alpha, color_alpha)

            if letter == "A":
                is_accent = r > g * 1.28 and r > b * 1.45
            elif letter == "B":
                is_accent = r > b * 1.30 and g > b * 1.05
            else:
                is_accent = r > g * 1.08 and r > b * 1.75

            if alpha < 18:
                dst[x, y] = (0, 0, 0, 0)
            else:
                color = cfg["accent"] if is_accent else cfg["dark"]
                dst[x, y] = (*color, alpha)

    strong = out.getchannel("A").point(lambda v: 255 if v > 90 else 0)
    bbox = strong.getbbox()
    if bbox:
        l, t, r, b = bbox
        pad = 30
        out = out.crop((max(0, l - pad), max(0, t - pad), min(out.width, r + pad), min(out.height, b + pad)))
    out.save(SRC / f"{letter}-leon-group-solid.png")
    print(letter, out.size, out.getbbox())

