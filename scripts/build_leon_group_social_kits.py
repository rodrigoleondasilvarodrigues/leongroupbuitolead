from pathlib import Path


source_path = Path("/Users/macbook/Documents/Codex/2026-08-23/eu-x20/work/build_leone_social_kits.py")
source = source_path.read_text()
source = source.replace("LEONE", "LEON")
source = source.replace("leone", "leon")
source = source.replace(
    '    Image.open(cfg["mockup"]).save(social / "51-aplicacao-real-youtube-instagram.png")\n',
    "",
)
exec(compile(source, str(source_path), "exec"))

