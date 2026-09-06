from pathlib import Path
import re


SOURCE_PATH = Path("/Users/macbook/Documents/Codex/2026-08-23/eu-x20/work/build_leone_social_kits.py")
source = SOURCE_PATH.read_text().replace("LEONE", "LEON").replace("leone", "leon")

brands = '''BRANDS = {
    "A": {
        "dark": (16, 60, 50),
        "accent": (242, 169, 0),
        "name": "LEÃO EM ESPAÇO NEGATIVO — PALETA E",
        "folder": "leon-group-a-paleta-e-brand-kit",
        "social_overview": "leon-group-a-paleta-e-social-media-visao-geral.jpg",
    },
    "E": {
        "dark": (22, 22, 22),
        "accent": (225, 88, 24),
        "name": "LEÃO INTEGRADO AO O — PALETA A",
        "folder": "leon-group-e-paleta-a-brand-kit",
        "social_overview": "leon-group-e-paleta-a-social-media-visao-geral.jpg",
    },
}'''

source = re.sub(r"BRANDS = \{.*?\n\}\n\n\ndef fit", brands + "\n\n\ndef fit", source, flags=re.S)
source = source.replace('kit = OUT / f"leon-group-{letter.lower()}-brand-kit"', 'kit = OUT / cfg["folder"]')
source = source.replace(
    'overview(social, f"LEON GROUP — SOCIAL MEDIA / {letter}", OUT / f"leon-group-{letter.lower()}-social-media-visao-geral.jpg")',
    'overview(social, f"LEON GROUP — SOCIAL MEDIA / {letter}", OUT / cfg["social_overview"])',
)
source = source.replace('    Image.open(cfg["mockup"]).save(social / "51-aplicacao-real-youtube-instagram.png")\n', '')
source = source.replace("LEON GROUP — SOCIAL MEDIA SYSTEMS", "LEON GROUP — A COM E / PALETAS TROCADAS")
source = source.replace("Directions A, B and E", "Directions A and E")
source = source.replace(
    'OUT / "leon-group-a-b-e-social-media-comparativo.jpg"',
    'OUT / "leon-group-a-e-paletas-trocadas-social-media-comparativo.jpg"',
)

exec(compile(source, str(SOURCE_PATH), "exec"))
