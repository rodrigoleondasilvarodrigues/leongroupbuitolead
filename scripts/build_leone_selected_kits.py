from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


ROOT = Path("/Users/macbook/Documents/Codex/2026-08-23/eu-x20")
SRC_DIR = ROOT / "outputs" / "leone-group-refined"
OUT_ROOT = ROOT / "outputs"

FONT_PATH = "/System/Library/Fonts/HelveticaNeue.ttc"
FONT = ImageFont.truetype(FONT_PATH, 22, index=0)
FONT_BOLD = ImageFont.truetype(FONT_PATH, 28, index=1)
FONT_BIG = ImageFont.truetype(FONT_PATH, 44, index=1)

IVORY = (247, 243, 234)
INK = (18, 18, 18)

DESIGNS = {
    "A": {
        "name": "Leão em espaço negativo",
        "source": "01-leone-negative-space-solid.png",
        "dark": (22, 22, 22),
        "accent": (225, 88, 24),
        "symbol_box": (80, 80, 1060, 730),
        "wordmark_box": (80, 735, 1180, 1090),
        "primary": "vertical",
        "mockup": "/Users/macbook/.codex/generated_images/01a02f13-5457-7193-845d-3f8eddbed099/exec-01ad6269-81b8-4afc-99c7-b13cf7f1fee1.png",
    },
    "B": {
        "name": "LG em movimento",
        "source": "02-leone-lg-momentum-solid.png",
        "dark": (18, 51, 101),
        "accent": (242, 182, 50),
        "symbol_box": (135, 245, 650, 720),
        "wordmark_box": (665, 245, 1605, 720),
        "primary": "horizontal",
        "mockup": "/Users/macbook/.codex/generated_images/01a02f13-5457-7193-845d-3f8eddbed099/exec-563f5836-a688-4b41-8581-f3e617729df1.png",
    },
    "E": {
        "name": "O leonino integrado",
        "source": "05-leone-integrated-o-solid.png",
        "dark": (16, 60, 50),
        "accent": (242, 169, 0),
        "symbol_box": (504, 30, 821, 390),
        "wordmark_box": (20, 20, 1415, 500),
        "primary": "horizontal",
        "mockup": "/Users/macbook/.codex/generated_images/01a02f13-5457-7193-845d-3f8eddbed099/exec-d5bf12ba-9976-4be9-8093-cdd410e05afc.png",
    },
}


def clean_alpha(im):
    im = im.convert("RGBA")
    a = im.getchannel("A").point(lambda v: 0 if v < 22 else min(255, round((v - 22) * 255 / 233)))
    im.putalpha(a)
    return im


def trim(im, pad=28):
    im = clean_alpha(im)
    strong = im.getchannel("A").point(lambda v: 255 if v > 90 else 0)
    bbox = strong.getbbox()
    if bbox:
        l, t, r, b = bbox
        l, t = max(0, l - pad), max(0, t - pad)
        r, b = min(im.width, r + pad), min(im.height, b + pad)
        im = im.crop((l, t, r, b))
    return im


def fit(im, max_w, max_h):
    im = im.copy()
    scale = min(max_w / im.width, max_h / im.height)
    if scale != 1:
        im = im.resize((max(1, round(im.width * scale)), max(1, round(im.height * scale))), Image.Resampling.LANCZOS)
    return im


def transparent_canvas(width, height):
    return Image.new("RGBA", (width, height), (0, 0, 0, 0))


def centered(im, width, height, padding=80, background=None):
    out = Image.new("RGBA", (width, height), (0, 0, 0, 0) if background is None else (*background, 255))
    placed = fit(im, width - 2 * padding, height - 2 * padding)
    out.alpha_composite(placed, ((width - placed.width) // 2, (height - placed.height) // 2))
    return out


def recolor_all(im, color, opacity=255):
    im = clean_alpha(im)
    alpha = im.getchannel("A").point(lambda v: round(v * opacity / 255))
    out = Image.new("RGBA", im.size, (*color, 0))
    out.putalpha(alpha)
    return out


def inverse_primary(im, dark, replacement=IVORY):
    im = clean_alpha(im)
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a and abs(r - dark[0]) + abs(g - dark[1]) + abs(b - dark[2]) < 90:
                px[x, y] = (*replacement, a)
    return im


def compose_horizontal(symbol, wordmark):
    sym = fit(trim(symbol), 510, 510)
    word = fit(trim(wordmark), 1050, 360)
    gap = 90
    out = transparent_canvas(sym.width + gap + word.width + 100, max(sym.height, word.height) + 120)
    out.alpha_composite(sym, (50, (out.height - sym.height) // 2))
    out.alpha_composite(word, (50 + sym.width + gap, (out.height - word.height) // 2))
    return trim(out, 50)


def compose_vertical(symbol, wordmark):
    sym = fit(trim(symbol), 650, 650)
    word = fit(trim(wordmark), 920, 350)
    gap = 75
    out = transparent_canvas(max(sym.width, word.width) + 120, sym.height + gap + word.height + 120)
    out.alpha_composite(sym, ((out.width - sym.width) // 2, 50))
    out.alpha_composite(word, ((out.width - word.width) // 2, 50 + sym.height + gap))
    return trim(out, 50)


def make_avatar(symbol, dark, accent, light=False, size=1200):
    background = IVORY if light else dark
    logo = symbol if light else inverse_primary(symbol, dark)
    out = Image.new("RGBA", (size, size), (*background, 255))
    placed = fit(trim(logo, 20), round(size * .68), round(size * .68))
    out.alpha_composite(placed, ((size - placed.width) // 2, (size - placed.height) // 2))
    return out


def make_social(horizontal, dark, width=1500, height=500):
    out = Image.new("RGBA", (width, height), (*dark, 255))
    logo = fit(inverse_primary(horizontal, dark), 1160, 300)
    out.alpha_composite(logo, ((width - logo.width) // 2, (height - logo.height) // 2))
    return out


def make_palette(letter, name, dark, accent):
    out = Image.new("RGB", (1500, 850), IVORY)
    d = ImageDraw.Draw(out)
    d.text((90, 70), f"LEONE GROUP — DIREÇÃO {letter}", font=FONT_BIG, fill=INK)
    d.text((90, 130), name.upper(), font=FONT_BOLD, fill=(78, 80, 84))
    colors = [(dark, f"PRINCIPAL  #{dark[0]:02X}{dark[1]:02X}{dark[2]:02X}"), (accent, f"DESTAQUE  #{accent[0]:02X}{accent[1]:02X}{accent[2]:02X}"), (IVORY, "BASE  #F7F3EA")]
    for i, (color, label) in enumerate(colors):
        x = 90 + i * 460
        d.rounded_rectangle((x, 230, x + 400, 650), radius=28, fill=color, outline=(205, 202, 196), width=2)
        label_color = (255, 255, 255) if sum(color) < 380 else INK
        d.text((x + 28, 680), label, font=FONT, fill=INK)
        d.text((x + 28, 590), "Aa", font=FONT_BIG, fill=label_color)
    return out


def make_overview(folder, title, target):
    files = [p for p in sorted(folder.glob("*.png")) if not p.name.startswith("21-")]
    cols, tile_w, tile_h = 4, 480, 490
    rows = (len(files) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * tile_w, 95 + rows * tile_h), (229, 226, 220))
    d = ImageDraw.Draw(sheet)
    d.text((28, 25), title, font=FONT_BIG, fill=INK)
    for i, path in enumerate(files):
        use_dark = any(token in path.name for token in ["escuro", "branca", "capa-social"])
        bg = (25, 28, 30) if use_dark else IVORY
        tile = Image.new("RGBA", (tile_w - 12, tile_h - 12), (*bg, 255))
        im = Image.open(path).convert("RGBA")
        prev = fit(im, tile_w - 80, tile_h - 130)
        tile.alpha_composite(prev, ((tile.width - prev.width) // 2, 22 + (tile_h - 140 - prev.height) // 2))
        td = ImageDraw.Draw(tile)
        label_color = (248, 248, 248) if use_dark else INK
        td.text((18, tile_h - 72), path.stem, font=FONT, fill=label_color)
        x = 6 + (i % cols) * tile_w
        y = 95 + 6 + (i // cols) * tile_h
        sheet.paste(tile.convert("RGB"), (x, y))
    sheet.save(target, quality=94, subsampling=0)


for letter, cfg in DESIGNS.items():
    folder = OUT_ROOT / f"leone-group-{letter.lower()}-brand-kit"
    folder.mkdir(parents=True, exist_ok=True)
    for old in folder.glob("*.png"):
        old.unlink()

    base_raw = clean_alpha(Image.open(SRC_DIR / cfg["source"]))
    base = trim(base_raw, 26)
    symbol = trim(base_raw.crop(cfg["symbol_box"]), 24)
    wordmark = trim(base_raw.crop(cfg["wordmark_box"]), 24)

    if cfg["primary"] == "vertical":
        vertical = base
        horizontal = compose_horizontal(symbol, wordmark)
        primary = vertical
    else:
        horizontal = base
        vertical = compose_vertical(symbol, wordmark)
        primary = horizontal

    inverse = inverse_primary(primary, cfg["dark"])

    primary.save(folder / "01-logo-principal-transparente.png")
    horizontal.save(folder / "02-logo-horizontal-transparente.png")
    vertical.save(folder / "03-logo-vertical-transparente.png")
    centered(primary, 1600, 1100, 130, IVORY).save(folder / "04-logo-principal-fundo-claro.png")
    centered(inverse, 1600, 1100, 130, cfg["dark"]).save(folder / "05-logo-principal-fundo-escuro.png")
    inverse.save(folder / "06-logo-inversa-transparente.png")
    symbol.save(folder / "07-simbolo-transparente.png")
    wordmark.save(folder / "08-wordmark-transparente.png")
    make_avatar(symbol, cfg["dark"], cfg["accent"], light=False).save(folder / "09-foto-perfil-fundo-escuro.png")
    make_avatar(symbol, cfg["dark"], cfg["accent"], light=True).save(folder / "10-foto-perfil-fundo-claro.png")
    recolor_all(primary, (17, 17, 17)).save(folder / "11-logo-monocromatica-preta.png")
    recolor_all(primary, (255, 255, 255)).save(folder / "12-logo-monocromatica-branca.png")
    recolor_all(primary, (17, 17, 17), 46).save(folder / "13-marca-dagua-preta-18pct.png")
    recolor_all(primary, (255, 255, 255), 56).save(folder / "14-marca-dagua-branca-22pct.png")
    recolor_all(symbol, (17, 17, 17), 46).save(folder / "15-marca-dagua-simbolo-preta-18pct.png")
    recolor_all(symbol, (255, 255, 255), 56).save(folder / "16-marca-dagua-simbolo-branca-22pct.png")
    centered(symbol, 512, 512, 60).save(folder / "17-icone-512px-transparente.png")
    centered(symbol, 256, 256, 30).save(folder / "18-icone-256px-transparente.png")
    centered(symbol, 64, 64, 7).save(folder / "19-favicon-64px-transparente.png")
    make_social(horizontal, cfg["dark"]).save(folder / "20-capa-social-fundo-marca.png")
    make_palette(letter, cfg["name"], cfg["dark"], cfg["accent"]).save(folder / "21-paleta-de-cores.png")
    Image.open(cfg["mockup"]).save(folder / "22-aplicacoes-da-marca.png")

    make_overview(folder, f"LEONE GROUP — DIREÇÃO {letter}", OUT_ROOT / f"leone-group-{letter.lower()}-brand-kit-visao-geral.jpg")

print("Kits criados:")
for letter in DESIGNS:
    folder = OUT_ROOT / f"leone-group-{letter.lower()}-brand-kit"
    print(letter, len(list(folder.glob("*.png"))), folder)


# Comparison board for the three selected directions.
board = Image.new("RGB", (2400, 1550), (235, 232, 226))
bd = ImageDraw.Draw(board)
bd.text((70, 50), "LEONE GROUP — DIREÇÕES SELECIONADAS", font=FONT_BIG, fill=INK)
bd.text((70, 112), "A, B e E — sistemas completos de identidade", font=FONT_BOLD, fill=(86, 88, 92))

for i, (letter, cfg) in enumerate(DESIGNS.items()):
    x = 50 + i * 790
    y = 190
    card = Image.new("RGBA", (750, 1290), (255, 255, 255, 255))
    cd = ImageDraw.Draw(card)
    cd.rounded_rectangle((0, 0, 749, 1289), radius=30, outline=(211, 208, 202), width=2)
    cd.text((35, 30), f"DIREÇÃO {letter}", font=FONT_BIG, fill=INK)
    cd.text((35, 88), cfg["name"].upper(), font=FONT_BOLD, fill=(90, 92, 96))
    folder = OUT_ROOT / f"leone-group-{letter.lower()}-brand-kit"
    logo = Image.open(folder / "04-logo-principal-fundo-claro.png").convert("RGBA")
    logo = fit(logo, 660, 440)
    card.alpha_composite(logo, ((750 - logo.width) // 2, 165))
    mockup = Image.open(folder / "22-aplicacoes-da-marca.png").convert("RGBA")
    mockup = fit(mockup, 680, 640)
    card.alpha_composite(mockup, ((750 - mockup.width) // 2, 610))
    board.paste(card.convert("RGB"), (x, y))

board.save(OUT_ROOT / "leone-group-a-b-e-comparativo-final.jpg", quality=94, subsampling=0)
