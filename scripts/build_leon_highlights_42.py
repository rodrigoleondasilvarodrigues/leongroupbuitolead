from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import importlib.util
import shutil
import zipfile


ROOT = Path('/Users/macbook/Documents/Codex/2026-08-23/eu-x20')
BASE_SCRIPT = ROOT / 'work/build_leon_instagram_feed.py'
OUT = ROOT / 'outputs/LEON-GROUP/03-INSTAGRAM/DESTAQUES-6-ABAS-42-STORIES'
COVERS = OUT / '00-CAPAS-DOS-DESTAQUES'
ZIP_PATH = ROOT / 'outputs/LEON-GROUP/03-INSTAGRAM/LEON-GROUP-DESTAQUES-42-STORIES.zip'
BRAND = ROOT / 'outputs/LEON-GROUP/01-BRAND-KIT-OFICIAL'
PHOTO_DIR = ROOT / 'outputs/LEON-GROUP/03-INSTAGRAM/12-POSTS-PARA-CLIENTES/IMAGENS-BASE-DEMONSTRATIVAS'

PHOTO_FLOOR = PHOTO_DIR / 'foto-flooring-demonstrativa.png'
PHOTO_KITCHEN = PHOTO_DIR / 'foto-remodeling-demonstrativa.png'
PHOTO_EXTERIOR = PHOTO_DIR / 'foto-exterior-demonstrativa.png'

spec = importlib.util.spec_from_file_location('leon_feed_base', BASE_SCRIPT)
b = importlib.util.module_from_spec(spec)
spec.loader.exec_module(b)

W, H = 1080, 1920
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

LOGO_DARK = BRAND / '02-logo-horizontal-transparente.png'
LOGO_LIGHT = BRAND / '06-logo-inversa-transparente.png'
SYMBOL = BRAND / '07-simbolo-transparente.png'


SECTIONS = [
    {
        'slug': '01-START', 'label': 'START', 'icon': 'arrow',
        'slides': [
            {'kind': 'cover', 'kicker': 'COMECE POR AQUI', 'title': 'START\nHERE', 'body': 'Conheça a Leon Group em poucos minutos.'},
            {'kind': 'photo', 'kicker': 'A PRIMEIRA PERGUNTA', 'title': 'SUA EMPRESA É BOA.\nO MERCADO SABE?', 'body': 'Ter qualidade não basta quando o cliente não consegue encontrar, entender ou lembrar da sua empresa.', 'photo': PHOTO_FLOOR},
            {'kind': 'bullets', 'kicker': 'QUEM ATENDEMOS', 'title': 'FEITO PARA QUEM\nCONSTRÓI DE VERDADE', 'body': 'Empresas que executam serviços reais e querem uma presença mais profissional.', 'items': ['Contractors', 'Construction companies', 'Home services nos EUA']},
            {'kind': 'cards', 'kicker': 'O QUE TRAVA O CRESCIMENTO', 'title': 'SEM ESTRUTURA,\nTUDO DEPENDE DA SORTE', 'items': [('01', 'SÓ INDICAÇÃO'), ('02', 'PRESENÇA INCOMPLETA'), ('03', 'LEADS SEM ACOMPANHAMENTO')]},
            {'kind': 'bullets', 'kicker': 'O QUE ORGANIZAMOS', 'title': 'MARKETING COM\nUM CAMINHO CLARO', 'body': 'Cada parte prepara a próxima.', 'items': ['Posicionamento e marca', 'Conteúdo e presença local', 'Landing page e contato', 'Processo comercial']},
            {'kind': 'statement', 'kicker': 'NOSSO PRINCÍPIO', 'title': 'BUILT\nTO LEAD', 'body': 'Construir com direção para que sua empresa seja percebida, escolhida e preparada para crescer.'},
            {'kind': 'cta', 'kicker': 'PRÓXIMO PASSO', 'title': 'QUER UMA VISÃO\nMAIS CLARA DO\nSEU MARKETING?', 'body': 'Envie START no Direct e conte qual serviço sua empresa realiza.', 'cta': 'ENVIAR START'},
        ],
    },
    {
        'slug': '02-SERVICES', 'label': 'SERVICES', 'icon': 'grid',
        'slides': [
            {'kind': 'cover', 'kicker': 'O QUE FAZEMOS', 'title': 'OUR\nSERVICES', 'body': 'Estrutura digital para contractors e home services.'},
            {'kind': 'statement', 'kicker': '01 • BRANDING', 'title': 'BRAND &\nPOSITIONING', 'body': 'Identidade consistente e uma mensagem que explica quem você atende, o que faz e por que conversar com sua empresa.'},
            {'kind': 'photo', 'kicker': '02 • PRESENÇA LOCAL', 'title': 'GOOGLE BUSINESS\nPROFILE', 'body': 'Informações, serviços, regiões e fotos autênticas organizados para facilitar a descoberta da sua empresa.', 'photo': PHOTO_EXTERIOR},
            {'kind': 'statement', 'kicker': '03 • CONVERSÃO', 'title': 'LANDING\nPAGES', 'body': 'Uma página focada em serviço, região, diferenciais verdadeiros e um próximo passo claro.'},
            {'kind': 'photo', 'kicker': '04 • COMUNICAÇÃO', 'title': 'CONTENT &\nCREATIVES', 'body': 'Conteúdo que mostra processo, explica problemas e aproxima a empresa de clientes potenciais.', 'photo': PHOTO_KITCHEN},
            {'kind': 'bullets', 'kicker': '05 • PROCESSO COMERCIAL', 'title': 'LEAD FLOW &\nFOLLOW-UP', 'body': 'Visibilidade precisa chegar a algum lugar.', 'items': ['Entrada organizada', 'Qualificação inicial', 'Agendamento', 'Acompanhamento']},
            {'kind': 'cta', 'kicker': 'QUAL SERVIÇO VOCÊ PRECISA?', 'title': 'VAMOS CONSTRUIR\nA ESTRUTURA CERTA', 'body': 'Envie SERVICES no Direct e descreva o principal objetivo da sua empresa.', 'cta': 'ENVIAR SERVICES'},
        ],
    },
    {
        'slug': '03-PROCESS', 'label': 'PROCESS', 'icon': 'nodes',
        'slides': [
            {'kind': 'cover', 'kicker': 'COMO TRABALHAMOS', 'title': 'OUR\nPROCESS', 'body': 'Um processo simples. Cada etapa com propósito.'},
            {'kind': 'number', 'number': '01', 'kicker': 'PRIMEIRA ETAPA', 'title': 'DIAGNÓSTICO', 'body': 'Entendemos o serviço, a região, a presença atual, os objetivos e o que está impedindo o próximo passo.'},
            {'kind': 'number', 'number': '02', 'kicker': 'SEGUNDA ETAPA', 'title': 'ESTRATÉGIA', 'body': 'Definimos público, oferta, mensagem, canais e prioridades antes de produzir qualquer ativo.'},
            {'kind': 'number', 'number': '03', 'kicker': 'TERCEIRA ETAPA', 'title': 'CONSTRUÇÃO', 'body': 'Criamos e organizamos os ativos aprovados: marca, página, conteúdo, contatos e estrutura comercial.'},
            {'kind': 'number', 'number': '04', 'kicker': 'QUARTA ETAPA', 'title': 'LANÇAMENTO', 'body': 'Publicamos, conectamos os canais e deixamos o caminho do cliente claro do primeiro contato ao próximo passo.'},
            {'kind': 'number', 'number': '05', 'kicker': 'QUINTA ETAPA', 'title': 'OTIMIZAÇÃO', 'body': 'Analisamos o que aconteceu, corrigimos gargalos e melhoramos a estrutura com base em dados reais.'},
            {'kind': 'cta', 'kicker': 'SEM ATALHOS INVENTADOS', 'title': 'DIREÇÃO ANTES\nDE ESCALA', 'body': 'Envie PROCESS no Direct para começar por um diagnóstico.', 'cta': 'ENVIAR PROCESS'},
        ],
    },
    {
        'slug': '04-NICHES', 'label': 'NICHES', 'icon': 'house',
        'slides': [
            {'kind': 'cover', 'kicker': 'QUEM ATENDEMOS', 'title': 'HOME SERVICE\nNICHES', 'body': 'Comunicação pensada para o mercado de construção nos EUA.'},
            {'kind': 'photo', 'kicker': 'FLOORING', 'title': 'O ACABAMENTO\nPRECISA APARECER', 'body': 'Materiais, processo, regiões atendidas e um caminho claro para solicitar contato.', 'photo': PHOTO_FLOOR},
            {'kind': 'photo', 'kicker': 'REMODELING', 'title': 'MOSTRE O PROJETO\nCOM CLAREZA', 'body': 'Serviços bem definidos, etapas compreensíveis e conteúdo que explica a transformação sem inventar resultados.', 'photo': PHOTO_KITCHEN},
            {'kind': 'cards', 'kicker': 'PAINTING + CARPENTRY', 'title': 'DETALHE TAMBÉM\nÉ POSICIONAMENTO', 'items': [('01', 'ESPECIALIDADE'), ('02', 'ACABAMENTO'), ('03', 'PROCESSO')]},
            {'kind': 'photo', 'kicker': 'ROOFING + GUTTERS', 'title': 'PRESENÇA LOCAL\nIMPORTA', 'body': 'Serviço, área atendida, contato e informação confiável para quem precisa agir.', 'photo': PHOTO_EXTERIOR},
            {'kind': 'cards', 'kicker': 'CABINETS + HVAC', 'title': 'CONFIANÇA COMEÇA\nNA EXPLICAÇÃO', 'items': [('01', 'SERVIÇO CLARO'), ('02', 'PROCESSO TÉCNICO'), ('03', 'PRÓXIMO PASSO')]},
            {'kind': 'cta', 'kicker': 'SEU NICHO NÃO ESTÁ AQUI?', 'title': 'FALE COM\nA LEON GROUP', 'body': 'Atendemos diferentes especialidades de construction e home services. Envie NICHES no Direct.', 'cta': 'ENVIAR NICHES'},
        ],
    },
    {
        'slug': '05-FAQ', 'label': 'FAQ', 'icon': 'question',
        'slides': [
            {'kind': 'cover', 'kicker': 'PERGUNTAS FREQUENTES', 'title': 'FAQ', 'body': 'Respostas rápidas antes do primeiro contato.'},
            {'kind': 'faq', 'kicker': 'REGIÃO', 'title': 'VOCÊS ATENDEM\nSOMENTE\nMASSACHUSETTS?', 'body': 'Nosso foco é atender contractors nos EUA, com atenção especial a Massachusetts. A disponibilidade é confirmada durante o diagnóstico.'},
            {'kind': 'faq', 'kicker': 'IDENTIDADE', 'title': 'PRECISO JÁ TER\nUM LOGO?', 'body': 'Não. Podemos organizar uma identidade existente ou iniciar uma nova direção visual de acordo com a necessidade da empresa.'},
            {'kind': 'faq', 'kicker': 'RESULTADOS', 'title': 'VOCÊS GARANTEM\nLEADS?', 'body': 'Não fazemos garantias irreais. Oferta, região, concorrência, orçamento e capacidade de atendimento influenciam o resultado. Estruturamos, testamos e medimos.'},
            {'kind': 'faq', 'kicker': 'ANÚNCIOS', 'title': 'PRECISO INVESTIR\nEM ADS?', 'body': 'Depende do objetivo e da estrutura atual. Presença local, conteúdo, indicação e campanhas podem trabalhar de formas diferentes.'},
            {'kind': 'bullets', 'kicker': 'MATERIAIS', 'title': 'O QUE PRECISO\nENVIAR?', 'body': 'Começamos com aquilo que já existe.', 'items': ['Serviços e regiões', 'Fotos reais autorizadas', 'Contatos da empresa', 'Acessos somente quando necessários']},
            {'kind': 'cta', 'kicker': 'AINDA TEM UMA DÚVIDA?', 'title': 'FALE COM A GENTE', 'body': 'Envie FAQ no Direct e escreva sua pergunta em uma única mensagem.', 'cta': 'ENVIAR FAQ'},
        ],
    },
    {
        'slug': '06-CONTACT', 'label': 'CONTACT', 'icon': 'chat',
        'slides': [
            {'kind': 'cover', 'kicker': 'FALE COM A LEON GROUP', 'title': 'CONTACT', 'body': 'O próximo passo começa com uma conversa clara.'},
            {'kind': 'statement', 'kicker': 'ANTES DA PROPOSTA', 'title': 'VAMOS ENTENDER\nSUA EMPRESA', 'body': 'Serviço, região, objetivo, estrutura atual e capacidade de atendimento vêm antes de qualquer recomendação.'},
            {'kind': 'bullets', 'kicker': 'PRIMEIRA MENSAGEM', 'title': 'ENVIE ESTAS\n3 INFORMAÇÕES', 'items': ['Serviço principal', 'Cidade e estado', 'Objetivo atual']},
            {'kind': 'contact', 'kicker': 'INSTAGRAM', 'title': '@LEONGROUP.\nBUILTOLEAD', 'body': 'Siga o perfil e envie uma mensagem pelo Direct.'},
            {'kind': 'contact', 'kicker': 'E-MAIL', 'title': 'LEONGROUP.\nBUILTOLEAD\n@GMAIL.COM', 'body': 'Use o e-mail para contatos comerciais e envio de informações.'},
            {'kind': 'statement', 'kicker': 'DIRECT', 'title': 'ENVIE A PALAVRA\nSTART', 'body': 'Na mesma mensagem, informe seu serviço e sua região. Assim conseguimos direcionar o próximo passo.'},
            {'kind': 'cta', 'kicker': 'LEON GROUP', 'title': 'READY TO BUILD\nWITH DIRECTION?', 'body': 'Built to Lead.', 'cta': 'ENVIAR START'},
        ],
    },
]


def font(size, style='regular'):
    return b.font(size, style)


def fit_crop(path, focus=(0.5, 0.5)):
    im = Image.open(path).convert('RGB')
    ratio = max(W / im.width, H / im.height)
    nw, nh = round(im.width * ratio), round(im.height * ratio)
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    left = int((nw - W) * focus[0]); top = int((nh - H) * focus[1])
    left = max(0, min(left, nw - W)); top = max(0, min(top, nh - H))
    return im.crop((left, top, left + W, top + H)).convert('RGBA')


def contain(path, max_size):
    im = Image.open(path).convert('RGBA')
    im.thumbnail(max_size, Image.Resampling.LANCZOS)
    return im


def paste_logo(canvas, x, y, width=260, light=False):
    logo = contain(LOGO_LIGHT if light else LOGO_DARK, (width, 180))
    canvas.alpha_composite(logo, (x, y))


def draw_wrapped(draw, xy, text, fnt, fill, max_width, line_gap=10, anchor=None):
    words = text.split()
    lines, current = [], ''
    for word in words:
        trial = (current + ' ' + word).strip()
        if draw.textlength(trial, font=fnt) <= max_width:
            current = trial
        else:
            if current: lines.append(current)
            current = word
    if current: lines.append(current)
    x, y = xy
    for line in lines:
        draw.text((x, y), line, font=fnt, fill=fill, anchor=anchor)
        box = draw.textbbox((x, y), line, font=fnt, anchor=anchor)
        y += box[3] - box[1] + line_gap
    return y


def heading(draw, xy, text, size=78, fill=INK, accent_last=True, max_width=890):
    x, y = xy
    lines = []
    for manual in text.split('\n'):
        words = manual.split(); current = ''
        for word in words:
            trial = (current + ' ' + word).strip()
            if draw.textlength(trial, font=font(size, 'heavy')) <= max_width:
                current = trial
            else:
                if current: lines.append(current)
                current = word
        if current: lines.append(current)
    for i, line in enumerate(lines):
        color = ORANGE if accent_last and i == len(lines) - 1 else fill
        draw.text((x, y), line, font=font(size, 'heavy'), fill=color)
        y += size + 15
    return y


def kicker(draw, text, light=False):
    color = ORANGE_PALE if light else ORANGE_DARK
    b.draw_tracking(draw, (72, 190), text.upper(), font(20, 'demi'), color, spacing=2)


def story_footer(canvas, section_label, index, light=False):
    d = ImageDraw.Draw(canvas)
    color = IVORY if light else INK
    paste_logo(canvas, 72, 1694, 245, light=light)
    d.line((72, 1818, 152, 1818), fill=ORANGE, width=7)
    d.text((174, 1799), f'{section_label}  •  {index:02d}/07', font=font(19, 'demi'), fill=color)
    d.text((1008, 1799), '@LEONGROUP.BUILTOLEAD', font=font(17, 'demi'), fill=color, anchor='ra')


def shadow_card(canvas, box, radius=38, fill=IVORY_2):
    layer = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
    ld = ImageDraw.Draw(layer)
    x0, y0, x1, y1 = box
    ld.rounded_rectangle((x0, y0 + 12, x1, y1 + 12), radius=radius, fill=(0, 0, 0, 48))
    layer = layer.filter(ImageFilter.GaussianBlur(20))
    canvas.alpha_composite(layer)
    ImageDraw.Draw(canvas).rounded_rectangle(box, radius=radius, fill=fill)


def draw_icon(draw, icon, center, scale=1.0, color=INK, bg=ORANGE_PALE):
    cx, cy = center; r = int(145 * scale)
    draw.ellipse((cx-r, cy-r, cx+r, cy+r), fill=bg)
    w = max(5, int(11 * scale))
    if icon == 'arrow':
        draw.line((cx-60*scale, cy+55*scale, cx+55*scale, cy-60*scale), fill=color, width=w)
        draw.line((cx+55*scale, cy-60*scale, cx+55*scale, cy+10*scale), fill=color, width=w)
        draw.line((cx+55*scale, cy-60*scale, cx-15*scale, cy-60*scale), fill=color, width=w)
    elif icon == 'grid':
        for rr in range(2):
            for cc in range(2):
                x0 = cx-78*scale + cc*92*scale; y0 = cy-78*scale + rr*92*scale
                draw.rounded_rectangle((x0, y0, x0+65*scale, y0+65*scale), radius=int(10*scale), outline=color, width=w)
    elif icon == 'nodes':
        draw.line((cx-90*scale, cy, cx+90*scale, cy), fill=color, width=w)
        for x in (cx-90*scale, cx, cx+90*scale):
            draw.ellipse((x-25*scale, cy-25*scale, x+25*scale, cy+25*scale), fill=bg, outline=color, width=w)
    elif icon == 'house':
        pts = [(cx-90*scale, cy-5*scale), (cx, cy-85*scale), (cx+90*scale, cy-5*scale)]
        draw.line(pts, fill=color, width=w, joint='curve')
        draw.rounded_rectangle((cx-68*scale, cy-8*scale, cx+68*scale, cy+82*scale), radius=int(8*scale), outline=color, width=w)
        draw.rectangle((cx-20*scale, cy+30*scale, cx+20*scale, cy+82*scale), outline=color, width=w)
    elif icon == 'question':
        draw.text((cx, cy-12*scale), '?', font=font(int(190*scale), 'heavy'), fill=color, anchor='mm')
    elif icon == 'chat':
        draw.rounded_rectangle((cx-95*scale, cy-70*scale, cx+95*scale, cy+55*scale), radius=int(35*scale), outline=color, width=w)
        draw.polygon([(cx-36*scale, cy+52*scale), (cx-70*scale, cy+105*scale), (cx+5*scale, cy+54*scale)], fill=color)


def base_light(color=IVORY):
    return Image.new('RGBA', (W, H), color)


def render_slide(section, slide, index):
    kind = slide['kind']
    light_footer = False
    if kind == 'cover':
        im = Image.new('RGBA', (W, H), IVORY_2)
        d = ImageDraw.Draw(im)
        d.rectangle((0, 0, 22, H), fill=ORANGE)
        d.ellipse((690, 95, 1170, 575), outline=SAND, width=36)
        kicker(d, slide['kicker'])
        draw_icon(d, section['icon'], (815, 510), .62, color=INK, bg=ORANGE_PALE)
        yy = heading(d, (72, 760), slide['title'], 100 if len(slide['title']) < 15 else 82, fill=INK, accent_last=True, max_width=900)
        d.line((76, yy+15, 220, yy+15), fill=ORANGE, width=8)
        draw_wrapped(d, (76, yy+65), slide['body'], font(33, 'medium'), MUTED, 790, 12)
    elif kind == 'photo':
        # Text-first layout: the source photo is intentionally not used here.
        im = base_light(IVORY_2)
        d = ImageDraw.Draw(im)
        d.ellipse((720, 85, 1200, 565), outline=SAND, width=36)
        kicker(d, slide['kicker'])
        yy = heading(d, (72, 330), slide['title'], 76, max_width=860)
        d.line((74, yy+20, 212, yy+20), fill=ORANGE, width=8)
        shadow_card(im, (70, yy+105, 1010, min(1460, yy+570)), 38, IVORY)
        d = ImageDraw.Draw(im)
        d.rounded_rectangle((118, yy+165, 168, yy+215), radius=25, fill=ORANGE)
        draw_wrapped(d, (118, yy+270), slide['body'], font(32, 'medium'), MUTED, 810, 14)
    elif kind == 'statement' or kind == 'contact' or kind == 'faq':
        bg = IVORY_2
        im = base_light(bg); d = ImageDraw.Draw(im)
        d.ellipse((700, 85, 1210, 595), outline=SAND, width=36)
        kicker(d, slide['kicker'])
        title_size = 70 if kind in ('contact', 'faq') else 82
        yy = heading(d, (72, 330), slide['title'], title_size, max_width=880)
        shadow_card(im, (70, max(825, yy+90), 1010, min(1500, max(825, yy+90)+390)), 38, IVORY_2)
        d = ImageDraw.Draw(im)
        cy = max(825, yy+90)
        d.line((122, cy+72, 260, cy+72), fill=ORANGE, width=8)
        draw_wrapped(d, (122, cy+125), slide['body'], font(31, 'medium'), MUTED, 780, 12)
    elif kind == 'bullets':
        im = base_light(); d = ImageDraw.Draw(im)
        kicker(d, slide['kicker'])
        yy = heading(d, (72, 310), slide['title'], 72, max_width=860)
        if slide.get('body'):
            draw_wrapped(d, (76, yy+30), slide['body'], font(30, 'medium'), MUTED, 820, 10)
        y = max(760, yy+180)
        for i, item in enumerate(slide['items'], 1):
            d.rounded_rectangle((72, y, 1008, y+130), radius=30, fill=ORANGE if i == 1 else IVORY_2, outline=None if i == 1 else '#D9D1C7', width=2)
            d.ellipse((105, y+40, 155, y+90), fill=IVORY if i == 1 else ORANGE_PALE)
            d.text((130, y+65), str(i), font=font(19, 'bold'), fill=ORANGE_DARK, anchor='mm')
            d.text((190, y+65), item.upper(), font=font(25, 'bold'), fill=WHITE if i == 1 else INK, anchor='lm')
            y += 153
    elif kind == 'cards':
        im = base_light(IVORY_2); d = ImageDraw.Draw(im)
        kicker(d, slide['kicker'])
        yy = heading(d, (72, 310), slide['title'], 72, max_width=860)
        y = max(780, yy+110)
        for i, (num, item) in enumerate(slide['items']):
            fill = INK if i == 0 else IVORY_2
            d.rounded_rectangle((72, y, 1008, y+190), radius=36, fill=fill)
            d.text((120, y+95), num, font=font(31, 'heavy'), fill=ORANGE, anchor='lm')
            d.text((240, y+95), item, font=font(30, 'bold'), fill=WHITE if i == 0 else INK, anchor='lm')
            y += 220
    elif kind == 'number':
        im = base_light(); d = ImageDraw.Draw(im)
        kicker(d, slide['kicker'])
        d.text((72, 300), slide['number'], font=font(260, 'heavy'), fill=ORANGE_PALE)
        yy = heading(d, (72, 650), slide['title'], 92, max_width=880)
        d.line((76, yy+30, 220, yy+30), fill=ORANGE, width=8)
        draw_wrapped(d, (76, yy+95), slide['body'], font(34, 'medium'), MUTED, 850, 14)
        # Minimal progress diagram.
        y = 1420
        for n in range(1, 6):
            x = 115 + (n-1)*200
            active = n <= int(slide['number'])
            d.ellipse((x-27, y-27, x+27, y+27), fill=ORANGE if active else IVORY_2, outline=ORANGE, width=3)
            if n < 5: d.line((x+27, y, x+173, y), fill=ORANGE if active else SAND, width=5)
    elif kind == 'cta':
        im = Image.new('RGBA', (W, H), IVORY_2); d = ImageDraw.Draw(im)
        d.rectangle((0, 0, 22, H), fill=ORANGE)
        d.ellipse((700, 80, 1210, 590), outline=SAND, width=36)
        kicker(d, slide['kicker'])
        yy = heading(d, (72, 380), slide['title'], 78, fill=INK, accent_last=True, max_width=890)
        d.line((76, yy+18, 220, yy+18), fill=ORANGE, width=8)
        draw_wrapped(d, (76, yy+70), slide['body'], font(32, 'medium'), MUTED, 820, 12)
        d.rounded_rectangle((72, 1280, 825, 1395), radius=57, fill=INK)
        d.text((448, 1337), slide['cta'], font=font(27, 'bold'), fill=WHITE, anchor='mm')
        d.text((72, 1465), 'LEON GROUP — BUILT TO LEAD.', font=font(23, 'demi'), fill=INK)
    else:
        raise ValueError(kind)

    story_footer(im, section['label'], index, light=light_footer)
    return im


def render_highlight_cover(section):
    S = 1080
    im = Image.new('RGBA', (S, S), IVORY)
    d = ImageDraw.Draw(im)
    d.ellipse((80, 80, 1000, 1000), fill=IVORY_2, outline=ORANGE, width=28)
    draw_icon(d, section['icon'], (540, 455), 1.15, color=INK, bg=ORANGE_PALE)
    d.text((540, 780), section['label'], font=font(58 if len(section['label']) < 8 else 48, 'heavy'), fill=INK, anchor='mm')
    d.line((420, 860, 660, 860), fill=ORANGE, width=12)
    return im


def overview_for_section(section_dir, section):
    files = sorted(section_dir.glob('[0-9][0-9]-*.png'))
    tw, th = 225, 400
    margin, gap = 48, 24
    canvas = Image.new('RGB', (4*tw + 3*gap + 2*margin, 2*th + gap + 2*margin + 105), IVORY)
    d = ImageDraw.Draw(canvas)
    d.text((margin, 25), f"{section['label']} — 7 STORIES", font=font(34, 'heavy'), fill=INK)
    for i, p in enumerate(files):
        thumb = Image.open(p).convert('RGB').resize((tw, th), Image.Resampling.LANCZOS)
        x = margin + (i % 4)*(tw+gap); y = margin + 105 + (i//4)*(th+gap)
        canvas.paste(thumb, (x, y))
    canvas.save(section_dir / f"00-VISAO-GERAL-{section['label']}.jpg", quality=94, subsampling=0)


def overview_covers():
    files = sorted(COVERS.glob('[0-9][0-9]-*.png'))
    tw = th = 310; margin, gap = 50, 28
    canvas = Image.new('RGB', (3*tw + 2*gap + 2*margin, 2*th + gap + 2*margin + 100), IVORY)
    d = ImageDraw.Draw(canvas)
    d.text((margin, 25), 'LEON GROUP — CAPAS DOS DESTAQUES', font=font(34, 'heavy'), fill=INK)
    for i, p in enumerate(files):
        thumb = Image.open(p).convert('RGB').resize((tw, th), Image.Resampling.LANCZOS)
        x = margin + (i%3)*(tw+gap); y = margin + 100 + (i//3)*(th+gap)
        canvas.paste(thumb, (x, y))
    canvas.save(OUT / '00-VISAO-GERAL-CAPAS.jpg', quality=94, subsampling=0)


def write_readme():
    text = """# Destaques do Instagram — Leon Group

Este pacote contém 6 abas e 7 stories em cada aba, totalizando 42 stories em 1080 × 1920 px.

## Ordem das abas

1. START
2. SERVICES
3. PROCESS
4. NICHES
5. FAQ
6. CONTACT

## Como publicar

Dentro de cada pasta, publique os arquivos na ordem numérica, do 01 ao 07. Depois, salve a sequência no destaque correspondente e use a capa quadrada da pasta `00-CAPAS-DOS-DESTAQUES`.

## Observação importante

As fotografias usadas em algumas composições são imagens editoriais demonstrativas e não representam projetos ou clientes da Leon Group. Não apresente essas imagens como portfólio, case ou prova social. Quando houver fotos reais autorizadas, elas poderão substituir as imagens demonstrativas.

As abas RESULTS, PROJECTS e REVIEWS deverão ser criadas somente quando existirem resultados, trabalhos e avaliações reais autorizados.
"""
    (OUT / '00-LEIA-ME.md').write_text(text, encoding='utf-8')


def build_zip():
    if ZIP_PATH.exists():
        ZIP_PATH.unlink()
    with zipfile.ZipFile(ZIP_PATH, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=8) as zf:
        for path in sorted(OUT.rglob('*')):
            if path.is_file():
                zf.write(path, Path(OUT.name) / path.relative_to(OUT))
    with zipfile.ZipFile(ZIP_PATH) as zf:
        bad = zf.testzip()
        if bad:
            raise RuntimeError(f'ZIP inválido: {bad}')


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    COVERS.mkdir(parents=True, exist_ok=True)
    story_count = 0
    for sec_index, section in enumerate(SECTIONS, 1):
        section_dir = OUT / section['slug']
        section_dir.mkdir(parents=True, exist_ok=True)
        cover = render_highlight_cover(section)
        cover.save(COVERS / f"{sec_index:02d}-{section['label'].lower()}-capa.png")
        for i, slide in enumerate(section['slides'], 1):
            im = render_slide(section, slide, i)
            im.convert('RGB').save(section_dir / f'{i:02d}-{section["label"].lower()}-story.png', quality=96, subsampling=0)
            story_count += 1
        overview_for_section(section_dir, section)
    overview_covers()
    write_readme()
    build_zip()
    print(f'Created {story_count} stories, {len(SECTIONS)} covers and ZIP: {ZIP_PATH}')


if __name__ == '__main__':
    main()
