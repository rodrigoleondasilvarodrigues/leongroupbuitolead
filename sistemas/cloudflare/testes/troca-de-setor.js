const fs = require('fs');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync('admin.html', 'utf8');
const painel = JSON.parse(fs.readFileSync('painel.json', 'utf8'));

let ok = 0, falhou = 0;
const t = (nome, cond, detalhe = '') => {
  if (cond) { ok++; console.log('  \x1b[32m✓\x1b[0m ' + nome + (detalhe ? '  → ' + detalhe : '')); }
  else { falhou++; console.log('  \x1b[31m✗ FALHOU\x1b[0m ' + nome + (detalhe ? '  → ' + detalhe : '')); }
};

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  url: 'https://leon-group.leongroup.workers.dev/',
  pretendToBeVisual: true,
  beforeParse(w) {
    let chamadas = 0;
    w.__chamadas = () => chamadas;
    w.fetch = (u) => { chamadas++; return Promise.resolve({ json: () => Promise.resolve(painel) }); };
    w.alert = (m) => { w.__ultimoAlert = m; };
    w.prompt = () => 'EXCLUIR';
    w.scrollTo = () => {};
  },
});
const w = dom.window, doc = w.document;

const txt = (id) => (doc.getElementById(id) || {}).textContent || '';
const abas = () => [...doc.querySelectorAll('#abas button')].map(b => b.textContent.trim().replace(/\s+/g, ' '));
const abaAtiva = () => { const b = doc.querySelector('#abas button.on'); return b ? b.textContent.trim().replace(/\s+/g, ' ') : '(nenhuma)'; };
const setorAtivo = () => { const b = doc.querySelector('#setores button.on'); return b ? b.textContent.trim().replace(/\s+/g, ' ') : '(nenhum)'; };
const temaOperacional = () => doc.body.classList.contains('operacional');
const conteudo = () => (doc.getElementById('conteudo') || {}).innerHTML || '';

setTimeout(() => {
  console.log('\n\x1b[1m═══ 1. ESTADO INICIAL (deve abrir no comercial) ═══\x1b[0m');
  t('requisição inicial disparada', w.__chamadas() >= 1, w.__chamadas() + ' fetch');
  t('selo diz Comercial', txt('selo') === 'Comercial', JSON.stringify(txt('selo')));
  t('tema comercial (body sem .operacional)', !temaOperacional());
  t('botão COMERCIAL está aceso', /COMERCIAL/.test(setorAtivo()), setorAtivo());
  t('switch tem os DOIS setores clicáveis', doc.querySelectorAll('#setores button').length === 2);
  t('sub-abas são os 4 pipelines do comercial', abas().length === 4, abas().join(' | '));
  t('conteúdo lista leads', /Almeida|Rocha|Santos|DF Remodeling/.test(conteudo()));

  console.log('\n\x1b[1m═══ 2. CLIQUE EM "OPERACIONAL" (o bug que você relatou) ═══\x1b[0m');
  const antes = { fetch: w.__chamadas(), selo: txt('selo'), abas: abas().join('|'), conteudo: conteudo().length };
  doc.querySelectorAll('#setores button')[1].click();

  t('selo virou Operacional', txt('selo') === 'Operacional', JSON.stringify(antes.selo) + ' → ' + JSON.stringify(txt('selo')));
  t('tema trocou (body.operacional)', temaOperacional());
  t('botão OPERACIONAL acendeu', /OPERACIONAL/.test(setorAtivo()), setorAtivo());
  t('botão COMERCIAL apagou', !/COMERCIAL/.test(setorAtivo()));
  t('sub-abas trocaram para as 6 visões', abas().length === 6, abas().join(' | '));
  t('aba ativa é "Todos"', /Todos/.test(abaAtiva()), abaAtiva());
  t('conteúdo agora lista clientes', /Dias Tile|Cardoso|Souza|Lima Cabinets|Jhon/.test(conteudo()));
  t('conteúdo NÃO lista mais leads', !/Almeida Flooring/.test(conteudo()));
  t('troca foi INSTANTÂNEA (sem ir ao servidor)', w.__chamadas() === antes.fetch, w.__chamadas() + ' fetch (era ' + antes.fetch + ')');

  console.log('\n\x1b[1m═══ 3. SUB-ABAS DO OPERACIONAL ═══\x1b[0m');
  const botoes = [...doc.querySelectorAll('#abas button')];
  botoes.forEach((b, i) => {
    const rot = b.textContent.trim().replace(/\s+/g, ' ');
    doc.querySelectorAll('#abas button')[i].click();
    const ativa = abaAtiva();
    t('clicar "' + rot + '" move o realce', ativa === rot, 'realce em: ' + ativa);
  });

  console.log('\n\x1b[1m═══ 4. VOLTAR PRO COMERCIAL ═══\x1b[0m');
  doc.querySelectorAll('#setores button')[0].click();
  t('selo voltou pra Comercial', txt('selo') === 'Comercial');
  t('tema voltou', !temaOperacional());
  t('sub-abas voltaram a ser 4', abas().length === 4, abas().join(' | '));
  t('aba resetou pra Leads novos', /Leads novos/.test(abaAtiva()), abaAtiva());
  t('conteúdo lista leads de novo', /Almeida Flooring/.test(conteudo()));

  console.log('\n\x1b[1m═══ 5. IDA E VOLTA 10x (estado não vaza) ═══\x1b[0m');
  for (let i = 0; i < 10; i++) {
    doc.querySelectorAll('#setores button')[1].click();
    doc.querySelectorAll('#setores button')[0].click();
  }
  t('depois de 10 idas e voltas segue no comercial', txt('selo') === 'Comercial' && !temaOperacional() && abas().length === 4);
  t('nenhuma requisição extra nas 20 trocas', w.__chamadas() === antes.fetch, w.__chamadas() + ' fetch no total');

  console.log('\n\x1b[1m═══ 6. CLIQUE REPETIDO NO MESMO SETOR ═══\x1b[0m');
  doc.querySelectorAll('#setores button')[1].click();
  const abaEscolhida = doc.querySelectorAll('#abas button')[3];
  const rotEscolhida = abaEscolhida.textContent.trim().replace(/\s+/g, ' ');
  abaEscolhida.click();
  doc.querySelectorAll('#setores button')[1].click();
  t('clicar OPERACIONAL já estando nele não reseta a sub-aba', abaAtiva() === rotEscolhida, 'ficou em: ' + abaAtiva());

  console.log('\n\x1b[1m═══ 7. ERRO DE JS EM ALGUM PONTO? ═══\x1b[0m');
  t('nenhum erro de JS durante todos os cliques', !w.__erro, w.__erro || 'limpo');

  console.log('\n' + (falhou ? '\x1b[31m' : '\x1b[32m') + '\x1b[1m' + ok + ' passaram, ' + falhou + ' falharam\x1b[0m');
  process.exit(falhou ? 1 : 0);
}, 700);

dom.window.addEventListener('error', e => { dom.window.__erro = String(e.error || e.message); });
