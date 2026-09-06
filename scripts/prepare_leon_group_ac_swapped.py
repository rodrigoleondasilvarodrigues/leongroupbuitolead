from pathlib import Path
from PIL import Image


ROOT = Path("/Users/macbook/Documents/Codex/2026-08-23/eu-x20")
OUT = ROOT / "outputs" / "leon-group-refined"

A_SOURCE = OUT / "A-leon-group-solid.png"
C_SOURCE = Path(
    "/Users/macbook/.codex/generated_images/01a02f13-5457-7193-845d-3f8eddbed099/"
    "exec-161bedfa-18ef-47a8-9ab0-e131c9efc989.png"
)

A_DARK = (22, 22, 22)
A_ACCENT = (225, 88, 24)
C_DARK = (10, 58, 43)
C_ACCENT = (231, 74, 50)


def trim(image, pad=30):
    strong = image.getchannel("A").point(lambda value: 255 if value > 70 else 0)
    bbox = strong.getbbox()
    if not bbox:
        return image
    left, top, right, bottom = bbox
    return image.crop(
        (
            max(0, left - pad),
            max(0, top - pad),
            min(image.width, right + pad),
            min(image.height, bottom + pad),
        )
    )


def recolor_a_with_c_palette():
    image = Image.open(A_SOURCE).convert("RGBA")
    source = image.load()
    for y in range(image.height):
        for x in range(image.width):
            red, green, blue, alpha = source[x, y]
            if alpha == 0:
                continue
            distance_dark = abs(red - A_DARK[0]) + abs(green - A_DARK[1]) + abs(blue - A_DARK[2])
            distance_accent = abs(red - A_ACCENT[0]) + abs(green - A_ACCENT[1]) + abs(blue - A_ACCENT[2])
            source[x, y] = (*(C_DARK if distance_dark <= distance_accent else C_ACCENT), alpha)
    result = trim(image)
    result.save(OUT / "A-leon-group-paleta-C-solid.png")
    return result


def clean_c_with_a_palette():
    image = Image.open(C_SOURCE).convert("RGB")
    result = Image.new("RGBA", image.size, (0, 0, 0, 0))
    source = image.load()
    target = result.load()

    for y in range(image.height):
        for x in range(image.width):
            red, green, blue = source[x, y]
            average = (red + green + blue) / 3
            maximum = max(red, green, blue)
            minimum = min(red, green, blue)
            saturation = 0 if maximum == 0 else (maximum - minimum) / maximum
            is_accent = red > green * 1.30 and red > blue * 1.65 and saturation > 0.22

            if is_accent:
                alpha = round(max(0, min(255, (saturation - 0.12) * 255 / 0.50)))
                color = A_ACCENT
            else:
                alpha = round(max(0, min(255, (218 - average) * 255 / 155)))
                color = A_DARK

            if alpha >= 12:
                target[x, y] = (*color, alpha)

    result = trim(result)
    result.save(OUT / "C-leon-group-paleta-A-solid.png")
    return result


for label, image in (
    ("A com paleta C", recolor_a_with_c_palette()),
    ("C com paleta A", clean_c_with_a_palette()),
):
    print(label, image.size, image.getbbox())
