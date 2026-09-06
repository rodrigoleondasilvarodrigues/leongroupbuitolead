from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import shutil


ROOT = Path('/Users/macbook/Documents/Codex/2026-08-23/eu-x20')
OUT = ROOT / 'outputs/LEON-GROUP/03-INSTAGRAM/12-POSTS-ESTATICOS'
CAR = OUT / 'CARROSSEL-BONUS-FUNIL'
SRC = OUT / 'IMAGENS-BASE'
BRAND = ROOT / 'outputs/LEON-GROUP/01-BRAND-KIT-OFICIAL'

PHOTO_FLOOR = Path('/Users/macbook/.codex/generated_images/01a02f13-5457-7193-845d-3f8eddbed099/exec-3768e001-6ccb-47ef-88b5-e94c062e66d9.png')
PHOTO_KITCHEN = Path('/Users/macbook/.codex/generated_images/01a02f13-5457-7193-845d-3f8eddbed099/exec-986d2f70-ab8c-4c8e-8010-e4fbdc8d9c88.png')
PHOTO_EXTERIOR = Path('/Users/macbook/.codex/generated_images/01a02f13-5457-7193-845d-3f8eddbed099/exec-13a47ec1-0c77-4f0e-acf0-5166602615cb.png')

LOGO_DARK = BRAND / '02-logo-horizontal-transparente.png'
LOGO_LIGHT = BRAND / '06-logo-inversa-transparente.png'
SYMBOL = BRAND / '07-simbolo-transparente.png'

W, H = 1080, 1350
IVORY = '#F7F3EA'
IVORY_2 = '#FFFDF8'
INK = '#171717'
CHARCOAL = '#242321'
ORANGE = '#E65A19'
ORANGE_DARK = '#C44712'
ORANGE_PALE = '#F4D8C9'
SAND = '#E9E1D6'
MUTED = '#68645E'
WHITE = '#FFFFFF'

AVENIR = '/System/Library/Fonts/Avenir Next.ttc'


def font(size, style='regular'):
    index = {'bold': 0, 'demi': 2, 'medium': 5, 'regular': 7, 'heavy': 8}.get(style, 7)
    return ImageFont.truetype(AVENIR, size=size, index=index)


def fit_crop(path, size=(W, H), focus=(0.5, 0.5)):
    im = Image.open(path).convert('RGB')
    ratio = max(size[0] / im.width, size[1] / im.height)
    nw, nh = round(im.width * ratio), round(im.height * ratio)
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    left = int((nw - size[0]) * focus[0])
    top = int((nh - size[1]) * focus[1])
    left = max(0, min(left, nw - size[0]))
    top = max(0, min(top, nh - size[1]))
    return im.crop((left, top, left + size[0], top + size[1]))


def contain(path, max_size):
    im = Image.open(path).convert('RGBA')
    im.thumbnail(max_size, Image.Resampling.LANCZOS)
    return im


def paste_logo(canvas, x, y, width=300, light=False):
    logo = contain(LOGO_LIGHT if light else LOGO_DARK, (width, 220))
    canvas.alpha_composite(logo, (x, y))
    return logo.size


def draw_tracking(draw, xy, text, fnt, fill, spacing=3):
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=fnt, fill=fill)
        x += draw.textlength(ch, font=fnt) + spacing


def wrapped_lines(draw, text, fnt, max_width):
    words = text.split()
    lines, current = [], ''
    for word in words:
        trial = f'{current} {word}'.strip()
        if draw.textlength(trial, font=fnt) <= max_width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def draw_wrapped(draw, xy, text, fnt, fill, max_width, line_gap=8):
    x, y = xy
    lines = wrapped_lines(draw, text, fnt, max_width)
    for line in lines:
        draw.text((x, y), line, font=fnt, fill=fill)
        bbox = draw.textbbox((x, y), line, font=fnt)
        y += (bbox[3] - bbox[1]) + line_gap
    return y


def shadow_card(canvas, box, radius=36, fill=IVORY_2, blur=18, offset=(0, 10)):
    layer = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
    ld = ImageDraw.Draw(layer)
    x0, y0, x1, y1 = box
    ld.rounded_rectangle((x0 + offset[0], y0 + offset[1], x1 + offset[0], y1 + offset[1]), radius=radius, fill=(0, 0, 0, 52))
    layer = layer.filter(ImageFilter.GaussianBlur(blur))
    canvas.alpha_composite(layer)
    ImageDraw.Draw(canvas).rounded_rectangle(box, radius=radius, fill=fill)


def top_label(draw, x, y, text='LEON GROUP • BUILT TO LEAD', light=False):
    fill = IVORY if light else ORANGE_DARK
    draw_tracking(draw, (x, y), text, font(18, 'demi'), fill, spacing=2)


def footer(canvas, number, light=False):
    draw = ImageDraw.Draw(canvas)
    color = IVORY if light else INK
    draw.line((62, 1265, 146, 1265), fill=ORANGE, width=7)
    draw_tracking(draw, (165, 1249), '@LEONGROUP.BUILTOLEAD', font(17, 'demi'), color, spacing=1)
    draw.text((968, 1242), f'{number:02d}', font=font(22, 'bold'), fill=color, anchor='ra')


def title(draw, x, y, lines, size=76, fill=INK, accent_last=False, max_width=870):
    f = font(size, 'heavy')
    yy = y
    for i, line in enumerate(lines):
        color = ORANGE if accent_last and i == len(lines) - 1 else fill
        draw.text((x, yy), line, font=f, fill=color, stroke_width=0)
        yy += size + 8
    return yy


def save(canvas, name):
    path = OUT / name
    canvas.convert('RGB').save(path, quality=96, subsampling=0)
    return path


def post_photo_card(photo, name, number, label, lines, subtitle, focus=(0.5, 0.5), card=(54, 64, 728, 735), accent_last=False):
    bg = fit_crop(photo, focus=focus).convert('RGBA')
    # Gentle warmth keeps the feed bright and cohesive.
    tint = Image.new('RGBA', (W, H), (247, 243, 234, 22))
    bg.alpha_composite(tint)
    shadow_card(bg, card, radius=38, fill=(255, 253, 248, 242), blur=22)
    d = ImageDraw.Draw(bg)
    x0, y0, x1, y1 = card
    top_label(d, x0 + 50, y0 + 44, label)
    d.line((x0 + 50, y0 + 96, x0 + 160, y0 + 96), fill=ORANGE, width=8)
    yy = title(d, x0 + 50, y0 + 138, lines, 72 if max(map(len, lines)) < 16 else 64, accent_last=accent_last)
    yy += 22
    draw_wrapped(d, (x0 + 52, yy), subtitle, font(27, 'medium'), MUTED, x1 - x0 - 105, 8)
    paste_logo(bg, x0 + 48, y1 - 118, 285)
    footer(bg, number)
    return save(bg, name)


def light_canvas():
    return Image.new('RGBA', (W, H), IVORY)


def post_02():
    im = light_canvas(); d = ImageDraw.Draw(im)
    top_label(d, 64, 62, 'PRESENÇA DIGITAL')
    title(d, 62, 132, ['SUA EMPRESA', 'EXISTE ONLINE?'], 78, accent_last=True)
    d.text((64, 332), 'Se o cliente pesquisar hoje, o que encontra?', font=font(29, 'medium'), fill=MUTED)
    # Browser/search card
    shadow_card(im, (60, 430, 1020, 1090), radius=34, fill=IVORY_2)
    d = ImageDraw.Draw(im)
    d.ellipse((95, 465, 113, 483), fill=ORANGE)
    d.ellipse((126, 465, 144, 483), fill=SAND)
    d.ellipse((157, 465, 175, 483), fill=SAND)
    d.rounded_rectangle((95, 520, 985, 602), radius=34, outline='#D8D1C8', width=3, fill=WHITE)
    d.ellipse((126, 545, 150, 569), outline=INK, width=4)
    d.line((147, 567, 160, 580), fill=INK, width=4)
    d.text((186, 538), 'sua empresa + sua região', font=font(24, 'regular'), fill=MUTED)
    items = [('SERVIÇO', 'O que sua empresa faz'), ('REGIÃO', 'Onde você atende'), ('CONTATO', 'Como iniciar uma conversa')]
    y = 660
    for tag, text_value in items:
        d.rounded_rectangle((98, y, 260, y + 54), radius=27, fill=ORANGE_PALE)
        d.text((179, y + 27), tag, font=font(18, 'bold'), fill=ORANGE_DARK, anchor='mm')
        d.text((294, y + 6), text_value, font=font(27, 'demi'), fill=INK)
        d.line((294, y + 47, 935, y + 47), fill='#DDD6CD', width=2)
        y += 116
    paste_logo(im, 64, 1142, 295)
    footer(im, 2)
    return save(im, '02-sua-empresa-existe-online.png')


def post_03():
    im = Image.new('RGBA', (W, H), ORANGE)
    d = ImageDraw.Draw(im)
    # Architectural orange-on-orange field
    d.ellipse((555, -120, 1230, 555), outline='#F08A55', width=54)
    d.ellipse((660, 780, 1270, 1390), outline='#F08A55', width=54)
    shadow_card(im, (62, 170, 1018, 1090), radius=52, fill=IVORY_2, blur=20)
    d = ImageDraw.Draw(im)
    top_label(d, 118, 228, 'POSICIONAMENTO')
    title(d, 116, 320, ['MARCA', 'TAMBÉM VENDE'], 92, accent_last=True)
    d.text((120, 550), 'Consistência aumenta a percepção de valor.', font=font(30, 'medium'), fill=MUTED)
    questions = [('01', 'QUEM É VOCÊ?'), ('02', 'O QUE VOCÊ FAZ?'), ('03', 'POR QUE CONFIAR?')]
    y = 690
    for num, txt in questions:
        d.text((120, y), num, font=font(22, 'bold'), fill=ORANGE)
        d.text((190, y - 8), txt, font=font(31, 'demi'), fill=INK)
        d.line((120, y + 54, 930, y + 54), fill=SAND, width=3)
        y += 104
    paste_logo(im, 117, 958, 285)
    footer(im, 3, light=True)
    return save(im, '03-marca-tambem-vende.png')


def post_04():
    bg = fit_crop(PHOTO_EXTERIOR, focus=(0.52, 0.45)).convert('RGBA')
    # Bottom panel leaves the bright sky visible.
    panel = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    pd = ImageDraw.Draw(panel)
    pd.rectangle((0, 785, W, H), fill=(247, 243, 234, 248))
    bg.alpha_composite(panel)
    d = ImageDraw.Draw(bg)
    top_label(d, 62, 835, 'GOOGLE BUSINESS PROFILE')
    title(d, 60, 900, ['SEJA ENCONTRADO'], 82, accent_last=True)
    d.text((64, 1015), 'Informação correta. Fotos reais. Contato claro.', font=font(28, 'medium'), fill=MUTED)
    paste_logo(bg, 64, 1120, 295)
    footer(bg, 4)
    return save(bg, '04-seja-encontrado.png')


def post_05():
    im = light_canvas(); d = ImageDraw.Draw(im)
    top_label(d, 64, 62, 'LANDING PAGE')
    title(d, 62, 128, ['UMA PÁGINA.', 'UM OBJETIVO.'], 83, accent_last=True)
    d.text((64, 347), 'Clareza para transformar visita em contato.', font=font(29, 'medium'), fill=MUTED)
    # Stylized landing page wireframe
    shadow_card(im, (66, 445, 1014, 1105), radius=28, fill=IVORY_2)
    d = ImageDraw.Draw(im)
    d.rectangle((66, 445, 1014, 525), fill=INK)
    d.ellipse((105, 474, 127, 496), fill=ORANGE)
    d.rounded_rectangle((740, 466, 960, 505), radius=19, fill=ORANGE)
    d.text((850, 485), 'REQUEST ESTIMATE', font=font(14, 'bold'), fill=WHITE, anchor='mm')
    d.text((112, 600), 'SERVIÇO CLARO.', font=font(49, 'heavy'), fill=INK)
    d.text((112, 662), 'PRÓXIMO PASSO CLARO.', font=font(32, 'demi'), fill=ORANGE)
    d.rounded_rectangle((112, 750, 515, 1018), radius=22, fill=ORANGE_PALE)
    d.rectangle((160, 790, 467, 817), fill=ORANGE)
    for i, width in enumerate((285, 248, 301, 212)):
        d.rectangle((160, 855 + i * 38, 160 + width, 869 + i * 38), fill='#C9BFB5')
    d.rounded_rectangle((575, 750, 940, 830), radius=38, fill=ORANGE)
    d.text((757, 790), 'FALE CONOSCO', font=font(22, 'bold'), fill=WHITE, anchor='mm')
    d.text((575, 887), '• Serviço\n• Região\n• Diferenciais\n• Contato', font=font(25, 'medium'), fill=INK, spacing=14)
    paste_logo(im, 64, 1145, 295)
    footer(im, 5)
    return save(im, '05-uma-pagina-um-objetivo.png')


def post_06():
    bg = fit_crop(PHOTO_KITCHEN, focus=(0.74, 0.46)).convert('RGBA')
    overlay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); od = ImageDraw.Draw(overlay)
    od.rounded_rectangle((50, 58, 770, 570), radius=42, fill=(247, 243, 234, 246))
    od.rounded_rectangle((50, 970, 828, 1190), radius=32, fill=(23, 23, 23, 235))
    bg.alpha_composite(overlay)
    d = ImageDraw.Draw(bg)
    top_label(d, 95, 105, 'CONTEÚDO QUE CONECTA')
    title(d, 92, 180, ['NÃO PAREÇA', 'UM ANÚNCIO'], 74, accent_last=True)
    d.text((96, 377), 'Mostre o processo. Explique o problema.', font=font(27, 'medium'), fill=MUTED)
    d.text((96, 420), 'Fale como você falaria com um cliente.', font=font(27, 'medium'), fill=MUTED)
    d.text((96, 1021), 'CLAREZA + AUTENTICIDADE', font=font(29, 'bold'), fill=WHITE)
    d.text((96, 1070), 'mais verdade, menos efeito', font=font(26, 'regular'), fill=ORANGE_PALE)
    footer(bg, 6, light=True)
    return save(bg, '06-nao-pareca-um-anuncio.png')


def post_07():
    im = light_canvas(); d = ImageDraw.Draw(im)
    d.rectangle((0, 0, W, 550), fill=INK)
    top_label(d, 64, 66, 'VÍDEO PARA HOME SERVICES', light=True)
    title(d, 62, 150, ['O ÁUDIO', 'IMPORTA'], 94, fill=IVORY, accent_last=True)
    # Waveform
    x = 66
    heights = [38, 72, 112, 58, 150, 94, 186, 78, 136, 52, 110, 70, 42]
    for h in heights:
        d.rounded_rectangle((x, 475 - h // 2, x + 16, 475 + h // 2), radius=8, fill=ORANGE if h > 100 else '#F3C4A9')
        x += 46
    d.text((64, 635), 'ANTES DE GRAVAR', font=font(22, 'bold'), fill=ORANGE_DARK)
    items = ['REDUZA O BARULHO', 'APROXIME O CELULAR', 'EVITE VENTO NO MICROFONE', 'USE FRASES CURTAS', 'ADICIONE LEGENDAS']
    y = 706
    for i, item in enumerate(items, 1):
        d.ellipse((64, y - 3, 108, y + 41), fill=ORANGE_PALE)
        d.text((86, y + 18), str(i), font=font(18, 'bold'), fill=ORANGE_DARK, anchor='mm')
        d.text((136, y), item, font=font(27, 'demi'), fill=INK)
        y += 86
    paste_logo(im, 64, 1158, 295)
    footer(im, 7)
    return save(im, '07-o-audio-importa.png')


def post_08():
    bg = fit_crop(PHOTO_KITCHEN, focus=(0.26, 0.5)).convert('RGBA')
    # White proposal sheet
    shadow_card(bg, (518, 120, 1012, 1130), radius=26, fill=(255, 253, 248, 247), blur=18)
    d = ImageDraw.Draw(bg)
    top_label(d, 565, 178, 'PROCESSO COMERCIAL')
    d.text((565, 254), 'ESTIMATIVA É', font=font(54, 'heavy'), fill=INK)
    d.text((565, 318), 'EXPERIÊNCIA', font=font(54, 'heavy'), fill=ORANGE)
    d.text((565, 408), 'Seu orçamento também comunica\nprofissionalismo.', font=font(25, 'medium'), fill=MUTED, spacing=8)
    d.line((565, 520, 950, 520), fill=SAND, width=3)
    fields = ['ESCOPO', 'ETAPAS', 'PRAZO', 'CONDIÇÕES', 'VALIDADE']
    y = 575
    for f in fields:
        d.rounded_rectangle((565, y, 600, y + 35), radius=8, outline=ORANGE, width=3)
        d.line((573, y + 18, 583, y + 28), fill=ORANGE, width=3)
        d.line((583, y + 28, 594, y + 9), fill=ORANGE, width=3)
        d.text((624, y - 1), f, font=font(24, 'demi'), fill=INK)
        y += 88
    paste_logo(bg, 564, 1000, 280)
    footer(bg, 8, light=True)
    return save(bg, '08-estimativa-e-experiencia.png')


def post_09():
    im = light_canvas(); d = ImageDraw.Draw(im)
    top_label(d, 64, 62, 'PROCESSO DE AQUISIÇÃO')
    title(d, 62, 132, ['DO ANÚNCIO', 'À REUNIÃO'], 86, accent_last=True)
    d.text((64, 350), 'Um processo simples reduz oportunidades perdidas.', font=font(28, 'medium'), fill=MUTED)
    steps = [('01', 'ANÚNCIO', 'ATENÇÃO'), ('02', 'WHATSAPP', 'CONTATO'), ('03', 'QUALIFICAÇÃO', 'CONTEXTO'), ('04', 'REUNIÃO', 'DIREÇÃO'), ('05', 'ESTIMATIVA', 'PRÓXIMO PASSO')]
    y = 470
    for i, (num, step, role) in enumerate(steps):
        fill = INK if i == 3 else (ORANGE if i == 0 else IVORY_2)
        outline = None if i in (0, 3) else '#D9D1C8'
        d.rounded_rectangle((64, y, 1015, y + 116), radius=28, fill=fill, outline=outline, width=3)
        c = WHITE if i in (0, 3) else INK
        d.text((102, y + 58), num, font=font(24, 'bold'), fill=ORANGE_PALE if i in (0, 3) else ORANGE, anchor='lm')
        d.text((196, y + 57), step, font=font(29, 'bold'), fill=c, anchor='lm')
        d.text((950, y + 58), role, font=font(18, 'demi'), fill=ORANGE_PALE if i in (0, 3) else MUTED, anchor='rm')
        if i < len(steps) - 1:
            d.line((140, y + 116, 140, y + 136), fill=ORANGE, width=4)
        y += 136
    paste_logo(im, 64, 1160, 295)
    footer(im, 9)
    return save(im, '09-do-anuncio-a-reuniao.png')


def post_10():
    im = Image.new('RGBA', (W, H), ORANGE_PALE); d = ImageDraw.Draw(im)
    top_label(d, 64, 62, 'QUALIFICAÇÃO DE LEADS')
    title(d, 62, 132, ['QUALIFIQUE', 'ANTES'], 92, accent_last=True)
    d.text((64, 360), 'Quatro pontos para entender melhor o projeto.', font=font(28, 'medium'), fill=MUTED)
    cards = [
        ('B', 'BUDGET', 'faixa de investimento'),
        ('A', 'AUTHORITY', 'quem decide'),
        ('N', 'NEED', 'problema a resolver'),
        ('T', 'TIMELINE', 'quando começar'),
    ]
    coords = [(64, 470), (552, 470), (64, 765), (552, 765)]
    for i, ((letter, name, desc), (x, y)) in enumerate(zip(cards, coords)):
        fill = INK if i == 0 else IVORY_2
        d.rounded_rectangle((x, y, x + 464, y + 250), radius=32, fill=fill)
        d.text((x + 38, y + 34), letter, font=font(62, 'heavy'), fill=ORANGE)
        d.text((x + 118, y + 48), name, font=font(25, 'bold'), fill=WHITE if i == 0 else INK)
        draw_wrapped(d, (x + 40, y + 147), desc.upper(), font(20, 'medium'), ORANGE_PALE if i == 0 else MUTED, 370, 5)
    paste_logo(im, 64, 1125, 295)
    footer(im, 10)
    return save(im, '10-qualifique-antes.png')


def post_11():
    bg = fit_crop(PHOTO_FLOOR, focus=(0.58, 0.5)).convert('RGBA')
    overlay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); od = ImageDraw.Draw(overlay)
    od.rectangle((0, 0, W, H), fill=(23, 23, 23, 48))
    od.rounded_rectangle((54, 56, 1026, 640), radius=44, fill=(255, 253, 248, 245))
    bg.alpha_composite(overlay)
    d = ImageDraw.Draw(bg)
    top_label(d, 98, 105, 'POSICIONAMENTO')
    title(d, 96, 180, ['SEU NICHO', 'É SUA FORÇA'], 78, accent_last=True)
    d.text((98, 380), 'Especialidade clara. Comunicação reconhecível.', font=font(27, 'medium'), fill=MUTED)
    tags = ['FLOORING', 'REMODELING', 'PAINTING', 'ROOFING', 'HVAC']
    x, y = 98, 465
    for tag in tags:
        tw = d.textlength(tag, font=font(18, 'bold')) + 48
        if x + tw > 965:
            x, y = 98, y + 72
        d.rounded_rectangle((x, y, x + tw, y + 48), radius=24, fill=INK)
        d.text((x + tw / 2, y + 24), tag, font=font(18, 'bold'), fill=IVORY, anchor='mm')
        x += tw + 14
    footer(bg, 11, light=True)
    return save(bg, '11-seu-nicho-e-sua-forca.png')


def post_12():
    im = Image.new('RGBA', (W, H), INK); d = ImageDraw.Draw(im)
    d.polygon([(0, 0), (W, 0), (W, 770), (0, 1050)], fill=CHARCOAL)
    d.ellipse((570, -110, 1250, 570), outline='#3D3A36', width=55)
    top_label(d, 64, 72, 'LEON GROUP', light=True)
    title(d, 62, 165, ['CONSISTÊNCIA', 'CONSTRÓI'], 88, fill=IVORY, accent_last=True)
    d.text((66, 390), 'Presença. Conteúdo. Atendimento. Processo.', font=font(28, 'medium'), fill='#D9D1C8')
    # orange progress/building lines
    bars = [(66, 570, 470), (66, 650, 615), (66, 730, 760), (66, 810, 910)]
    for i, (x, y, x2) in enumerate(bars, 1):
        d.text((66, y - 23), f'{i:02d}', font=font(18, 'bold'), fill=ORANGE_PALE)
        d.rounded_rectangle((115, y - 12, x2, y + 12), radius=12, fill=ORANGE)
    d.text((66, 972), 'Não é fazer tudo de uma vez.', font=font(32, 'demi'), fill=IVORY)
    d.text((66, 1025), 'É avançar com direção.', font=font(32, 'demi'), fill=ORANGE)
    paste_logo(im, 64, 1130, 305, light=True)
    footer(im, 12, light=True)
    return save(im, '12-consistencia-constroi.png')


def carousel_slide(number, kicker, heading, body, closing=False):
    im = light_canvas(); d = ImageDraw.Draw(im)
    if closing:
        d.rectangle((0, 0, W, H), fill=INK)
        top_label(d, 64, 65, 'CARROSSEL • PROCESSO COMERCIAL', light=True)
        d.text((64, 155), heading, font=font(78, 'heavy'), fill=IVORY)
        draw_wrapped(d, (64, 250), body, font(30, 'medium'), ORANGE_PALE, 890, 12)
        d.rounded_rectangle((64, 570, 1016, 900), radius=40, fill=ORANGE)
        d.text((540, 680), 'CLAREZA NO PROCESSO', font=font(42, 'heavy'), fill=WHITE, anchor='mm')
        d.text((540, 760), 'melhora cada conversa', font=font(31, 'medium'), fill=WHITE, anchor='mm')
        paste_logo(im, 64, 1090, 320, light=True)
        footer(im, number, light=True)
    else:
        top_label(d, 64, 65, kicker)
        d.text((64, 145), f'{number - 1:02d}', font=font(190, 'heavy'), fill=ORANGE_PALE)
        d.text((64, 390), heading, font=font(78 if len(heading) < 14 else 66, 'heavy'), fill=INK)
        draw_wrapped(d, (68, 515), body, font(35, 'medium'), MUTED, 860, 16)
        d.line((66, 860, 1015, 860), fill=SAND, width=4)
        d.text((66, 905), 'ANÚNCIO  →  WHATSAPP  →  QUALIFICAÇÃO  →', font=font(19, 'bold'), fill=ORANGE_DARK)
        d.text((66, 950), 'REUNIÃO  →  ESTIMATIVA', font=font(19, 'bold'), fill=ORANGE_DARK)
        paste_logo(im, 64, 1110, 305)
        footer(im, number)
    return im


def build_carousel():
    CAR.mkdir(parents=True, exist_ok=True)
    slides = []
    cover = Image.new('RGBA', (W, H), ORANGE); d = ImageDraw.Draw(cover)
    d.ellipse((570, -160, 1240, 510), outline='#F18B56', width=54)
    top_label(d, 64, 66, 'CARROSSEL • PROCESSO COMERCIAL', light=True)
    d.text((64, 200), 'DO ANÚNCIO', font=font(87, 'heavy'), fill=WHITE)
    d.text((64, 300), 'À ESTIMATIVA', font=font(87, 'heavy'), fill=INK)
    d.text((68, 445), 'O caminho de uma oportunidade\nbem conduzida.', font=font(35, 'medium'), fill=WHITE, spacing=12)
    y = 685
    for i, step in enumerate(['ANÚNCIO', 'WHATSAPP', 'QUALIFICAÇÃO', 'REUNIÃO', 'ESTIMATIVA'], 1):
        d.text((75, y), f'{i:02d}', font=font(20, 'bold'), fill=INK)
        d.text((138, y - 4), step, font=font(27, 'bold'), fill=WHITE)
        y += 78
    paste_logo(cover, 64, 1130, 310, light=True)
    footer(cover, 1, light=True)
    slides.append(('01-capa-do-anuncio-a-estimativa.png', cover))
    data = [
        (2, '01 • ANÚNCIO', 'ANÚNCIO', 'Desperte atenção com uma mensagem clara, visual autêntico e um próximo passo simples.'),
        (3, '02 • WHATSAPP', 'WHATSAPP', 'Responda com agilidade, confirme o serviço e organize as informações iniciais.'),
        (4, '03 • QUALIFICAÇÃO', 'QUALIFICAÇÃO', 'Entenda necessidade, região, decisão, prazo e faixa de investimento sem transformar a conversa em interrogatório.'),
        (5, '04 • REUNIÃO', 'REUNIÃO', 'Aprofunde o contexto, alinhe expectativas e registre aquilo que define o projeto.'),
        (6, '05 • ESTIMATIVA', 'ESTIMATIVA', 'Apresente escopo, etapas, condições e próximos passos com transparência.', True),
    ]
    for item in data:
        n, kick, head, body, *last = item
        slides.append((f'{n:02d}-{head.lower().replace("ç", "c").replace("ã", "a")}.png', carousel_slide(n, kick, head, body, bool(last))))
    for name, slide in slides:
        slide.convert('RGB').save(CAR / name, quality=96, subsampling=0)
    thumb_w, thumb_h = 270, 338
    margin, gap = 42, 24
    sheet = Image.new('RGB', (3 * thumb_w + 2 * gap + 2 * margin, 2 * thumb_h + gap + 2 * margin + 82), IVORY)
    sd = ImageDraw.Draw(sheet)
    sd.text((margin, 24), 'CARROSSEL BÔNUS — DO ANÚNCIO À ESTIMATIVA', font=font(27, 'heavy'), fill=INK)
    for i, (_, slide) in enumerate(slides):
        thumb = slide.convert('RGB').resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
        x = margin + (i % 3) * (thumb_w + gap)
        y = margin + 82 + (i // 3) * (thumb_h + gap)
        sheet.paste(thumb, (x, y))
    sheet.save(CAR / '00-VISAO-GERAL-CARROSSEL.jpg', quality=94, subsampling=0)


def contact_sheet(paths):
    thumb_w, thumb_h = 300, 375
    margin, gap = 48, 26
    sheet = Image.new('RGB', (4 * thumb_w + 3 * gap + 2 * margin, 3 * thumb_h + 2 * gap + 2 * margin + 95), IVORY)
    d = ImageDraw.Draw(sheet)
    d.text((margin, 26), 'LEON GROUP — 12 POSTS PARA O FEED', font=font(35, 'heavy'), fill=INK)
    for i, p in enumerate(paths):
        im = Image.open(p).convert('RGB').resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
        x = margin + (i % 4) * (thumb_w + gap)
        y = margin + 95 + (i // 4) * (thumb_h + gap)
        sheet.paste(im, (x, y))
    sheet.save(OUT / '00-VISAO-GERAL-12-POSTS.jpg', quality=94, subsampling=0)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    SRC.mkdir(parents=True, exist_ok=True)
    for src, name in [(PHOTO_FLOOR, 'foto-flooring.png'), (PHOTO_KITCHEN, 'foto-remodeling-cozinha.png'), (PHOTO_EXTERIOR, 'foto-exterior-roofing.png')]:
        shutil.copy2(src, SRC / name)

    paths = []
    paths.append(post_photo_card(PHOTO_FLOOR, '01-do-servico-a-empresa.png', 1, 'CONSTRUÇÃO DE MARCA', ['DO SERVIÇO', 'À EMPRESA'], 'Estrutura transforma habilidade em marca.', focus=(0.53, 0.48), accent_last=True))
    paths.append(post_02())
    paths.append(post_03())
    paths.append(post_04())
    paths.append(post_05())
    paths.append(post_06())
    paths.append(post_07())
    paths.append(post_08())
    paths.append(post_09())
    paths.append(post_10())
    paths.append(post_11())
    paths.append(post_12())
    build_carousel()
    contact_sheet(paths)
    print(f'Created {len(paths)} feed posts in {OUT}')


if __name__ == '__main__':
    main()
