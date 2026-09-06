from pathlib import Path
import re


SOURCE_PATH = Path("/Users/macbook/Documents/Codex/2026-08-23/eu-x20/work/build_leon_group_kits.py")
source = SOURCE_PATH.read_text()

designs = '''DESIGNS = {
    "A": {
        "name": "Leão em espaço negativo — paleta C",
        "source": "A-leon-group-paleta-C-solid.png",
        "dark": (10, 58, 43),
        "accent": (231, 74, 50),
        "symbol_box": (170, 10, 970, 740),
        "wordmark_box": (0, 740, 1094, 1157),
        "primary": "vertical",
        "folder": "leon-group-a-paleta-c-brand-kit",
        "overview": "leon-group-a-paleta-c-brand-kit-visao-geral.jpg",
    },
    "C": {
        "name": "Autoridade geométrica — paleta A",
        "source": "C-leon-group-paleta-A-solid.png",
        "dark": (22, 22, 22),
        "accent": (225, 88, 24),
        "symbol_box": (70, 0, 900, 760),
        "wordmark_box": (0, 750, 969, 1141),
        "primary": "vertical",
        "folder": "leon-group-c-paleta-a-brand-kit",
        "overview": "leon-group-c-paleta-a-brand-kit-visao-geral.jpg",
    },
}'''

source = re.sub(r"DESIGNS = \{.*?\n\}\n\n\ndef clean_alpha", designs + "\n\n\ndef clean_alpha", source, flags=re.S)
source = source.replace('OUT / f"leon-group-{letter.lower()}-brand-kit"', 'OUT / cfg["folder"]')
source = source.replace('OUT / f"leon-group-{letter.lower()}-brand-kit-visao-geral.jpg"', 'OUT / cfg["overview"]')
source = source.replace("LEON GROUP — DIREÇÕES A, B E E", "LEON GROUP — A E C / PALETAS TROCADAS")
source = source.replace('OUT / "leon-group-a-b-e-comparativo.jpg"', 'OUT / "leon-group-a-c-paletas-trocadas-comparativo.jpg"')

exec(compile(source, str(SOURCE_PATH), "exec"))
