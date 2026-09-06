from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path('/Users/macbook/Documents/Codex/2026-08-23/eu-x20')
OUT = ROOT / 'outputs' / 'valdieri-brand-kit'
OUT.mkdir(parents=True, exist_ok=True)

source_paths = {
    '01-logo-principal-original-transparente.png': Path('/Users/macbook/.codex/generated_images/01a02f13-5457-7193-845d-3f8eddbed099/exec-9542e872-07ff-4a96-bddd-d499765591b7.png'),
    '02-logo-principal-fundo-escuro.png': Path('/Users/macbook/.codex/generated_images/01a02f13-5457-7193-845d-3f8eddbed099/exec-b607f378-0d7a-4600-ae70-ce44f4cdd595.png'),
    '03-logo-principal-fundo-claro.png': Path('/Users/macbook/.codex/generated_images/01a02f13-5457-7193-845d-3f8eddbed099/exec-e1d00827-91db-4a57-86de-82034d43057e.png'),
    '04-logo-horizontal-para-fundo-claro.png': Path('/Users/macbook/.codex/generated_images/01a02f13-5457-7193-845d-3f8eddbed099/exec-0f672f58-b8b1-4b94-b138-920537cf36d0.png'),
    '05-logo-horizontal-para-fundo-escuro.png': Path('/Users/macbook/.codex/generated_images/01a02f13-5457-7193-845d-3f8eddbed099/exec-cdfdc00a-ccf0-4557-bf79-10fe12995565.png'),
    '06-monograma-vc-original-transparente.png': Path('/Users/macbook/.codex/generated_images/01a02f13-5457-7193-845d-3f8eddbed099/exec-3cf7e4cd-1491-43c2-8248-f5e62517dd89.png'),
    '07-foto-perfil-fundo-escuro.png': Path('/Users/macbook/.codex/generated_images/01a02f13-5457-7193-845d-3f8eddbed099/exec-5dd2c6d8-39bc-4bef-843f-139d5d24693a.png'),
    '08-foto-perfil-fundo-claro.png': Path('/Users/macbook/.codex/generated_images/01a02f13-5457-7193-845d-3f8eddbed099/exec-1043699e-159b-4e2b-949b-eb3c02314f95.png'),
}

for name, src in source_paths.items():
    Image.open(src).save(OUT / name)

def trim_and_pad(im, pad=72):
    im = im.convert('RGBA')
    bbox = im.getchannel('A').getbbox()
    if bbox:
        im = im.crop(bbox)
    canvas = Image.new('RGBA', (im.width + pad * 2, im.height + pad * 2), (0, 0, 0, 0))
    canvas.alpha_composite(im, (pad, pad))
    return canvas

def recolor(im, rgb, opacity=255):
    im = im.convert('RGBA')
    alpha = im.getchannel('A').point(lambda a: round(a * opacity / 255))
    layer = Image.new('RGBA', im.size, (*rgb, 0))
    layer.putalpha(alpha)
    return layer

source = Image.open(source_paths['01-logo-principal-original-transparente.png']).convert('RGBA')
mono = Image.open(source_paths['06-monograma-vc-original-transparente.png']).convert('RGBA')

# Exact wordmark crop from the approved original, preserving its typography and bronze separators.
wordmark = trim_and_pad(source.crop((0, 750, source.width, 1010)), 54)
wordmark.save(OUT / '09-wordmark-original-transparente.png')
recolor(wordmark, (247, 242, 232)).save(OUT / '10-wordmark-branco-transparente.png')

# Exact monochrome masters built from the original alpha mask.
recolor(source, (18, 18, 18)).save(OUT / '11-logo-monocromatica-preta-transparente.png')
recolor(source, (247, 242, 232)).save(OUT / '12-logo-monocromatica-branca-transparente.png')

# Full-logo and symbol-only functional watermarks.
recolor(source, (18, 18, 18), 46).save(OUT / '13-marca-dagua-preta-18pct.png')
recolor(source, (255, 255, 255), 56).save(OUT / '14-marca-dagua-branca-22pct.png')
recolor(mono, (18, 18, 18), 46).save(OUT / '15-marca-dagua-monograma-preta-18pct.png')
recolor(mono, (255, 255, 255), 56).save(OUT / '16-marca-dagua-monograma-branca-22pct.png')

# Small digital-use exports from the isolated monogram.
mono_trim = trim_and_pad(mono, 90)
for size, num in [(512, 17), (256, 18), (128, 19)]:
    thumb = mono_trim.copy()
    thumb.thumbnail((size, size), Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    canvas.alpha_composite(thumb, ((size - thumb.width) // 2, (size - thumb.height) // 2))
    canvas.save(OUT / f'{num:02d}-icone-{size}px-transparente.png')

# Visual overview, placing transparent artwork on suitable presentation surfaces.
files = sorted(OUT.glob('*.png'))
tile_w, tile_h, cols = 520, 600, 4
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (tile_w * cols, tile_h * rows), (230, 230, 230))
try:
    font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 22)
except OSError:
    font = ImageFont.load_default()

for i, p in enumerate(files):
    im = Image.open(p).convert('RGBA')
    light_asset = any(k in p.name for k in ['branca', 'branco', 'fundo-escuro', 'para-fundo-escuro'])
    bg_color = (28, 28, 28) if light_asset else (249, 246, 239)
    tile = Image.new('RGBA', (tile_w - 12, tile_h - 12), (*bg_color, 255))
    preview = im.copy()
    preview.thumbnail((tile_w - 72, tile_h - 115), Image.Resampling.LANCZOS)
    tile.alpha_composite(preview, ((tile.width - preview.width) // 2, 28 + (tile_h - 145 - preview.height) // 2))
    draw = ImageDraw.Draw(tile)
    label = p.stem
    text_color = (245, 245, 245) if light_asset else (25, 25, 25)
    draw.text((22, tile_h - 66), label, fill=text_color, font=font)
    x, y = (i % cols) * tile_w + 6, (i // cols) * tile_h + 6
    sheet.paste(tile.convert('RGB'), (x, y))

sheet.save(ROOT / 'outputs' / 'valdieri-brand-kit-visao-geral.jpg', quality=92)
print(f'assets={len(files)} overview={sheet.size}')
