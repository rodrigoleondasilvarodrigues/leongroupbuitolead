from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


ROOT = Path("/Users/macbook/Documents/Codex/2026-08-23/eu-x20")
SRC = ROOT / "outputs" / "leon-group-refined"
OUT = ROOT / "outputs"
IVORY = (247, 243, 234)
INK = (18, 18, 18)
FONT_PATH = "/System/Library/Fonts/HelveticaNeue.ttc"


def font(size, bold=False):
    return ImageFont.truetype(FONT_PATH, size, index=1 if bold else 0)


DESIGNS = {
    "A": {
        "name": "Leão em espaço negativo",
        "source": "A-leon-group-solid.png",
        "dark": (22, 22, 22),
        "accent": (225, 88, 24),
        "symbol_box": (170, 10, 970, 740),
        "wordmark_box": (0, 740, 1094, 1157),
        "primary": "vertical",
    },
    "B": {
        "name": "LG em movimento",
        "source": "B-leon-group-solid.png",
        "dark": (18, 51, 101),
        "accent": (242, 182, 50),
        "symbol_box": (0, 0, 730, 663),
        "wordmark_box": (780, 130, 2018, 663),
        "primary": "horizontal",
    },
    "E": {
        "name": "O leonino integrado",
        "source": "E-leon-group-solid.png",
        "dark": (16, 60, 50),
        "accent": (242, 169, 0),
        "symbol_box": (730, 0, 1210, 505),
        "wordmark_box": (0, 0, 1721, 650),
        "primary": "horizontal",
    },
}


def clean_alpha(im):
    im = im.convert("RGBA")
    a = im.getchannel("A").point(lambda v: 0 if v < 18 else min(255, round((v - 18) * 255 / 237)))
    im.putalpha(a)
    return im


def trim(im, pad=28):
    im = clean_alpha(im)
    strong = im.getchannel("A").point(lambda v: 255 if v > 90 else 0)
    bbox = strong.getbbox()
    if bbox:
        l, t, r, b = bbox
        im = im.crop((max(0, l - pad), max(0, t - pad), min(im.width, r + pad), min(im.height, b + pad)))
    return im


def fit(im, max_w, max_h):
    im = im.copy().convert("RGBA")
    scale = min(max_w / im.width, max_h / im.height)
    return im.resize((max(1, round(im.width * scale)), max(1, round(im.height * scale))), Image.Resampling.LANCZOS)


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


def inverse(im, dark):
    im = clean_alpha(im)
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a and abs(r - dark[0]) + abs(g - dark[1]) + abs(b - dark[2]) < 100:
                px[x, y] = (*IVORY, a)
    return im


def horizontal(symbol, wordmark):
    sym = fit(trim(symbol), 520, 520)
    word = fit(trim(wordmark), 1020, 360)
    out = Image.new("RGBA", (sym.width + word.width + 210, max(sym.height, word.height) + 120), (0, 0, 0, 0))
    out.alpha_composite(sym, (50, (out.height - sym.height) // 2))
    out.alpha_composite(word, (160 + sym.width, (out.height - word.height) // 2))
    return trim(out, 45)


def vertical(symbol, wordmark):
    sym = fit(trim(symbol), 650, 650)
    word = fit(trim(wordmark), 930, 350)
    out = Image.new("RGBA", (max(sym.width, word.width) + 120, sym.height + word.height + 250), (0, 0, 0, 0))
    out.alpha_composite(sym, ((out.width - sym.width) // 2, 50))
    out.alpha_composite(word, ((out.width - word.width) // 2, 150 + sym.height))
    return trim(out, 45)


def avatar(symbol, dark, light=False, size=1200):
    bg = IVORY if light else dark
    use = symbol if light else inverse(symbol, dark)
    out = Image.new("RGBA", (size, size), (*bg, 255))
    placed = fit(trim(use), round(size * .68), round(size * .68))
    out.alpha_composite(placed, ((size - placed.width) // 2, (size - placed.height) // 2))
    return out


def social_cover(logo, dark, width=1500, height=500):
    out = Image.new("RGBA", (width, height), (*dark, 255))
    placed = fit(inverse(logo, dark), 1120, 280)
    out.alpha_composite(placed, ((width - placed.width) // 2, (height - placed.height) // 2))
    return out


def palette(letter, cfg):
    out = Image.new("RGB", (1500, 850), IVORY)
    d = ImageDraw.Draw(out)
    d.text((90, 70), f"LEON GROUP — DIREÇÃO {letter}", font=font(44, True), fill=INK)
    d.text((90, 132), cfg["name"].upper(), font=font(27, True), fill=(80, 82, 86))
    colors = [(cfg["dark"], "PRINCIPAL"), (cfg["accent"], "DESTAQUE"), (IVORY, "BASE")]
    for i, (color, label) in enumerate(colors):
        x = 90 + i * 460
        d.rounded_rectangle((x, 230, x + 400, 650), radius=28, fill=color, outline=(205, 202, 196), width=2)
        text_color = (255, 255, 255) if sum(color) < 380 else INK
        d.text((x + 28, 570), "Aa", font=font(54, True), fill=text_color)
        d.text((x + 28, 680), f"{label}  #{color[0]:02X}{color[1]:02X}{color[2]:02X}", font=font(22, True), fill=INK)
    return out


def overview(folder, letter, target):
    files = sorted(folder.glob("*.png"))
    cols, tw, th = 4, 480, 490
    rows = (len(files) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * tw, 95 + rows * th), (229, 226, 220))
    d = ImageDraw.Draw(sheet)
    d.text((28, 25), f"LEON GROUP — DIREÇÃO {letter}", font=font(44, True), fill=INK)
    for i, path in enumerate(files):
        use_dark = any(t in path.name for t in ["escuro", "branca", "capa-social"])
        bg = (25, 28, 30) if use_dark else IVORY
        tile = Image.new("RGBA", (tw - 12, th - 12), (*bg, 255))
        im = fit(Image.open(path), tw - 80, th - 130)
        tile.alpha_composite(im, ((tile.width - im.width) // 2, 22 + (th - 140 - im.height) // 2))
        ImageDraw.Draw(tile).text((18, th - 72), path.stem, font=font(20), fill=(250, 250, 250) if use_dark else INK)
        sheet.paste(tile.convert("RGB"), (6 + (i % cols) * tw, 101 + (i // cols) * th))
    sheet.save(target, quality=94)


for letter, cfg in DESIGNS.items():
    folder = OUT / f"leon-group-{letter.lower()}-brand-kit"
    folder.mkdir(parents=True, exist_ok=True)
    for old in folder.glob("*.png"):
        old.unlink()

    raw = clean_alpha(Image.open(SRC / cfg["source"]))
    base = trim(raw)
    symbol = trim(raw.crop(cfg["symbol_box"]), 22)
    wordmark = trim(raw.crop(cfg["wordmark_box"]), 22)
    if cfg["primary"] == "vertical":
        logo_v = base
        logo_h = horizontal(symbol, wordmark)
        primary = logo_v
    else:
        logo_h = base
        logo_v = vertical(symbol, wordmark)
        primary = logo_h
    inv = inverse(primary, cfg["dark"])

    primary.save(folder / "01-logo-principal-transparente.png")
    logo_h.save(folder / "02-logo-horizontal-transparente.png")
    logo_v.save(folder / "03-logo-vertical-transparente.png")
    centered(primary, 1600, 1100, 130, IVORY).save(folder / "04-logo-principal-fundo-claro.png")
    centered(inv, 1600, 1100, 130, cfg["dark"]).save(folder / "05-logo-principal-fundo-escuro.png")
    inv.save(folder / "06-logo-inversa-transparente.png")
    symbol.save(folder / "07-simbolo-transparente.png")
    wordmark.save(folder / "08-wordmark-transparente.png")
    avatar(symbol, cfg["dark"], False).save(folder / "09-foto-perfil-fundo-escuro.png")
    avatar(symbol, cfg["dark"], True).save(folder / "10-foto-perfil-fundo-claro.png")
    recolor_all(primary, (17, 17, 17)).save(folder / "11-logo-monocromatica-preta.png")
    recolor_all(primary, (255, 255, 255)).save(folder / "12-logo-monocromatica-branca.png")
    recolor_all(primary, (17, 17, 17), 46).save(folder / "13-marca-dagua-preta-18pct.png")
    recolor_all(primary, (255, 255, 255), 56).save(folder / "14-marca-dagua-branca-22pct.png")
    recolor_all(symbol, (17, 17, 17), 46).save(folder / "15-marca-dagua-simbolo-preta-18pct.png")
    recolor_all(symbol, (255, 255, 255), 56).save(folder / "16-marca-dagua-simbolo-branca-22pct.png")
    centered(symbol, 512, 512, 60).save(folder / "17-icone-512px-transparente.png")
    centered(symbol, 256, 256, 30).save(folder / "18-icone-256px-transparente.png")
    centered(symbol, 64, 64, 7).save(folder / "19-favicon-64px-transparente.png")
    social_cover(logo_h, cfg["dark"]).save(folder / "20-capa-social-fundo-marca.png")
    palette(letter, cfg).save(folder / "21-paleta-de-cores.png")
    overview(folder, letter, OUT / f"leon-group-{letter.lower()}-brand-kit-visao-geral.jpg")
    print(letter, len(list(folder.glob("*.png"))), folder)


board = Image.new("RGB", (2400, 1050), (235, 232, 226))
bd = ImageDraw.Draw(board)
bd.text((60, 42), "LEON GROUP — DIREÇÕES A, B E E", font=font(52, True), fill=INK)
for i, (letter, cfg) in enumerate(DESIGNS.items()):
    x = 50 + i * 790
    card = Image.new("RGBA", (750, 850), (255, 255, 255, 255))
    cd = ImageDraw.Draw(card)
    cd.rounded_rectangle((0, 0, 749, 849), radius=30, outline=(211, 208, 202), width=2)
    cd.text((34, 28), f"DIREÇÃO {letter}", font=font(42, True), fill=cfg["dark"])
    cd.text((34, 83), cfg["name"].upper(), font=font(24, True), fill=(88, 90, 94))
    logo = Image.open(OUT / f"leon-group-{letter.lower()}-brand-kit" / "04-logo-principal-fundo-claro.png")
    placed = fit(logo, 660, 620)
    card.alpha_composite(placed, ((750 - placed.width) // 2, 170))
    board.paste(card.convert("RGB"), (x, 150))
board.save(OUT / "leon-group-a-b-e-comparativo.jpg", quality=94)

