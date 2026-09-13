import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { homedir, tmpdir } from 'node:os';
import { INSTRUCOES_IA } from '../src/ai-contexto.js';

const exec = promisify(execFile);
// Somente estas mensagens controladas podem sair do processo para a interface.
const erroPublico = mensagem => Object.assign(new Error(mensagem), { publica: true });
export const CLAUDE_BIN = process.env.LEON_CLAUDE_BIN || homedir() + '/.local/bin/claude';
let authCache;
export async function statusClaude() {
  if (authCache && Date.now() - authCache.em < 20000) return authCache.dados;
  let dados;
  try {
    const { stdout } = await exec(CLAUDE_BIN, ['auth', 'status', '--json'], { timeout: 10000, maxBuffer: 32000, cwd: tmpdir() });
    const r = JSON.parse(stdout);
    dados = { conectado: r.loggedIn === true && r.authMethod === 'claude.ai', motor: 'Claude Code',
      mensagem: r.loggedIn && r.authMethod === 'claude.ai' ? 'Claude conectado pela assinatura neste Mac.' : 'Abra o Claude Code e entre com sua assinatura.' };
  } catch { dados = { conectado: false, motor: 'Claude Code', mensagem: 'Abra o Claude Code e entre com sua assinatura neste Mac.' }; }
  authCache = { em: Date.now(), dados };
  return dados;
}

export function executarClaude({ prompt, signal, onDelta = () => {}, timeout = 180000, binary = CLAUDE_BIN }) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(erroPublico('Resposta interrompida.'));
    const env = { ...process.env };
    // O assistente tem sua própria conversa e não reutiliza a sessão do editor.
    delete env.CLAUDECODE;
    delete env.ANTHROPIC_API_KEY;
    delete env.ANTHROPIC_AUTH_TOKEN;
    delete env.ANTHROPIC_BASE_URL;
    const args = ['--safe-mode', '-p', '--tools', '', '--strict-mcp-config',
      '--no-session-persistence', '--disable-slash-commands', '--permission-mode', 'dontAsk',
      '--permission-prompts', 'none', '--output-format', 'stream-json', '--verbose',
      '--include-partial-messages', '--effort', 'medium', '--system-prompt', INSTRUCOES_IA];
    const child = spawn(binary, args, { cwd: tmpdir(), env, detached: true, stdio: ['pipe', 'pipe', 'pipe'] });
    let buffer = '', bytes = 0, result, failure, killTimer;
    const stop = reason => {
      if (failure) return;
      failure = erroPublico(reason);
      try { process.kill(-child.pid, 'SIGINT'); } catch {}
      killTimer = setTimeout(() => { try { process.kill(-child.pid, 'SIGKILL'); } catch {} }, 2000);
      killTimer.unref();
    };
    const abort = () => stop('Resposta interrompida.');
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) abort();
    const timer = setTimeout(() => stop('O Claude demorou mais de três minutos. Tente uma pergunta menor.'), timeout);
    const line = raw => {
      if (!raw.trim()) return;
      let e; try { e = JSON.parse(raw); } catch { return; }
      if (!failure && e.type === 'stream_event' && e.event?.delta?.type === 'text_delta' && typeof e.event.delta.text === 'string') {
        try { onDelta(e.event.delta.text); }
        catch { stop('Não foi possível entregar a resposta ao CRM. Tente novamente.'); }
      }
      if (e.type === 'result') result = e;
    };
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', chunk => {
      bytes += Buffer.byteLength(chunk);
      if (bytes > 2000000) return stop('Resposta muito longa. Divida o pedido em partes.');
      buffer += chunk;
      let p; while ((p = buffer.indexOf('\n')) >= 0) { line(buffer.slice(0, p)); buffer = buffer.slice(p + 1); }
    });
    // Erros brutos do CLI podem conter informações da conta. Não enviar ao browser.
    child.stderr.resume();
    child.stdin.on('error', () => {});
    const cleanup = () => { clearTimeout(timer); clearTimeout(killTimer); signal?.removeEventListener('abort', abort); };
    child.on('error', () => { cleanup(); reject(erroPublico('Claude Code não encontrado. Confira a instalação neste Mac.')); });
    child.on('close', code => {
      cleanup(); line(buffer);
      if (failure) return reject(failure);
      if (code !== 0 || result?.is_error || typeof result?.result !== 'string' || !result.result.trim()) {
        return reject(erroPublico('O Claude não concluiu a resposta. Confira a sessão e os limites da assinatura no Claude Code e tente novamente.'));
      }
      if (result.result.length > 120000) return reject(erroPublico('Resposta muito longa. Divida o pedido em partes.'));
      resolve({ texto: result.result });
    });
    child.stdin.end(prompt);
  });
}
