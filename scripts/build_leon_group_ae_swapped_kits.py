from pathlib import Path
import re


SOURCE_PATH = Path("/Users/macbook/Documents/Codex/2026-08-23/eu-x20/work/build_leon_group_kits.py")
source = SOURCE_PATH.read_text()

designs = '''DESIGNS = {
    "A": {
        "name": "Leão em espaço negativo — paleta E",
        "source": "A-leon-group-paleta-E-solid.png",
        "dark": (16, 60, 50),
        "accent": (242, 169, 0),
        "symbol_box": (170, 10, 970, 740),
        "wordmark_box": (0, 740, 1094, 1157),
        "primary": "vertical",
        "folder": "leon-group-a-paleta-e-brand-kit",
        "overview": "leon-group-a-paleta-e-brand-kit-visao-geral.jpg",
    },
    "E": {
        "name": "Leão integrado ao O — paleta A",
        "source": "E-leon-group-paleta-A-solid.png",
        "dark": (22, 22, 22),
        "accent": (225, 88, 24),
        "symbol_box": (730, 0, 1210, 505),
        "wordmark_box": (0, 0, 1721, 650),
        "primary": "horizontal",
        "folder": "leon-group-e-paleta-a-brand-kit",
        "overview": "leon-group-e-paleta-a-brand-kit-visao-geral.jpg",
    },
}'''

source = re.sub(r"DESIGNS = \{.*?\n\}\n\n\ndef clean_alpha", designs + "\n\n\ndef clean_alpha", source, flags=re.S)
source = source.replace('OUT / f"leon-group-{letter.lower()}-brand-kit"', 'OUT / cfg["folder"]')
source = source.replace('OUT / f"leon-group-{letter.lower()}-brand-kit-visao-geral.jpg"', 'OUT / cfg["overview"]')
source = source.replace("LEON GROUP — DIREÇÕES A, B E E", "LEON GROUP — A COM E / PALETAS TROCADAS")
source = source.replace('OUT / "leon-group-a-b-e-comparativo.jpg"', 'OUT / "leon-group-a-e-paletas-trocadas-comparativo.jpg"')

exec(compile(source, str(SOURCE_PATH), "exec"))
