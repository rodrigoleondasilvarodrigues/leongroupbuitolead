from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import math


ROOT = Path("/Users/macbook/Documents/Codex/2026-08-23/eu-x20")
OUT = ROOT / "outputs"
IVORY = (247, 243, 234)
INK = (18, 18, 18)
WHITE = (255, 255, 255)
MUTED = (116, 115, 111)

FONT_PATH = "/System/Library/Fonts/HelveticaNeue.ttc"


def font(size, bold=False, condensed=False):
    index = 1 if bold else 0
    return ImageFont.truetype(FONT_PATH, size, index=index)


BRANDS = {
    "A": {
        "dark": (22, 22, 22),
        "accent": (225, 88, 24),
        "name": "LEÃO EM ESPAÇO NEGATIVO",
        "mockup": "/Users/macbook/.codex/generated_images/01a02f13-5457-7193-845d-3f8eddbed099/exec-dae91514-bb7e-4522-833a-a405245f3fa0.png",
    },
    "B": {
        "dark": (18, 51, 101),
        "accent": (242, 182, 50),
        "name": "LG EM MOVIMENTO",
        "mockup": "/Users/macbook/.codex/generated_images/01a02f13-5457-7193-845d-3f8eddbed099/exec-00b870fa-d130-4fa2-9765-cc84597a0d4e.png",
    },
    "E": {
        "dark": (16, 60, 50),
        "accent": (242, 169, 0),
        "name": "O LEONINO INTEGRADO",
        "mockup": "/Users/macbook/.codex/generated_images/01a02f13-5457-7193-845d-3f8eddbed099/exec-29e483c8-6b1e-400b-8521-8d85cb8b9af9.png",
    },
}


def fit(im, max_w, max_h):
    im = im.copy().convert("RGBA")
    scale = min(max_w / im.width, max_h / im.height)
    return im.resize((max(1, round(im.width * scale)), max(1, round(im.height * scale))), Image.Resampling.LANCZOS)


def recolor_dark(im, dark, replacement=IVORY):
    im = im.copy().convert("RGBA")
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a and abs(r - dark[0]) + abs(g - dark[1]) + abs(b - dark[2]) < 100:
                px[x, y] = (*replacement, a)
    return im


def recolor_all(im, color, opacity=255):
    im = im.copy().convert("RGBA")
    alpha = im.getchannel("A").point(lambda a: round(a * opacity / 255))
    out = Image.new("RGBA", im.size, (*color, 0))
    out.putalpha(alpha)
    return out


def paste_center(canvas, im, center, max_size):
    placed = fit(im, max_size[0], max_size[1])
    x = round(center[0] - placed.width / 2)
    y = round(center[1] - placed.height / 2)
    canvas.alpha_composite(placed, (x, y))
    return placed


def draw_tracking(draw, xy, text, use_font, fill, tracking=8):
    x, y = xy
    for char in text:
        draw.text((x, y), char, font=use_font, fill=fill)
        box = draw.textbbox((x, y), char, font=use_font)
        x = box[2] + tracking


def draw_centered_multiline(draw, text, center_x, y, use_font, fill, spacing=0):
    lines = text.split("\n")
    current_y = y
    for line in lines:
        box = draw.textbbox((0, 0), line, font=use_font)
        w, h = box[2] - box[0], box[3] - box[1]
        draw.text((center_x - w / 2, current_y), line, font=use_font, fill=fill)
        current_y += h + spacing
    return current_y


def add_corner_motif(canvas, letter, accent, dark, opacity=255):
    d = ImageDraw.Draw(canvas, "RGBA")
    w, h = canvas.size
    if letter == "A":
        d.arc((w - 520, -180, w + 180, 520), 95, 260, fill=(*accent, opacity), width=max(10, w // 95))
        d.arc((w - 420, -80, w + 80, 420), 95, 260, fill=(*accent, max(40, opacity // 2)), width=max(8, w // 130))
        for i in range(3):
            d.polygon([(0, h - 180 + i * 46), (260, h - 260 + i * 46), (330, h - 245 + i * 46), (0, h - 110 + i * 46)], fill=(*accent, max(25, opacity // 4)))
    elif letter == "B":
        origin = (w - 90, 70)
        for i in range(6):
            angle = math.radians(145 + i * 11)
            inner = 120
            outer = 390
            p1 = (origin[0] + math.cos(angle - .045) * inner, origin[1] + math.sin(angle - .045) * inner)
            p2 = (origin[0] + math.cos(angle + .045) * inner, origin[1] + math.sin(angle + .045) * inner)
            p3 = (origin[0] + math.cos(angle + .075) * outer, origin[1] + math.sin(angle + .075) * outer)
            p4 = (origin[0] + math.cos(angle - .075) * outer, origin[1] + math.sin(angle - .075) * outer)
            d.polygon([p1, p2, p3, p4], fill=(*accent, max(35, opacity // 2)))
        d.polygon([(0, h - 110), (330, h - 110), (420, h), (0, h)], fill=(*dark, max(25, opacity // 5)))
    else:
        width = max(9, w // 125)
        d.arc((w - 430, -120, w + 120, 430), 80, 280, fill=(*accent, max(50, opacity // 2)), width=width)
        d.arc((-240, h - 330, 280, h + 190), 255, 70, fill=(*accent, max(35, opacity // 3)), width=width)
        d.ellipse((w - 135, h - 135, w - 65, h - 65), fill=(*accent, max(45, opacity // 2)))


def add_footer_logo(canvas, logo, dark_bg=False, dark=(0, 0, 0), max_w=360, y=None):
    use = recolor_dark(logo, dark) if dark_bg else logo
    placed = fit(use, max_w, 150)
    x = 70
    if y is None:
        y = canvas.height - placed.height - 55
    canvas.alpha_composite(placed, (x, y))


def profile(symbol, dark, accent, size):
    out = Image.new("RGBA", (size, size), (*dark, 255))
    d = ImageDraw.Draw(out, "RGBA")
    margin = round(size * .095)
    d.ellipse((margin, margin, size - margin, size - margin), outline=(*accent, 255), width=max(8, size // 55))
    use = recolor_dark(symbol, dark)
    paste_center(out, use, (size / 2, size / 2), (round(size * .58), round(size * .58)))
    return out


def cover(letter, logo, symbol, dark, accent, size, platform, show_tagline=True):
    w, h = size
    out = Image.new("RGBA", size, (*dark, 255))
    add_corner_motif(out, letter, accent, dark, 230)
    large_symbol = recolor_all(symbol, accent, 28)
    paste_center(out, large_symbol, (w * .86, h * .54), (h * 1.4, h * 1.4))
    use_logo = recolor_dark(logo, dark)
    max_w = {
        "youtube": min(880, w * .38),
        "facebook": min(680, w * .42),
        "linkedin": min(580, w * .36),
        "x": min(620, w * .42),
    }[platform]
    placed = fit(use_logo, max_w, h * .34)
    x = round(w * .5 - placed.width / 2)
    y = round(h * .48 - placed.height / 2)
    out.alpha_composite(placed, (x, y))
    if show_tagline:
        d = ImageDraw.Draw(out)
        tagline_font = font(max(20, round(h * .055)), bold=True)
        tag = "BUILT TO LEAD."
        box = d.textbbox((0, 0), tag, font=tagline_font)
        d.text((w / 2 - (box[2] - box[0]) / 2, y + placed.height + round(h * .055)), tag, font=tagline_font, fill=accent)
    return out


def square_post(letter, logo, symbol, dark, accent, variant):
    size = 1080
    light = variant in {"lead-light", "blank-light"}
    bg = IVORY if light else dark
    fg = dark if light else IVORY
    out = Image.new("RGBA", (size, size), (*bg, 255))
    add_corner_motif(out, letter, accent, dark, 210)
    wm = recolor_all(symbol, accent, 28 if light else 36)
    paste_center(out, wm, (850, 510), (650, 650))
    d = ImageDraw.Draw(out)
    if variant == "welcome":
        draw_centered_multiline(d, "WELCOME TO\nLEONE GROUP", 540, 235, font(83, bold=True), fg, 15)
        draw_tracking(d, (306, 455), "BUILT TO LEAD.", font(25, bold=True), accent, 9)
    elif variant == "lead-light":
        d.text((90, 190), "BUILT", font=font(140, bold=True), fill=dark)
        d.text((90, 335), "TO LEAD.", font=font(140, bold=True), fill=accent)
        d.rectangle((92, 530, 500, 548), fill=dark)
    add_footer_logo(out, logo, dark_bg=not light, dark=dark, max_w=340)
    return out


def portrait_post(letter, logo, symbol, dark, accent, variant):
    w, h = 1080, 1350
    out = Image.new("RGBA", (w, h), (*dark, 255))
    add_corner_motif(out, letter, accent, dark, 240)
    d = ImageDraw.Draw(out)
    if variant == "services":
        y = 245
        for i, word in enumerate(["STRATEGY.", "EXECUTION.", "GROWTH."]):
            fill = accent if i == 2 else IVORY
            d.text((90, y), word, font=font(102, bold=True), fill=fill)
            y += 145
        d.rectangle((92, 720, 470, 738), fill=accent)
    else:
        d.text((90, 175), "01", font=font(42, bold=True), fill=accent)
        draw_centered_multiline(d, "THE\nLEONE\nSTANDARD.", 540, 330, font(125, bold=True), IVORY, 5)
    add_footer_logo(out, logo, dark_bg=True, dark=dark, max_w=380)
    return out


def story(letter, logo, symbol, dark, accent, blank=False, reels=False):
    w, h = 1080, 1920
    out = Image.new("RGBA", (w, h), (*dark, 255))
    add_corner_motif(out, letter, accent, dark, 240)
    wm = recolor_all(symbol, accent, 44)
    paste_center(out, wm, (770, 940), (930, 930))
    d = ImageDraw.Draw(out)
    if not blank:
        headline = "INSIDE\nLEONE" if reels else "BUILT\nTO LEAD."
        draw_centered_multiline(d, headline, 360, 480, font(125, bold=True), IVORY, 12)
        d.rectangle((145, 835, 560, 855), fill=accent)
    add_footer_logo(out, logo, dark_bg=True, dark=dark, max_w=430, y=h - 235)
    return out


def youtube_thumbnail(letter, logo, symbol, dark, accent, blank=False):
    w, h = 1280, 720
    out = Image.new("RGBA", (w, h), (*dark, 255))
    add_corner_motif(out, letter, accent, dark, 235)
    wm = recolor_all(symbol, accent, 65)
    paste_center(out, wm, (1010, 350), (560, 560))
    d = ImageDraw.Draw(out)
    if not blank:
        d.text((70, 170), "GROWTH", font=font(112, bold=True), fill=IVORY)
        d.text((70, 285), "THAT LEADS", font=font(92, bold=True), fill=accent)
        d.rectangle((74, 430, 490, 448), fill=IVORY)
    add_footer_logo(out, logo, dark_bg=True, dark=dark, max_w=280, y=h - 135)
    return out


def highlight(letter, symbol, dark, accent, kind):
    size = 1080
    out = Image.new("RGBA", (size, size), (*dark, 255))
    d = ImageDraw.Draw(out)
    m = 125
    d.ellipse((m, m, size - m, size - m), outline=(*accent, 255), width=18)
    cx, cy = size // 2, 480
    stroke = 26
    color = IVORY
    if kind == "ABOUT":
        d.ellipse((cx - 155, cy - 155, cx + 155, cy + 155), outline=color, width=stroke)
        d.ellipse((cx - 14, cy - 95, cx + 14, cy - 67), fill=color)
        d.line((cx, cy - 30, cx, cy + 100), fill=color, width=stroke)
    elif kind == "SERVICES":
        for offset, length in [(-90, 210), (0, 300), (90, 165)]:
            d.line((cx - length // 2, cy + offset, cx + length // 2, cy + offset), fill=color, width=stroke)
            d.ellipse((cx + length // 4 - 18, cy + offset - 18, cx + length // 4 + 18, cy + offset + 18), fill=accent)
    elif kind == "PROJECTS":
        d.rounded_rectangle((cx - 210, cy - 125, cx + 210, cy + 150), radius=25, outline=color, width=stroke)
        d.polygon([(cx - 180, cy - 125), (cx - 80, cy - 125), (cx - 35, cy - 185), (cx + 80, cy - 185), (cx + 120, cy - 125)], outline=color)
        d.line((cx - 180, cy - 125, cx - 80, cy - 125, cx - 35, cy - 185, cx + 80, cy - 185, cx + 120, cy - 125), fill=color, width=stroke)
    elif kind == "CONTACT":
        d.rounded_rectangle((cx - 225, cy - 145, cx + 225, cy + 145), radius=24, outline=color, width=stroke)
        d.line((cx - 210, cy - 125, cx, cy + 35, cx + 210, cy - 125), fill=color, width=stroke)
    else:
        pts = []
        for i in range(10):
            ang = math.radians(-90 + i * 36)
            radius = 185 if i % 2 == 0 else 78
            pts.append((cx + math.cos(ang) * radius, cy + math.sin(ang) * radius))
        d.polygon(pts, outline=color)
        d.line(pts + [pts[0]], fill=color, width=stroke, joint="curve")
    label_font = font(46, bold=True)
    box = d.textbbox((0, 0), kind, font=label_font)
    d.text((cx - (box[2] - box[0]) / 2, 755), kind, font=label_font, fill=accent)
    return out


def email_signature(logo, symbol, dark, accent):
    w, h = 1200, 350
    out = Image.new("RGBA", (w, h), (*IVORY, 255))
    d = ImageDraw.Draw(out)
    d.rectangle((0, 0, 34, h), fill=accent)
    d.rectangle((450, 62, 454, h - 62), fill=(*dark, 110))
    placed = fit(logo, 360, 170)
    out.alpha_composite(placed, (58, (h - placed.height) // 2))
    d.text((505, 82), "LEONE GROUP", font=font(42, bold=True), fill=dark)
    d.text((505, 145), "STRATEGY  •  EXECUTION  •  GROWTH", font=font(22, bold=True), fill=accent)
    d.text((505, 207), "BUILT TO LEAD.", font=font(26, bold=True), fill=dark)
    return out


def safe_zone_guide(letter, logo, symbol, dark, accent):
    w, h = 1600, 1100
    out = Image.new("RGBA", (w, h), (*IVORY, 255))
    d = ImageDraw.Draw(out)
    d.text((70, 55), f"LEONE GROUP — SOCIAL SAFE ZONES / {letter}", font=font(44, bold=True), fill=dark)
    d.text((70, 112), "Keep the complete mark inside the highlighted areas.", font=font(24), fill=MUTED)
    d.rounded_rectangle((70, 200, 670, 800), radius=34, fill=(*dark, 255))
    d.ellipse((145, 275, 595, 725), outline=(*accent, 255), width=12)
    paste_center(out, recolor_dark(symbol, dark), (370, 500), (300, 300))
    d.text((150, 835), "PROFILE — 1080 × 1080", font=font(25, bold=True), fill=dark)
    d.rounded_rectangle((760, 250, 1530, 683), radius=24, fill=(*dark, 255))
    d.rectangle((913, 400, 1377, 533), outline=(*accent, 255), width=8)
    paste_center(out, recolor_dark(logo, dark), (1145, 466), (360, 95))
    d.text((885, 718), "YOUTUBE — CENTER-SAFE AREA", font=font(25, bold=True), fill=dark)
    d.text((885, 762), "2560 × 1440  |  SAFE: 1546 × 423", font=font(22), fill=MUTED)
    d.text((70, 990), "RULE: use the symbol alone below 180 px; use the horizontal logo on wide covers.", font=font(24, bold=True), fill=dark)
    return out


def mini_guide(letter, logo, symbol, dark, accent, name):
    w, h = 1600, 2000
    out = Image.new("RGBA", (w, h), (*IVORY, 255))
    d = ImageDraw.Draw(out)
    d.text((90, 70), f"LEONE GROUP / SOCIAL SYSTEM {letter}", font=font(48, bold=True), fill=dark)
    d.text((90, 135), name, font=font(26, bold=True), fill=MUTED)
    d.rounded_rectangle((90, 230, 1510, 760), radius=34, fill=WHITE, outline=(215, 211, 204), width=2)
    paste_center(out, logo, (800, 495), (1000, 330))
    d.text((90, 835), "COLOR SYSTEM", font=font(30, bold=True), fill=dark)
    swatches = [(dark, f"#{dark[0]:02X}{dark[1]:02X}{dark[2]:02X}"), (accent, f"#{accent[0]:02X}{accent[1]:02X}{accent[2]:02X}"), (IVORY, "#F7F3EA")]
    for i, (c, label) in enumerate(swatches):
        x = 90 + i * 490
        d.rounded_rectangle((x, 900, x + 420, 1150), radius=25, fill=c, outline=(208, 205, 199), width=2)
        d.text((x, 1175), label, font=font(24, bold=True), fill=dark)
    d.text((90, 1285), "SOCIAL RULES", font=font(30, bold=True), fill=dark)
    rules = [
        "01  USE SOLID COLORS",
        "02  KEEP CLEAR SPACE",
        "03  USE THE SYMBOL AT SMALL SIZES",
        "04  NEVER STRETCH OR DISTORT",
    ]
    y = 1360
    for rule in rules:
        d.rounded_rectangle((90, y, 1510, y + 105), radius=18, fill=WHITE, outline=(220, 216, 210), width=2)
        d.text((125, y + 31), rule, font=font(25, bold=True), fill=dark)
        y += 125
    return out


def overview(folder, title, target):
    files = [p for p in sorted(folder.glob("*.png")) if not p.name.startswith("50-")]
    cols, tile_w, tile_h = 4, 460, 420
    rows = (len(files) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * tile_w, 100 + rows * tile_h), (228, 225, 219))
    d = ImageDraw.Draw(sheet)
    d.text((25, 25), title, font=font(40, bold=True), fill=INK)
    for i, path in enumerate(files):
        im = Image.open(path).convert("RGBA")
        use_dark = any(t in path.name for t in ["perfil", "cover", "banner", "story", "reels", "thumbnail", "dark", "destaque"])
        bg = (28, 30, 32) if use_dark else IVORY
        tile = Image.new("RGBA", (tile_w - 12, tile_h - 12), (*bg, 255))
        prev = fit(im, tile_w - 70, tile_h - 110)
        tile.alpha_composite(prev, ((tile.width - prev.width) // 2, 20 + (tile_h - 120 - prev.height) // 2))
        label_color = WHITE if use_dark else INK
        ImageDraw.Draw(tile).text((16, tile_h - 64), path.stem, font=font(17), fill=label_color)
        sheet.paste(tile.convert("RGB"), (6 + (i % cols) * tile_w, 100 + 6 + (i // cols) * tile_h))
    sheet.save(target, quality=92)


for letter, cfg in BRANDS.items():
    kit = OUT / f"leone-group-{letter.lower()}-brand-kit"
    social = kit / "social-media"
    social.mkdir(exist_ok=True)
    for old in social.glob("*.png"):
        old.unlink()

    logo = Image.open(kit / "02-logo-horizontal-transparente.png").convert("RGBA")
    symbol = Image.open(kit / "07-simbolo-transparente.png").convert("RGBA")
    dark, accent = cfg["dark"], cfg["accent"]

    profile(symbol, dark, accent, 1080).save(social / "23-instagram-perfil-1080.png")
    profile(symbol, dark, accent, 800).save(social / "24-youtube-perfil-800.png")
    profile(symbol, dark, accent, 1080).save(social / "25-whatsapp-perfil-1080.png")
    profile(symbol, dark, accent, 1080).save(social / "26-facebook-perfil-1080.png")
    cover(letter, logo, symbol, dark, accent, (2560, 1440), "youtube").save(social / "27-youtube-banner-2560x1440.png")
    cover(letter, logo, symbol, dark, accent, (1640, 624), "facebook").save(social / "28-facebook-cover-1640x624.png")
    cover(letter, logo, symbol, dark, accent, (1584, 396), "linkedin").save(social / "29-linkedin-cover-1584x396.png")
    cover(letter, logo, symbol, dark, accent, (1500, 500), "x").save(social / "30-x-cover-1500x500.png")
    square_post(letter, logo, symbol, dark, accent, "welcome").save(social / "31-instagram-post-welcome-1080.png")
    square_post(letter, logo, symbol, dark, accent, "lead-light").save(social / "32-instagram-post-built-to-lead-1080.png")
    square_post(letter, logo, symbol, dark, accent, "blank-dark").save(social / "33-instagram-post-modelo-escuro-1080.png")
    square_post(letter, logo, symbol, dark, accent, "blank-light").save(social / "34-instagram-post-modelo-claro-1080.png")
    portrait_post(letter, logo, symbol, dark, accent, "services").save(social / "35-instagram-post-servicos-1080x1350.png")
    portrait_post(letter, logo, symbol, dark, accent, "carousel").save(social / "36-instagram-carrossel-capa-1080x1350.png")
    story(letter, logo, symbol, dark, accent).save(social / "37-instagram-story-built-to-lead-1080x1920.png")
    story(letter, logo, symbol, dark, accent, blank=True).save(social / "38-instagram-story-modelo-limpo-1080x1920.png")
    story(letter, logo, symbol, dark, accent, reels=True).save(social / "39-reels-capa-inside-leone-1080x1920.png")
    youtube_thumbnail(letter, logo, symbol, dark, accent).save(social / "40-youtube-thumbnail-growth-1280x720.png")
    youtube_thumbnail(letter, logo, symbol, dark, accent, blank=True).save(social / "41-youtube-thumbnail-modelo-limpo-1280x720.png")
    for num, kind in enumerate(["ABOUT", "SERVICES", "PROJECTS", "CONTACT", "REVIEWS"], start=42):
        highlight(letter, symbol, dark, accent, kind).save(social / f"{num:02d}-instagram-destaque-{kind.lower()}-1080.png")
    email_signature(logo, symbol, dark, accent).save(social / "47-assinatura-email-1200x350.png")
    watermark = recolor_dark(symbol, dark)
    watermark = fit(watermark, 120, 120)
    centered = Image.new("RGBA", (150, 150), (0, 0, 0, 0))
    centered.alpha_composite(watermark, ((150 - watermark.width) // 2, (150 - watermark.height) // 2))
    centered.save(social / "48-youtube-video-watermark-150.png")
    safe_zone_guide(letter, logo, symbol, dark, accent).save(social / "49-guia-areas-seguras-redes.png")
    mini_guide(letter, logo, symbol, dark, accent, cfg["name"]).save(social / "50-mini-guia-social-media.png")
    Image.open(cfg["mockup"]).save(social / "51-aplicacao-real-youtube-instagram.png")
    cover(letter, logo, symbol, dark, accent, (2560, 1440), "youtube", show_tagline=False).save(social / "52-youtube-banner-sem-slogan-2560x1440.png")
    cover(letter, logo, symbol, dark, accent, (1640, 624), "facebook", show_tagline=False).save(social / "53-facebook-cover-sem-slogan-1640x624.png")
    cover(letter, logo, symbol, dark, accent, (1584, 396), "linkedin", show_tagline=False).save(social / "54-linkedin-cover-sem-slogan-1584x396.png")
    cover(letter, logo, symbol, dark, accent, (1500, 500), "x", show_tagline=False).save(social / "55-x-cover-sem-slogan-1500x500.png")

    overview(social, f"LEONE GROUP — SOCIAL MEDIA / {letter}", OUT / f"leone-group-{letter.lower()}-social-media-visao-geral.jpg")
    print(letter, len(list(social.glob("*.png"))), social)


# Compact three-direction social comparison board.
board = Image.new("RGB", (2400, 1720), (233, 230, 224))
bd = ImageDraw.Draw(board)
bd.text((60, 45), "LEONE GROUP — SOCIAL MEDIA SYSTEMS", font=font(52, bold=True), fill=INK)
bd.text((60, 112), "Directions A, B and E", font=font(28, bold=True), fill=MUTED)

for i, (letter, cfg) in enumerate(BRANDS.items()):
    x = 45 + i * 790
    kit = OUT / f"leone-group-{letter.lower()}-brand-kit"
    social = kit / "social-media"
    card = Image.new("RGBA", (755, 1480), (255, 255, 255, 255))
    cd = ImageDraw.Draw(card)
    cd.rounded_rectangle((0, 0, 754, 1479), radius=30, outline=(211, 208, 202), width=2)
    cd.text((32, 26), f"DIRECTION {letter}", font=font(40, bold=True), fill=cfg["dark"])
    cd.text((32, 78), cfg["name"], font=font(21, bold=True), fill=MUTED)
    banner = fit(Image.open(social / "27-youtube-banner-2560x1440.png"), 690, 390)
    card.alpha_composite(banner, ((755 - banner.width) // 2, 140))
    post = fit(Image.open(social / "31-instagram-post-welcome-1080.png"), 325, 325)
    story_img = fit(Image.open(social / "37-instagram-story-built-to-lead-1080x1920.png"), 325, 580)
    card.alpha_composite(post, (35, 575))
    card.alpha_composite(story_img, (395, 575))
    thumb = fit(Image.open(social / "40-youtube-thumbnail-growth-1280x720.png"), 690, 390)
    card.alpha_composite(thumb, ((755 - thumb.width) // 2, 1030))
    board.paste(card.convert("RGB"), (x, 190))

board.save(OUT / "leone-group-a-b-e-social-media-comparativo.jpg", quality=94, subsampling=0)
