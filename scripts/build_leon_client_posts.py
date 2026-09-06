from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import importlib.util
import shutil
import zipfile


ROOT = Path('/Users/macbook/Documents/Codex/2026-08-23/eu-x20')
BASE_SCRIPT = ROOT / 'work/build_leon_instagram_feed.py'
EDITORIAL = ROOT / 'work/linha-editorial-clientes-12-posts.md'
OUT = ROOT / 'outputs/LEON-GROUP/03-INSTAGRAM/12-POSTS-PARA-CLIENTES'
ZIP_PATH = ROOT / 'outputs/LEON-GROUP/03-INSTAGRAM/LEON-GROUP-12-POSTS-PARA-CLIENTES.zip'

spec = importlib.util.spec_from_file_location('leon_feed_base', BASE_SCRIPT)
b = importlib.util.module_from_spec(spec)
spec.loader.exec_module(b)

b.OUT = OUT
b.CAR = OUT / 'CARROSSEL-BONUS-FUNIL'
b.SRC = OUT / 'IMAGENS-BASE-DEMONSTRATIVAS'

W, H = b.W, b.H
IVORY, IVORY_2 = b.IVORY, b.IVORY_2
INK, CHARCOAL = b.INK, b.CHARCOAL
ORANGE, ORANGE_DARK = b.ORANGE, b.ORANGE_DARK
ORANGE_PALE, SAND, MUTED, WHITE = b.ORANGE_PALE, b.SAND, b.MUTED, b.WHITE


def base_canvas(color=IVORY):
    return Image.new('RGBA', (W, H), color)


def label(draw, text, light=False):
    b.top_label(draw, 64, 62, text, light=light)


def brand_and_footer(canvas, number, light=False):
    b.paste_logo(canvas, 64, 1138, 225, light=light)
    b.footer(canvas, number, light=light)


def pill(draw, xy, text, active=False):
    x, y = xy
    f = b.font(18, 'bold')
    tw = draw.textlength(text, font=f)
    w = int(tw + 48)
    fill = ORANGE if active else IVORY_2
    color = WHITE if active else INK
    draw.rounded_rectangle((x, y, x + w, y + 48), radius=24, fill=fill, outline=None if active else '#D8D0C7', width=2)
    draw.text((x + w / 2, y + 24), text, font=f, fill=color, anchor='mm')
    return w


def save(canvas, filename):
    path = OUT / filename
    canvas.convert('RGB').save(path, quality=96, subsampling=0)
    return path


def post_01():
    bg = b.fit_crop(b.PHOTO_FLOOR, focus=(0.58, 0.48)).convert('RGBA')
    veil = Image.new('RGBA', (W, H), (247, 243, 234, 45))
    bg.alpha_composite(veil)
    b.shadow_card(bg, (52, 58, 835, 784), radius=40, fill=(255, 253, 248, 244), blur=22)
    d = ImageDraw.Draw(bg)
    b.top_label(d, 100, 106, 'PRESENÇA DIGITAL')
    b.title(d, 96, 190, ['SUA EMPRESA', 'É BOA.'], 78, accent_last=True)
    d.text((99, 414), 'O MERCADO SABE?', font=b.font(55, 'heavy'), fill=INK)
    d.line((100, 508, 235, 508), fill=ORANGE, width=8)
    b.draw_wrapped(d, (100, 555), 'Qualidade precisa ser encontrada, compreendida e lembrada.', b.font(29, 'medium'), MUTED, 650, 10)
    b.paste_logo(bg, 97, 670, 290)
    b.footer(bg, 1, light=True)
    return save(bg, '01-sua-empresa-e-boa-o-mercado-sabe.png')


def post_02():
    im = base_canvas(); d = ImageDraw.Draw(im)
    label(d, 'GERAÇÃO DE OPORTUNIDADES')
    b.title(d, 62, 132, ['NÃO DEPENDA SÓ', 'DE INDICAÇÃO'], 76, accent_last=True)
    d.text((64, 340), 'Indicações ajudam. Estrutura sustenta.', font=b.font(29, 'medium'), fill=MUTED)
    # Channel map: referrals remain important, but no longer isolated.
    center = (540, 735)
    for endpoint in [(205, 575), (875, 575), (205, 910), (875, 910)]:
        d.line((center[0], center[1], endpoint[0], endpoint[1]), fill='#D9D0C5', width=5)
    d.ellipse((380, 575, 700, 895), fill=ORANGE)
    d.text(center, 'NOVAS\nCONVERSAS', font=b.font(35, 'heavy'), fill=WHITE, anchor='mm', align='center', spacing=6)
    nodes = [((82, 485, 330, 665), 'GOOGLE'), ((750, 485, 998, 665), 'CONTEÚDO'), ((82, 820, 330, 1000), 'ANÚNCIOS'), ((750, 820, 998, 1000), 'REFERRALS')]
    for i, (box, text) in enumerate(nodes):
        fill = ORANGE_PALE if i == 3 else IVORY_2
        d.rounded_rectangle(box, radius=32, fill=fill, outline='#DED6CD', width=2)
        d.text(((box[0] + box[2]) / 2, (box[1] + box[3]) / 2), text, font=b.font(25, 'bold'), fill=INK, anchor='mm')
    brand_and_footer(im, 2)
    return save(im, '02-nao-dependa-so-de-indicacao.png')


def post_03():
    bg = b.fit_crop(b.PHOTO_EXTERIOR, focus=(0.52, 0.42)).convert('RGBA')
    panel = Image.new('RGBA', (W, H), (0, 0, 0, 0)); pd = ImageDraw.Draw(panel)
    pd.rectangle((0, 735, W, H), fill=(247, 243, 234, 250))
    bg.alpha_composite(panel)
    d = ImageDraw.Draw(bg)
    b.top_label(d, 64, 790, 'GOOGLE BUSINESS PROFILE')
    b.title(d, 62, 862, ['APAREÇA QUANDO', 'O CLIENTE PROCURA'], 64, accent_last=True)
    d.text((64, 1045), 'Serviço certo. Região certa. Informação clara.', font=b.font(27, 'medium'), fill=MUTED)
    brand_and_footer(bg, 3)
    return save(bg, '03-apareca-quando-o-cliente-procura.png')


def post_04():
    im = base_canvas(ORANGE_PALE); d = ImageDraw.Draw(im)
    label(d, 'INSTAGRAM PARA CONTRACTORS')
    b.title(d, 62, 132, ['SEU INSTAGRAM', 'GERA CONFIANÇA?'], 70, accent_last=True)
    d.text((64, 335), 'Um feed bonito não é o bastante.', font=b.font(29, 'medium'), fill=MUTED)
    # Stylized phone/profile, intentionally generic and without fake metrics.
    b.shadow_card(im, (263, 430, 817, 1080), radius=58, fill=INK, blur=18)
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((286, 453, 794, 1057), radius=44, fill=IVORY_2)
    d.rounded_rectangle((440, 469, 640, 493), radius=12, fill=INK)
    symbol = b.contain(b.SYMBOL, (102, 102))
    im.alpha_composite(symbol, (340, 540))
    d.text((476, 550), 'LEON GROUP', font=b.font(26, 'heavy'), fill=INK)
    d.text((476, 590), 'Built to Lead.', font=b.font(19, 'medium'), fill=ORANGE_DARK)
    d.line((330, 681, 750, 681), fill=SAND, width=3)
    grid = [(330 + c * 142, 720 + r * 115) for r in range(2) for c in range(3)]
    colors = [ORANGE, IVORY, INK, IVORY, ORANGE_PALE, ORANGE]
    for (x, y), color in zip(grid, colors):
        d.rounded_rectangle((x, y, x + 118, y + 92), radius=12, fill=color, outline='#D7CFC5', width=1)
    d.rounded_rectangle((330, 980, 750, 1026), radius=23, fill=ORANGE)
    d.text((540, 1003), 'SERVIÇO • REGIÃO • CONTATO', font=b.font(16, 'bold'), fill=WHITE, anchor='mm')
    brand_and_footer(im, 4)
    return save(im, '04-seu-instagram-gera-confianca.png')


def post_05():
    im = base_canvas(); d = ImageDraw.Draw(im)
    label(d, 'LANDING PAGE')
    b.title(d, 62, 132, ['UMA PÁGINA.', 'UM PRÓXIMO PASSO.'], 66, accent_last=True)
    d.text((64, 335), 'Transforme interesse em uma conversa.', font=b.font(29, 'medium'), fill=MUTED)
    b.shadow_card(im, (62, 435, 1018, 1085), radius=28, fill=IVORY_2)
    d = ImageDraw.Draw(im)
    d.rectangle((62, 435, 1018, 515), fill=INK)
    d.ellipse((98, 466, 119, 487), fill=ORANGE)
    d.rectangle((147, 467, 325, 486), fill='#5C5954')
    d.rounded_rectangle((760, 455, 968, 497), radius=21, fill=ORANGE)
    d.text((864, 476), 'REQUEST ESTIMATE', font=b.font(14, 'bold'), fill=WHITE, anchor='mm')
    d.text((110, 592), 'SERVIÇO CLARO.', font=b.font(49, 'heavy'), fill=INK)
    d.text((110, 655), 'AÇÃO CLARA.', font=b.font(49, 'heavy'), fill=ORANGE)
    d.text((110, 741), 'O visitante entende o que você faz,', font=b.font(25, 'medium'), fill=MUTED)
    d.text((110, 782), 'onde atende e como pedir contato.', font=b.font(25, 'medium'), fill=MUTED)
    d.rounded_rectangle((110, 866, 510, 946), radius=40, fill=ORANGE)
    d.text((310, 906), 'FALE COM A EMPRESA', font=b.font(20, 'bold'), fill=WHITE, anchor='mm')
    d.rounded_rectangle((580, 575, 945, 966), radius=24, fill=ORANGE_PALE)
    for i, width in enumerate([255, 210, 278, 188, 236]):
        d.rounded_rectangle((625, 630 + i * 56, 625 + width, 649 + i * 56), radius=9, fill=ORANGE if i == 0 else '#C9BFB4')
    brand_and_footer(im, 5)
    return save(im, '05-uma-pagina-um-proximo-passo.png')


def post_06():
    bg = b.fit_crop(b.PHOTO_KITCHEN, focus=(0.73, 0.46)).convert('RGBA')
    overlay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); od = ImageDraw.Draw(overlay)
    od.rounded_rectangle((52, 56, 795, 635), radius=42, fill=(255, 253, 248, 246))
    od.rounded_rectangle((52, 930, 828, 1158), radius=30, fill=(247, 243, 234, 247))
    bg.alpha_composite(overlay)
    d = ImageDraw.Draw(bg)
    b.top_label(d, 98, 105, 'CRIATIVOS NATURAIS')
    b.title(d, 94, 182, ['CONTEÚDO QUE', 'PARECE DE VERDADE'], 62, accent_last=True)
    d.text((98, 368), 'Menos propaganda.', font=b.font(31, 'demi'), fill=INK)
    d.text((98, 415), 'Mais processo real.', font=b.font(31, 'demi'), fill=ORANGE_DARK)
    d.line((98, 492, 228, 492), fill=ORANGE, width=8)
    b.draw_wrapped(d, (98, 535), 'Mostre. Explique. Aproxime.', b.font(27, 'medium'), MUTED, 600, 8)
    d.text((98, 986), 'TRABALHO REAL • MENSAGEM CLARA', font=b.font(23, 'bold'), fill=INK)
    d.text((98, 1033), 'conteúdo pensado para gerar confiança', font=b.font(24, 'medium'), fill=MUTED)
    brand_and_footer(bg, 6)
    return save(bg, '06-conteudo-que-parece-de-verdade.png')


def post_07():
    im = base_canvas(); d = ImageDraw.Draw(im)
    label(d, 'FOLLOW-UP')
    b.title(d, 62, 132, ['LEADS NÃO PODEM', 'ESFRIAR'], 74, accent_last=True)
    d.text((64, 340), 'Resposta rápida é só o começo.', font=b.font(29, 'medium'), fill=MUTED)
    steps = [('01', 'RESPONDER', 'inicie a conversa'), ('02', 'QUALIFICAR', 'entenda o projeto'), ('03', 'AGENDAR', 'defina o próximo passo'), ('04', 'ACOMPANHAR', 'faça o follow-up')]
    y = 465
    for i, (num, heading, desc) in enumerate(steps):
        fill = ORANGE if i == 0 else IVORY_2
        color = WHITE if i == 0 else INK
        d.rounded_rectangle((64, y, 1015, y + 128), radius=28, fill=fill, outline=None if i == 0 else '#D8D0C7', width=2)
        d.text((105, y + 64), num, font=b.font(24, 'bold'), fill=ORANGE_PALE if i == 0 else ORANGE, anchor='lm')
        d.text((205, y + 43), heading, font=b.font(28, 'bold'), fill=color)
        d.text((205, y + 79), desc, font=b.font(21, 'medium'), fill=ORANGE_PALE if i == 0 else MUTED)
        if i < 3:
            d.line((140, y + 128, 140, y + 151), fill=ORANGE, width=4)
        y += 151
    brand_and_footer(im, 7)
    return save(im, '07-leads-nao-podem-esfriar.png')


def post_08():
    im = base_canvas(ORANGE_PALE); d = ImageDraw.Draw(im)
    label(d, 'QUALIFICAÇÃO')
    b.title(d, 62, 132, ['NEM TODO LEAD', 'É O CLIENTE CERTO'], 67, accent_last=True)
    d.text((64, 335), 'Pergunte antes de investir seu tempo.', font=b.font(29, 'medium'), fill=MUTED)
    cards = [
        ('SERVIÇO', 'O que precisa ser feito?'),
        ('REGIÃO', 'Onde fica o projeto?'),
        ('TIMELINE', 'Quando pretende começar?'),
        ('BUDGET', 'Existe uma faixa considerada?'),
    ]
    coords = [(64, 455), (552, 455), (64, 765), (552, 765)]
    for i, ((heading, desc), (x, y)) in enumerate(zip(cards, coords)):
        fill = INK if i == 0 else IVORY_2
        d.rounded_rectangle((x, y, x + 464, y + 268), radius=32, fill=fill)
        d.ellipse((x + 38, y + 37, x + 94, y + 93), fill=ORANGE)
        d.text((x + 66, y + 65), str(i + 1), font=b.font(19, 'bold'), fill=WHITE, anchor='mm')
        d.text((x + 38, y + 126), heading, font=b.font(27, 'bold'), fill=WHITE if i == 0 else INK)
        b.draw_wrapped(d, (x + 38, y + 177), desc, b.font(22, 'medium'), ORANGE_PALE if i == 0 else MUTED, 380, 6)
    brand_and_footer(im, 8)
    return save(im, '08-nem-todo-lead-e-o-cliente-certo.png')


def post_09():
    im = base_canvas(); d = ImageDraw.Draw(im)
    label(d, 'PROCESSO COMERCIAL')
    b.title(d, 62, 132, ['ESTIMATE TAMBÉM', 'POSICIONA'], 73, accent_last=True)
    d.text((64, 340), 'O cliente avalia mais do que o preço.', font=b.font(29, 'medium'), fill=MUTED)
    b.shadow_card(im, (182, 443, 900, 1090), radius=28, fill=IVORY_2)
    d = ImageDraw.Draw(im)
    d.rectangle((182, 443, 900, 535), fill=INK)
    d.text((230, 490), 'PROJECT ESTIMATE', font=b.font(25, 'bold'), fill=WHITE, anchor='lm')
    d.text((847, 490), 'LEON', font=b.font(20, 'heavy'), fill=ORANGE, anchor='rm')
    fields = [('ESCOPO', 310), ('ETAPAS', 250), ('PRAZO', 205), ('CONDIÇÕES', 285), ('PRÓXIMO PASSO', 335)]
    y = 610
    for field, width in fields:
        d.text((230, y), field, font=b.font(19, 'bold'), fill=ORANGE_DARK)
        d.rounded_rectangle((466, y + 3, 466 + width, y + 19), radius=8, fill='#C9BFB4')
        y += 82
    d.rounded_rectangle((230, 1010, 850, 1055), radius=22, fill=ORANGE_PALE)
    d.text((540, 1032), 'CLAREZA • TRANSPARÊNCIA • DIREÇÃO', font=b.font(17, 'bold'), fill=INK, anchor='mm')
    brand_and_footer(im, 9)
    return save(im, '09-estimate-tambem-posiciona.png')


def post_10():
    bg = b.fit_crop(b.PHOTO_FLOOR, focus=(0.6, 0.5)).convert('RGBA')
    overlay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); od = ImageDraw.Draw(overlay)
    od.rounded_rectangle((52, 58, 1018, 795), radius=42, fill=(255, 253, 248, 247))
    bg.alpha_composite(overlay)
    d = ImageDraw.Draw(bg)
    b.top_label(d, 98, 106, 'POSICIONAMENTO')
    b.title(d, 94, 186, ['PARE DE COMPETIR', 'SÓ POR PREÇO'], 69, accent_last=True)
    d.text((98, 386), 'Mostre o valor que existe além do número.', font=b.font(28, 'medium'), fill=MUTED)
    x, y = 98, 500
    for text, active in [('ESPECIALIDADE', True), ('PROCESSO', False), ('COMUNICAÇÃO', False), ('EXPERIÊNCIA', True)]:
        w = pill(d, (x, y), text, active=active)
        x += w + 14
        if x > 850:
            x, y = 98, y + 72
    d.line((98, 678, 235, 678), fill=ORANGE, width=8)
    d.text((98, 714), 'QUANDO TUDO PARECE IGUAL,', font=b.font(25, 'bold'), fill=INK)
    d.text((98, 752), 'O PREÇO VIRA A ÚNICA COMPARAÇÃO.', font=b.font(25, 'bold'), fill=ORANGE_DARK)
    b.footer(bg, 10, light=True)
    return save(bg, '10-pare-de-competir-so-por-preco.png')


def post_11():
    im = base_canvas(); d = ImageDraw.Draw(im)
    label(d, 'MARKETING + VENDAS')
    b.title(d, 62, 132, ['SEU MARKETING', 'PRECISA DE UM CAMINHO'], 62, accent_last=True)
    d.text((64, 330), 'Visibilidade sem processo vira ruído.', font=b.font(29, 'medium'), fill=MUTED)
    steps = [('CONTEÚDO', 'atrai'), ('LANDING PAGE', 'explica'), ('WHATSAPP', 'conecta'), ('QUALIFICAÇÃO', 'direciona'), ('ESTIMATE', 'formaliza')]
    y = 448
    for i, (heading, role) in enumerate(steps):
        x = 64 + i * 186
        d.ellipse((x, y, x + 102, y + 102), fill=ORANGE if i in (0, 4) else ORANGE_PALE, outline=ORANGE, width=3)
        d.text((x + 51, y + 51), f'{i + 1:02d}', font=b.font(23, 'bold'), fill=WHITE if i in (0, 4) else ORANGE_DARK, anchor='mm')
        if i < 4:
            d.line((x + 102, y + 51, x + 186, y + 51), fill=ORANGE, width=5)
        d.text((x + 51, y + 137), heading, font=b.font(17 if len(heading) > 10 else 20, 'bold'), fill=INK, anchor='ma')
        d.text((x + 51, y + 172), role, font=b.font(18, 'medium'), fill=MUTED, anchor='ma')
    b.shadow_card(im, (64, 755, 1016, 1060), radius=34, fill=IVORY_2)
    d = ImageDraw.Draw(im)
    d.text((112, 815), 'CADA ETAPA PREPARA A PRÓXIMA.', font=b.font(34, 'heavy'), fill=INK)
    b.draw_wrapped(d, (112, 885), 'A Leon Group conecta presença digital, conteúdo e processo comercial em uma estrutura coerente.', b.font(26, 'medium'), MUTED, 815, 9)
    brand_and_footer(im, 11)
    return save(im, '11-seu-marketing-precisa-de-um-caminho.png')


def post_12():
    im = base_canvas(); d = ImageDraw.Draw(im)
    d.polygon([(790, 0), (W, 0), (W, 1350), (930, 1350)], fill=ORANGE)
    d.ellipse((835, 82, 1245, 492), outline='#F28A55', width=46)
    label(d, 'LEON GROUP')
    b.title(d, 62, 152, ['PRONTO PARA', 'O PRÓXIMO NÍVEL?'], 68, accent_last=True)
    d.text((64, 355), 'Estruture sua empresa para liderar.', font=b.font(30, 'medium'), fill=MUTED)
    services = ['BRANDING', 'GOOGLE BUSINESS', 'LANDING PAGE', 'CONTEÚDO', 'CRIATIVOS', 'ESTRUTURA COMERCIAL']
    y = 485
    for service in services:
        d.ellipse((66, y + 3, 104, y + 41), fill=ORANGE)
        d.line((76, y + 23, 85, y + 32), fill=WHITE, width=3)
        d.line((85, y + 32, 98, y + 12), fill=WHITE, width=3)
        d.text((132, y), service, font=b.font(26, 'bold'), fill=INK)
        y += 83
    d.rounded_rectangle((62, 1025, 610, 1105), radius=40, fill=INK)
    d.text((336, 1065), 'FALE COM A LEON GROUP', font=b.font(22, 'bold'), fill=WHITE, anchor='mm')
    b.paste_logo(im, 64, 1140, 225)
    b.footer(im, 12)
    return save(im, '12-pronto-para-o-proximo-nivel.png')


def make_overview(paths):
    thumb_w, thumb_h = 300, 375
    margin, gap = 48, 26
    sheet = Image.new('RGB', (4 * thumb_w + 3 * gap + 2 * margin, 3 * thumb_h + 2 * gap + 2 * margin + 118), IVORY)
    d = ImageDraw.Draw(sheet)
    d.text((margin, 24), 'LEON GROUP — 12 POSTS PARA CLIENTES', font=b.font(35, 'heavy'), fill=INK)
    d.text((margin, 68), 'Contractors • Construction • Home Services • Massachusetts', font=b.font(21, 'medium'), fill=MUTED)
    for i, path in enumerate(paths):
        im = Image.open(path).convert('RGB').resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
        x = margin + (i % 4) * (thumb_w + gap)
        y = margin + 118 + (i // 4) * (thumb_h + gap)
        sheet.paste(im, (x, y))
    output = OUT / '00-VISAO-GERAL-12-POSTS.jpg'
    sheet.save(output, quality=94, subsampling=0)
    return output


def write_readme():
    content = '''# Leon Group — 12 posts para clientes\n\nPacote editorial destinado a contractors e proprietários de empresas de construction/home services nos Estados Unidos, especialmente brasileiros em Massachusetts e Boston.\n\n## Arquivos\n\n- 12 artes individuais em 1080 × 1350 px (proporção 4:5).\n- `LEGENDAS-COMPLETAS.md`: textos, CTAs e hashtags em ordem de publicação.\n- `00-VISAO-GERAL-12-POSTS.jpg`: visão conjunta do feed.\n- `IMAGENS-BASE-DEMONSTRATIVAS`: imagens ilustrativas usadas na composição. Elas não devem ser apresentadas como trabalhos, clientes ou portfólio real da Leon Group.\n\n## Identidade\n\nPaleta oficial preto, laranja e marfim. A coleção privilegia fundos claros, espaço visual e leitura em dispositivos móveis.\n\n## Publicação\n\nRevise a legenda antes de publicar e substitua qualquer referência geográfica ou comercial se a área de atendimento mudar. Não adicione resultados, avaliações ou alegações que não possam ser comprovados.\n'''
    (OUT / '00-LEIA-ME.md').write_text(content, encoding='utf-8')


def create_zip():
    if ZIP_PATH.exists():
        ZIP_PATH.unlink()
    with zipfile.ZipFile(ZIP_PATH, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for path in sorted(OUT.rglob('*')):
            if path.is_file():
                zf.write(path, Path(OUT.name) / path.relative_to(OUT))


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    b.SRC.mkdir(parents=True, exist_ok=True)
    for existing in OUT.glob('*'):
        if existing.is_file():
            existing.unlink()
        elif existing.is_dir():
            shutil.rmtree(existing)
    b.SRC.mkdir(parents=True, exist_ok=True)
    for src, name in [
        (b.PHOTO_FLOOR, 'foto-flooring-demonstrativa.png'),
        (b.PHOTO_KITCHEN, 'foto-remodeling-demonstrativa.png'),
        (b.PHOTO_EXTERIOR, 'foto-exterior-demonstrativa.png'),
    ]:
        shutil.copy2(src, b.SRC / name)

    paths = [
        post_01(), post_02(), post_03(), post_04(), post_05(), post_06(),
        post_07(), post_08(), post_09(), post_10(), post_11(), post_12(),
    ]
    shutil.copy2(EDITORIAL, OUT / 'LEGENDAS-COMPLETAS.md')
    write_readme()
    make_overview(paths)
    create_zip()
    print(f'Created {len(paths)} posts in {OUT}')
    print(f'ZIP: {ZIP_PATH}')


if __name__ == '__main__':
    main()
