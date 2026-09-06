from __future__ import annotations

import html
import json
import re
import shutil
from datetime import datetime
from pathlib import Path


ROOT = Path('/Users/macbook/Documents/Codex/2026-08-23/eu-x20')
SESSION = Path('/Users/macbook/.codex/sessions/2026/08/23/rollout-2026-08-23T11-43-11-01a02f13-5457-7193-845d-3f8eddbed099.jsonl')
OUT = ROOT / 'claude-context'
TRANSCRIPT = OUT / 'CONVERSA-COMPLETA.md'
INVENTORY = OUT / 'INVENTARIO-DE-ARQUIVOS.md'
TREE = OUT / 'ARVORE-PRINCIPAL.txt'
SOURCES = OUT / 'FONTES'


def visible_text(payload: dict) -> str:
    content = payload.get('content', [])
    if isinstance(content, str):
        return content
    parts: list[str] = []
    for block in content:
        if not isinstance(block, dict):
            continue
        if block.get('type') in {'input_text', 'output_text', 'text'} and block.get('text'):
            parts.append(str(block['text']))
    return '\n'.join(parts).strip()


def is_injected_context(text: str) -> bool:
    stripped = text.lstrip()
    prefixes = (
        '<recommended_plugins>',
        '# AGENTS.md instructions',
        '<environment_context>',
        '<skills_instructions>',
        '<apps_instructions>',
        '<plugins_instructions>',
    )
    return any(stripped.startswith(prefix) for prefix in prefixes)


def clean_text(text: str) -> str:
    text = html.unescape(text)
    text = text.replace('\u00a0', ' ')
    return text.strip()


def redact_sensitive_text(text: str) -> str:
    """Remove credential-like lines even when they appear in later recaps."""
    redacted: list[str] = []
    for line in text.splitlines():
        if re.search(r'(?i)\b(senha|password|passphrase|api[ _-]?key|secret|token)\b\s*(?:-base)?\s*:', line):
            prefix = re.match(r'^(\s*(?:[-*+]\s*)?)', line).group(1)
            redacted.append(f'{prefix}[DADO SENSÍVEL REMOVIDO]')
        else:
            redacted.append(line)
    return '\n'.join(redacted)


def parse_messages() -> list[dict]:
    messages: list[dict] = []
    last_user_text = ''
    with SESSION.open('r', encoding='utf-8') as handle:
        for line in handle:
            try:
                event = json.loads(line)
            except json.JSONDecodeError:
                continue
            if event.get('type') != 'response_item':
                continue
            payload = event.get('payload', {})
            if payload.get('type') != 'message':
                continue
            role = payload.get('role')
            if role not in {'user', 'assistant'}:
                continue
            text = clean_text(visible_text(payload))
            if not text or is_injected_context(text):
                continue
            if role == 'user':
                last_user_text = text
            elif 'senha' in last_user_text.lower():
                text = '[CONTEÚDO SENSÍVEL REMOVIDO: resposta que continha uma sugestão de senha. Senhas não devem ser armazenadas no contexto do projeto.]'
            text = redact_sensitive_text(text)
            messages.append({
                'timestamp': event.get('timestamp', ''),
                'role': role,
                'phase': payload.get('phase', ''),
                'text': text,
            })
    return messages


def format_time(value: str) -> str:
    if not value:
        return ''
    try:
        parsed = datetime.fromisoformat(value.replace('Z', '+00:00'))
        return parsed.strftime('%Y-%m-%d %H:%M UTC')
    except ValueError:
        return value


def write_transcript(messages: list[dict]) -> None:
    lines = [
        '# Conversa completa — Leon Group',
        '',
        '> Exportação das mensagens visíveis entre o usuário e o assistente. Mensagens internas, raciocínio, instruções de sistema, resultados técnicos e senhas foram excluídos.',
        '>',
        '> Este arquivo é histórico. O ponto de entrada para o Claude Code é `ENTREGUE-AO-CLAUDE-CODE.md`, na raiz.',
        '',
    ]
    for index, msg in enumerate(messages, 1):
        who = 'Usuário' if msg['role'] == 'user' else 'Assistente'
        phase = ' — atualização' if msg.get('phase') == 'commentary' else ''
        lines.extend([
            f"## {index:03d} — {who}{phase}",
            '',
            f"Data: {format_time(msg['timestamp'])}",
            '',
            msg['text'],
            '',
        ])
    TRANSCRIPT.write_text('\n'.join(lines), encoding='utf-8')


def human_size(size: int) -> str:
    units = ['B', 'KB', 'MB', 'GB']
    value = float(size)
    for unit in units:
        if value < 1024 or unit == units[-1]:
            return f'{value:.1f} {unit}'
        value /= 1024
    return f'{size} B'


def relevant_files() -> list[Path]:
    selected: list[Path] = []
    outputs = ROOT / 'outputs'
    if outputs.exists():
        selected.extend(
            p for p in outputs.rglob('*')
            if p.is_file()
            and p.suffix.lower() != '.zip'
            and 'LEON-GROUP-CLAUDE-CODE-PACOTE' not in p.parts
        )
    selected.extend(p for p in (ROOT / 'work').glob('*.py') if p.is_file())
    selected.extend(p for p in (ROOT / 'work').glob('*.md') if p.is_file())
    for name in ('hotseat-2026-07-resumo.md', 'linha-editorial-clientes-12-posts.md'):
        p = ROOT / 'work' / name
        if p.exists() and p not in selected:
            selected.append(p)
    for name in ('transcricao-com-tempos.txt', 'transcricao-corrida.txt'):
        p = ROOT / 'work/hotseat-2026-07' / name
        if p.exists():
            selected.append(p)
    return sorted(set(selected), key=lambda p: str(p.relative_to(ROOT)).lower())


def write_inventory(files: list[Path]) -> None:
    lines = [
        '# Inventário dos arquivos produzidos',
        '',
        f'Total de arquivos relevantes: **{len(files)}**.',
        '',
        '| Caminho relativo | Tamanho |',
        '|---|---:|',
    ]
    for path in files:
        rel = path.relative_to(ROOT)
        lines.append(f'| `{rel}` | {human_size(path.stat().st_size)} |')
    INVENTORY.write_text('\n'.join(lines) + '\n', encoding='utf-8')


def write_tree(files: list[Path]) -> None:
    TREE.write_text('\n'.join(str(p.relative_to(ROOT)) for p in files) + '\n', encoding='utf-8')


def copy_sources() -> None:
    SOURCES.mkdir(parents=True, exist_ok=True)
    copies = {
        ROOT / 'work/hotseat-2026-07-resumo.md': SOURCES / 'HOTSEAT-2026-07-RESUMO.md',
        ROOT / 'work/hotseat-2026-07/transcricao-com-tempos.txt': SOURCES / 'HOTSEAT-2026-07-TRANSCRICAO.txt',
        ROOT / 'work/linha-editorial-clientes-12-posts.md': SOURCES / 'LINHA-EDITORIAL-CLIENTES-12-POSTS.md',
    }
    for source, destination in copies.items():
        if source.exists():
            shutil.copy2(source, destination)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    messages = parse_messages()
    write_transcript(messages)
    files = relevant_files()
    write_inventory(files)
    write_tree(files)
    copy_sources()
    print(f'Mensagens exportadas: {len(messages)}')
    print(f'Arquivos inventariados: {len(files)}')
    print(f'Destino: {OUT}')


if __name__ == '__main__':
    main()
