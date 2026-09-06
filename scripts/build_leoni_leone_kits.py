from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import shutil

ROOT = Path('/Users/macbook/Documents/Codex/2026-08-23/eu-x20')
OUTROOT = ROOT / 'outputs'

BRANDS = {
    'leoni': {
        'title': 'LEONI',
        'concepts': [
            Path('/Users/macbook/.codex/generated_images/01a02f13-5457-7193-845d-3f8eddbed099/exec-f75df3d1-91be-48ca-ae23-bdf64a5e3f17.png'),
            Path('/Users/macbook/.codex/generated_images/01a02f13-5457-7193-845d-3f8eddbed099/exec-a9b6f39a-34a4-4a35-9b47-6471189f330e.png'),
            Path('/Users/macbook/.codex/generated_images/01a02f13-5457-7193-845d-3f8eddbed099/exec-008736c1-fab5-4221-81c0-1b2943449207.png'),
        ],
        'primary_transparent': Path('/Users/macbook/.codex/generated_images/01a02f13-5457-7193-845d-3f8eddbed099/exec-7c8ab2e7-fad6-4dfe-8c15-473c81a4d82e.png'),
        'primary_dark': Path('/Users/macbook/.codex/generated_images/01a02f13-5457-7193-845d-3f8eddbed099/exec-a9541d68-7357-45ec-a58a-de88308737d3.png'),
        'horizontal': Path('/Users/macbook/.codex/generated_images/01a02f13-5457-7193-845d-3f8eddbed099/exec-b1238154-7d76-452c-9d60-b18c1be4d5fb.png'),
        'monogram': Path('/Users/macbook/.codex/generated_images/01a02f13-5457-7193-845d-3f8eddbed099/exec-725264a0-2cd9-48ae-9b1c-e4c7233f738c.png'),
        'wordmark_crop_x': 650,
    },
    'leone-group': {
        'title': 'LEONE GROUP',
        'concepts': [
            Path('/Users/macbook/.codex/generated_images/01a02f13-5457-7193-845d-3f8eddbed099/exec-f2b66a71-ad9a-407b-b9bf-c06ddfb30d8f.png'),
            Path('/Users/macbook/.codex/generated_images/01a02f13-5457-7193-845d-3f8eddbed099/exec-9afe20fb-228f-44cb-a53b-12c75751028d.png'),
            Path('/Users/macbook/.codex/generated_images/01a02f13-5457-7193-845d-3f8eddbed099/exec-e87897c0-214c-4bd9-8587-43b59049a0f0.png'),
        ],
        'primary_transparent': Path('/Users/macbook/.codex/generated_images/01a02f13-5457-7193-845d-3f8eddbed099/exec-7a2d1e64-f845-4006-9405-ae1bdaa7ebb3.png'),
        'primary_dark': Path('/Users/macbook/.codex/generated_images/01a02f13-5457-7193-845d-3f8eddbed099/exec-180ef943-3094-4561-a02d-824b66f21045.png'),
        'horizontal': Path('/Users/macbook/.codex/generated_images/01a02f13-5457-7193-845d-3f8eddbed099/exec-4675a77c-a77c-4d92-8015-ba5e8f79c78a.png'),
        'monogram': Path('/Users/macbook/.codex/generated_images/01a02f13-5457-7193-845d-3f8eddbed099/exec-4e5cb52c-b9cb-471a-b700-67f48c851610.png'),
        'wordmark_crop_x': 620,
    },
}

try:
    FONT = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 22)
    FONT_BIG = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 34)
except OSError:
    FONT = FONT_BIG = ImageFont.load_default()

def trim_and_pad(im, pad=64):
    im = im.convert('RGBA')
    bbox = im.getchannel('A').getbbox()
    if bbox:
        im = im.crop(bbox)
    out = Image.new('RGBA', (im.width + 2 * pad, im.height + 2 * pad), (0, 0, 0, 0))
    out.alpha_composite(im, (pad, pad))
    return out

def clean_alpha(im):
    im = im.convert('RGBA')
    a = im.getchannel('A').point(lambda v: 0 if v < 18 else min(255, round((v - 18) * 255 / 237)))
    im.putalpha(a)
    return im

def recolor(im, rgb, opacity=255):
    im = clean_alpha(im)
    alpha = im.getchannel('A').point(lambda a: round(a * opacity / 255))
    out = Image.new('RGBA', im.size, (*rgb, 0))
    out.putalpha(alpha)
    return out

def make_avatar(monogram, background, size=1254):
    monogram = trim_and_pad(monogram, 70)
    monogram.thumbnail((round(size * .72), round(size * .72)), Image.Resampling.LANCZOS)
    out = Image.new('RGBA', (size, size), (*background, 255))
    out.alpha_composite(monogram, ((size - monogram.width) // 2, (size - monogram.height) // 2))
    return out

def make_icon(monogram, size):
    monogram = trim_and_pad(monogram, 75)
    monogram.thumbnail((round(size * .82), round(size * .82)), Image.Resampling.LANCZOS)
    out = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    out.alpha_composite(monogram, ((size - monogram.width) // 2, (size - monogram.height) // 2))
    return out

def overview(folder, title, path):
    files = sorted(folder.glob('*.png'))
    cols, tile_w, tile_h = 4, 500, 570
    rows = (len(files) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * tile_w, rows * tile_h + 80), (226, 226, 226))
    d = ImageDraw.Draw(sheet)
    d.text((24, 20), title, fill=(20, 20, 20), font=FONT_BIG)
    for i, p in enumerate(files):
        im = Image.open(p).convert('RGBA')
        use_dark = any(s in p.name for s in ['branca', 'escuro', 'escura'])
        bg = (28, 28, 28) if use_dark else (249, 246, 239)
        tile = Image.new('RGBA', (tile_w - 12, tile_h - 12), (*bg, 255))
        prev = im.copy()
        prev.thumbnail((tile_w - 70, tile_h - 115), Image.Resampling.LANCZOS)
        tile.alpha_composite(prev, ((tile.width - prev.width) // 2, 25 + (tile_h - 145 - prev.height) // 2))
        td = ImageDraw.Draw(tile)
        color = (245, 245, 245) if use_dark else (25, 25, 25)
        td.text((18, tile_h - 66), p.stem, fill=color, font=FONT)
        x, y = (i % cols) * tile_w + 6, 80 + (i // cols) * tile_h + 6
        sheet.paste(tile.convert('RGB'), (x, y))
    sheet.save(path, quality=92)

for slug, b in BRANDS.items():
    folder = OUTROOT / f'{slug}-brand-kit'
    folder.mkdir(parents=True, exist_ok=True)
    for old in folder.glob('*.png'):
        old.unlink()

    for idx, src in enumerate(b['concepts'], start=1):
        Image.open(src).save(folder / f'{idx:02d}-conceito-{chr(64 + idx)}-principal-claro.png')

    primary = clean_alpha(Image.open(b['primary_transparent']).convert('RGBA'))
    primary.save(folder / '04-logo-principal-transparente.png')
    Image.open(b['primary_dark']).save(folder / '05-logo-principal-fundo-escuro.png')

    horizontal = clean_alpha(Image.open(b['horizontal']).convert('RGBA'))
    horizontal.save(folder / '06-logo-horizontal-transparente.png')

    monogram = clean_alpha(Image.open(b['monogram']).convert('RGBA'))
    monogram.save(folder / '07-monograma-transparente.png')
    make_avatar(monogram, (27, 27, 27)).save(folder / '08-foto-perfil-fundo-escuro.png')
    make_avatar(monogram, (249, 246, 239)).save(folder / '09-foto-perfil-fundo-claro.png')

    wordmark = trim_and_pad(horizontal.crop((b['wordmark_crop_x'], 0, horizontal.width, horizontal.height)), 50)
    wordmark.save(folder / '10-wordmark-transparente.png')

    recolor(primary, (18, 18, 18)).save(folder / '11-logo-monocromatica-preta-transparente.png')
    recolor(primary, (247, 242, 232)).save(folder / '12-logo-monocromatica-branca-transparente.png')
    recolor(primary, (18, 18, 18), 46).save(folder / '13-marca-dagua-preta-18pct.png')
    recolor(primary, (255, 255, 255), 56).save(folder / '14-marca-dagua-branca-22pct.png')
    recolor(monogram, (18, 18, 18), 46).save(folder / '15-marca-dagua-monograma-preta-18pct.png')
    recolor(monogram, (255, 255, 255), 56).save(folder / '16-marca-dagua-monograma-branca-22pct.png')
    make_icon(monogram, 512).save(folder / '17-icone-512px-transparente.png')
    make_icon(monogram, 256).save(folder / '18-icone-256px-transparente.png')

    overview(folder, f'{b["title"]} — KIT DE IDENTIDADE', OUTROOT / f'{slug}-brand-kit-visao-geral.jpg')

# Six-concept comparison board.
board = Image.new('RGB', (1800, 1280), (224, 224, 224))
bd = ImageDraw.Draw(board)
bd.text((30, 22), 'LEONI × LEONE GROUP — COMPARAÇÃO DE CONCEITOS', fill=(20, 20, 20), font=FONT_BIG)
for row, (slug, b) in enumerate(BRANDS.items()):
    for col, src in enumerate(b['concepts']):
        im = Image.open(src).convert('RGB')
        im.thumbnail((540, 520), Image.Resampling.LANCZOS)
        tile = Image.new('RGB', (570, 560), (249, 246, 239))
        tile.paste(im, ((570 - im.width) // 2, (520 - im.height) // 2))
        label = f'{b["title"]} — CONCEITO {chr(65 + col)}'
        ImageDraw.Draw(tile).text((20, 525), label, fill=(22, 22, 22), font=FONT)
        board.paste(tile, (15 + col * 595, 90 + row * 590))
board.save(OUTROOT / 'leoni-vs-leone-comparativo.jpg', quality=92)

combined = OUTROOT / 'leoni-leone-opcoes-completas'
if combined.exists():
    shutil.rmtree(combined)
combined.mkdir()
shutil.copytree(OUTROOT / 'leoni-brand-kit', combined / 'leoni-brand-kit')
shutil.copytree(OUTROOT / 'leone-group-brand-kit', combined / 'leone-group-brand-kit')
shutil.copy2(OUTROOT / 'leoni-vs-leone-comparativo.jpg', combined / 'comparativo.jpg')

print('leoni_assets', len(list((OUTROOT / 'leoni-brand-kit').glob('*.png'))))
print('leone_assets', len(list((OUTROOT / 'leone-group-brand-kit').glob('*.png'))))
