from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import shutil


ROOT = Path("/Users/macbook/Documents/Codex/2026-08-23/eu-x20")
OUTPUTS = ROOT / "outputs"
SOURCE = OUTPUTS / "leon-group-e-paleta-a-brand-kit"
SOCIAL = SOURCE / "social-media"
COMPANY = OUTPUTS / "LEON-GROUP"

BRAND = COMPANY / "01-BRAND-KIT-OFICIAL"
YOUTUBE = COMPANY / "02-YOUTUBE"
INSTAGRAM = COMPANY / "03-INSTAGRAM"
FACEBOOK = COMPANY / "04-FACEBOOK"
GENERAL = COMPANY / "05-MATERIAIS-GERAIS"

for folder in (BRAND, YOUTUBE, INSTAGRAM, FACEBOOK, GENERAL):
    folder.mkdir(parents=True, exist_ok=True)


def copy(source, target):
    shutil.copy2(source, target)


# Official identity masters.
for source in sorted(SOURCE.glob("*.png")):
    copy(source, BRAND / source.name)


# YouTube: exact platform dimensions.
copy(SOCIAL / "24-youtube-perfil-800.png", YOUTUBE / "01-foto-perfil-800x800.png")
profile = Image.open(SOCIAL / "24-youtube-perfil-800.png").convert("RGBA")
profile.resize((98, 98), Image.Resampling.LANCZOS).save(
    YOUTUBE / "02-foto-perfil-98x98.png", optimize=True
)

def fit(image, max_width, max_height):
    scale = min(max_width / image.width, max_height / image.height)
    return image.resize(
        (max(1, round(image.width * scale)), max(1, round(image.height * scale))),
        Image.Resampling.LANCZOS,
    )


def solid_silhouette(image, color, opacity):
    image = image.convert("RGBA")
    alpha = image.getchannel("A").point(lambda value: round(value * opacity / 255))
    result = Image.new("RGBA", image.size, (*color, 0))
    result.putalpha(alpha)
    return result


def youtube_banner(show_tagline):
    width, height = 2560, 1440
    safe_width, safe_height = 1235, 338
    safe_left = (width - safe_width) // 2
    safe_top = (height - safe_height) // 2
    canvas = Image.new("RGBA", (width, height), (22, 22, 22, 255))

    # Decorative elements remain outside the information hierarchy.
    symbol = Image.open(SOURCE / "07-simbolo-transparente.png")
    watermark = fit(solid_silhouette(symbol, (72, 39, 25), 205), 920, 920)
    canvas.alpha_composite(watermark, (width - watermark.width + 110, 250))
    decor = ImageDraw.Draw(canvas, "RGBA")
    decor.arc((width - 630, -220, width + 150, 560), 75, 270, fill=(225, 88, 24, 255), width=18)
    decor.arc((-320, height - 430, 330, height + 220), 250, 70, fill=(225, 88, 24, 255), width=16)
    decor.ellipse((width - 210, height - 210, width - 135, height - 135), fill=(225, 88, 24, 255))

    logo = Image.open(SOURCE / "06-logo-inversa-transparente.png").convert("RGBA")
    if show_tagline:
        placed = fit(logo, 700, 205)
        logo_y = safe_top + 18
    else:
        placed = fit(logo, 820, 260)
        logo_y = safe_top + (safe_height - placed.height) // 2
    logo_x = (width - placed.width) // 2
    canvas.alpha_composite(placed, (logo_x, logo_y))

    if show_tagline:
        font_path = "/System/Library/Fonts/HelveticaNeue.ttc"
        tagline_font = ImageFont.truetype(font_path, 48, index=1)
        tagline = "BUILT TO LEAD."
        draw = ImageDraw.Draw(canvas)
        box = draw.textbbox((0, 0), tagline, font=tagline_font)
        text_width = box[2] - box[0]
        text_y = safe_top + safe_height - 67
        draw.text(
            ((width - text_width) / 2, text_y),
            tagline,
            font=tagline_font,
            fill=(225, 88, 24, 255),
        )
    return canvas


banner = youtube_banner(True)
banner.save(YOUTUBE / "03-banner-2560x1440-com-slogan.png", optimize=True)
youtube_banner(False).save(YOUTUBE / "04-banner-2560x1440-sem-slogan.png", optimize=True)

# Safe-area guide using the stricter 1235 × 338 region requested by the user.
guide = banner.copy()
overlay = Image.new("RGBA", guide.size, (0, 0, 0, 0))
draw = ImageDraw.Draw(overlay, "RGBA")
safe_w, safe_h = 1235, 338
left = (guide.width - safe_w) // 2
top = (guide.height - safe_h) // 2
right = left + safe_w
bottom = top + safe_h
draw.rectangle((0, 0, guide.width, top), fill=(0, 0, 0, 120))
draw.rectangle((0, bottom, guide.width, guide.height), fill=(0, 0, 0, 120))
draw.rectangle((0, top, left, bottom), fill=(0, 0, 0, 120))
draw.rectangle((right, top, guide.width, bottom), fill=(0, 0, 0, 120))
draw.rectangle((left, top, right, bottom), outline=(255, 255, 255, 255), width=6)
draw.rectangle((left + 8, top + 8, right - 8, bottom - 8), outline=(225, 88, 24, 255), width=3)
font_path = "/System/Library/Fonts/HelveticaNeue.ttc"
font = ImageFont.truetype(font_path, 34, index=1)
label = "ÁREA SEGURA — 1235 × 338 PX"
box = draw.textbbox((0, 0), label, font=font)
label_w = box[2] - box[0]
draw.rounded_rectangle(
    (left + 20, top + 18, left + 58 + label_w, top + 76),
    radius=12,
    fill=(18, 18, 18, 225),
)
draw.text((left + 38, top + 28), label, font=font, fill=(255, 255, 255, 255))
guide = Image.alpha_composite(guide, overlay)
guide.save(YOUTUBE / "05-banner-guia-area-segura-1235x338.png", optimize=True)

copy(
    SOCIAL / "40-youtube-thumbnail-growth-1280x720.png",
    YOUTUBE / "06-thumbnail-growth-that-leads-1280x720.png",
)
copy(
    SOCIAL / "41-youtube-thumbnail-modelo-limpo-1280x720.png",
    YOUTUBE / "07-thumbnail-modelo-limpo-1280x720.png",
)
copy(
    SOCIAL / "37-instagram-story-built-to-lead-1080x1920.png",
    YOUTUBE / "08-shorts-capa-built-to-lead-1080x1920.png",
)
copy(
    SOCIAL / "38-instagram-story-modelo-limpo-1080x1920.png",
    YOUTUBE / "09-shorts-capa-modelo-limpo-1080x1920.png",
)
copy(
    SOCIAL / "48-youtube-video-watermark-150.png",
    YOUTUBE / "10-marca-dagua-150x150.png",
)
copy(
    Path(
        "/Users/macbook/.codex/generated_images/01a02f13-5457-7193-845d-3f8eddbed099/"
        "exec-91d0c54f-f06c-4da9-a9e8-f9d457d1f20d.png"
    ),
    YOUTUBE / "11-apresentacao-do-kit-youtube.png",
)


# Instagram files.
instagram_numbers = {
    23, 31, 32, 33, 34, 35, 36, 37, 38, 39, 42, 43, 44, 45, 46
}
for source in sorted(SOCIAL.glob("*.png")):
    try:
        number = int(source.name.split("-", 1)[0])
    except ValueError:
        continue
    if number in instagram_numbers:
        copy(source, INSTAGRAM / source.name)


# Facebook files.
for filename in (
    "26-facebook-perfil-1080.png",
    "28-facebook-cover-1640x624.png",
    "53-facebook-cover-sem-slogan-1640x624.png",
):
    copy(SOCIAL / filename, FACEBOOK / filename)


# Other already-produced brand materials.
for filename in (
    "25-whatsapp-perfil-1080.png",
    "29-linkedin-cover-1584x396.png",
    "30-x-cover-1500x500.png",
    "47-assinatura-email-1200x350.png",
    "49-guia-areas-seguras-redes.png",
    "50-mini-guia-social-media.png",
    "51-aplicacao-real-youtube-instagram.png",
    "54-linkedin-cover-sem-slogan-1584x396.png",
    "55-x-cover-sem-slogan-1500x500.png",
):
    copy(SOCIAL / filename, GENERAL / filename)


print(COMPANY)
for folder in (BRAND, YOUTUBE, INSTAGRAM, FACEBOOK, GENERAL):
    print(folder.name, len(list(folder.glob("*"))))
