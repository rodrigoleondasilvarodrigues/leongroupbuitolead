from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import math


ROOT = Path("/Users/macbook/Documents/Codex/2026-08-23/eu-x20")
OUT = ROOT / "outputs" / "leone-group-refined"

SOURCES = [
    ("01-leone-negative-space.png", "01-leone-negative-space-solid.png", ((22, 22, 22), (225, 88, 24))),
    ("02-leone-lg-momentum.png", "02-leone-lg-momentum-solid.png", ((18, 51, 101), (242, 182, 50))),
    ("03-leone-authority-mark.png", "03-leone-authority-mark-solid.png", ((10, 58, 43), (231, 74, 50))),
    ("04-leone-eye-wordmark.png", "04-leone-eye-wordmark-solid.png", ((13, 59, 120), (237, 54, 45))),
    ("05-leone-integrated-o.png", "05-leone-integrated-o-solid.png", ((16, 60, 50), (242, 169, 0))),
]


def foreground_alpha_from_ivory(rgb):
    bg = (248, 244, 237)
    distance = math.sqrt(sum((rgb[i] - bg[i]) ** 2 for i in range(3)))
    return max(0, min(255, int((distance - 5) * 255 / 65)))


def foreground_alpha_option_b(rgb):
    bg = (251, 243, 232)
    distance = math.sqrt(sum((rgb[i] - bg[i]) ** 2 for i in range(3)))
    return max(0, min(255, int((distance - 25) * 255 / 55)))


def flatten(source_name, dest_name, dark, accent):
    im = Image.open(OUT / source_name).convert("RGBA")
    px = im.load()
    has_transparency = im.getextrema()[3][0] < 255

    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if source_name.startswith("02-"):
                a = foreground_alpha_option_b((r, g, b))
                is_accent = r > b * 1.45 and g > b * 1.25
            elif source_name.startswith("01-"):
                is_accent = r > g * 1.35 and r > b * 1.7
            elif source_name.startswith("03-"):
                is_accent = r > g * 1.5 and r > b * 1.5
            elif source_name.startswith("05-"):
                a = foreground_alpha_from_ivory((r, g, b))
                is_accent = r > g * 1.08 and r > b * 1.8 and g > b * 1.4
            else:
                is_accent = r > b * 1.25 and r > g * 1.3
            if a == 0:
                px[x, y] = (0, 0, 0, 0)
            else:
                color = accent if is_accent else dark
                px[x, y] = (*color, a)

    bbox = im.getbbox()
    if bbox:
        left, top, right, bottom = bbox
        pad = max(24, int(max(right - left, bottom - top) * 0.035))
        crop_box = (
            max(0, left - pad),
            max(0, top - pad),
            min(im.width, right + pad),
            min(im.height, bottom + pad),
        )
        im = im.crop(crop_box)
    im.save(OUT / dest_name)


for source_name, dest_name, palette in SOURCES:
    flatten(source_name, dest_name, *palette)


def fit_rgba(im, max_w, max_h):
    scale = min(max_w / im.width, max_h / im.height)
    return im.resize((max(1, int(im.width * scale)), max(1, int(im.height * scale))), Image.Resampling.LANCZOS)


canvas = Image.new("RGB", (2200, 2320), (244, 240, 232))
draw = ImageDraw.Draw(canvas)
font_path = "/System/Library/Fonts/HelveticaNeue.ttc"
title_font = ImageFont.truetype(font_path, 58, index=1)
label_font = ImageFont.truetype(font_path, 30, index=1)
desc_font = ImageFont.truetype(font_path, 23, index=0)

draw.text((110, 72), "LEONE GROUP", font=title_font, fill=(20, 24, 31))
draw.text((110, 145), "NOVAS DIREÇÕES — CORES SÓLIDAS", font=label_font, fill=(88, 91, 97))

cards = [
    ("A", "LEÃO EM ESPAÇO NEGATIVO", "Mais expressiva e diretamente ligada ao nome"),
    ("B", "LG EM MOVIMENTO", "Mais corporativa, moderna e expansiva"),
    ("C", "AUTORIDADE GEOMÉTRICA", "Mais forte, institucional e imponente"),
    ("D", "WORDMARK OLHO LEONINO", "Mais autoral, dinâmica e memorável"),
    ("E", "O LEONINO INTEGRADO", "Mais sofisticada, direta e proprietária"),
]

for index, (letter, name, desc) in enumerate(cards):
    col = index % 2
    row = index // 2
    x = 90 + col * 1030
    if index == 4:
        x = 605
    y = 245 + row * 700
    w, h = 950, 620
    draw.rounded_rectangle((x, y, x + w, y + h), radius=30, fill=(255, 255, 255), outline=(218, 214, 207), width=2)
    draw.ellipse((x + 38, y + 34, x + 102, y + 98), fill=(22, 22, 22))
    letter_box = draw.textbbox((0, 0), letter, font=label_font)
    letter_w = letter_box[2] - letter_box[0]
    letter_h = letter_box[3] - letter_box[1]
    draw.text((x + 70 - letter_w / 2, y + 66 - letter_h / 2 - 3), letter, font=label_font, fill=(255, 255, 255))
    draw.text((x + 125, y + 43), name, font=label_font, fill=(24, 27, 33))
    draw.text((x + 125, y + 82), desc, font=desc_font, fill=(100, 102, 108))

    img = Image.open(OUT / SOURCES[index][1]).convert("RGBA")
    fitted = fit_rgba(img, 820, 430)
    px = x + (w - fitted.width) // 2
    py = y + 155 + (430 - fitted.height) // 2
    canvas.paste(fitted, (px, py), fitted)

comparison = OUT / "leone-group-refined-comparativo.jpg"
canvas.save(comparison, quality=94, subsampling=0)
