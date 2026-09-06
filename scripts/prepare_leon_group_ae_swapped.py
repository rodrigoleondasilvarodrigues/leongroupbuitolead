from pathlib import Path
from PIL import Image


ROOT = Path("/Users/macbook/Documents/Codex/2026-08-23/eu-x20")
SOURCE = ROOT / "outputs" / "leon-group-refined"

A_DARK = (22, 22, 22)
A_ACCENT = (225, 88, 24)
E_DARK = (16, 60, 50)
E_ACCENT = (242, 169, 0)


def swap_palette(source_name, target_name, old_dark, old_accent, new_dark, new_accent):
    image = Image.open(SOURCE / source_name).convert("RGBA")
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            red, green, blue, alpha = pixels[x, y]
            if alpha == 0:
                continue
            dark_distance = abs(red - old_dark[0]) + abs(green - old_dark[1]) + abs(blue - old_dark[2])
            accent_distance = abs(red - old_accent[0]) + abs(green - old_accent[1]) + abs(blue - old_accent[2])
            pixels[x, y] = (*(new_dark if dark_distance <= accent_distance else new_accent), alpha)
    image.save(SOURCE / target_name)
    print(target_name, image.size, image.getbbox())


swap_palette(
    "A-leon-group-solid.png",
    "A-leon-group-paleta-E-solid.png",
    A_DARK,
    A_ACCENT,
    E_DARK,
    E_ACCENT,
)
swap_palette(
    "E-leon-group-solid.png",
    "E-leon-group-paleta-A-solid.png",
    E_DARK,
    E_ACCENT,
    A_DARK,
    A_ACCENT,
)
