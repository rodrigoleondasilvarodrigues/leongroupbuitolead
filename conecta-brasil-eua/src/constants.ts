export const CATEGORIAS = {
  empregos: 'Empregos',
  moradia: 'Moradia',
  'compra-e-venda': 'Compra e venda',
  servicos: 'Serviços',
  'uber-delivery': 'Uber e delivery',
  igrejas: 'Igrejas',
  mulheres: 'Mulheres',
  imigracao: 'Imigração',
  eventos: 'Eventos',
  universidade: 'Universidades',
  geral: 'Geral',
} as const;
export type Categoria = keyof typeof CATEGORIAS;
export const CATEGORIA_SLUGS = Object.keys(CATEGORIAS) as Categoria[];

export const STATUS = { ativo: 'Ativo', expirado: 'Expirado', indeterminado: 'Indeterminado' } as const;
export type Status = keyof typeof STATUS;
export const STATUS_LIST = Object.keys(STATUS) as Status[];

export const ESTADOS: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'Califórnia', CO: 'Colorado',
  CT: 'Connecticut', DE: 'Delaware', DC: 'Distrito de Columbia', FL: 'Flórida', GA: 'Geórgia',
  HI: 'Havaí', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas',
  KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts',
  MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana',
  NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'Nova Jersey', NM: 'Novo México',
  NY: 'Nova York', NC: 'Carolina do Norte', ND: 'Dakota do Norte', OH: 'Ohio', OK: 'Oklahoma',
  OR: 'Oregon', PA: 'Pensilvânia', PR: 'Porto Rico', RI: 'Rhode Island', SC: 'Carolina do Sul',
  SD: 'Dakota do Sul', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virgínia',
  WA: 'Washington', WV: 'Virgínia Ocidental', WI: 'Wisconsin', WY: 'Wyoming',
};

/** Colunas do CSV de grupos. `nicho` é opcional na importação (CSVs antigos não têm) e sempre sai na exportação. */
export const CSV_COLUMNS = [
  'codigo', 'link', 'nome_grupo', 'estado', 'cidade', 'categoria',
  'fonte_url', 'data_coleta', 'status', 'ultima_validacao', 'nicho',
] as const;
export const CSV_COLUMNS_OPCIONAIS: readonly string[] = ['nicho'];
export const CSV_COLUMNS_OBRIGATORIAS = CSV_COLUMNS.filter((c) => !CSV_COLUMNS_OPCIONAIS.includes(c));
export type CsvColumn = (typeof CSV_COLUMNS)[number];
export type Grupo = Record<CsvColumn, string>;

export const INVITE_CODE_RE = /^[A-Za-z0-9]{10,40}$/;
export const inviteLink = (codigo: string) => `https://chat.whatsapp.com/${codigo}`;

/** Colunas do CSV de empresas (leads B2B), na ordem oficial. */
export const EMPRESA_COLUMNS = [
  'empresa', 'nicho', 'cidade', 'estado', 'telefone_comercial', 'site', 'instagram', 'facebook',
  'google_nota', 'google_avaliacoes', 'indicio_brasileiro', 'oportunidade_marketing', 'fonte_url', 'data_coleta',
  'arquivo_origem', 'confianca_brasileira',
] as const;
/** Colunas que podem faltar no CSV de empresas (leads_*.csv antigos não têm; empresas_final.csv tem). */
export const EMPRESA_COLUMNS_OPCIONAIS: readonly string[] = ['arquivo_origem', 'confianca_brasileira'];

/** Confiança de que a empresa é brasileira (coluna confianca_brasileira). '' = não classificada (CSVs antigos). */
export const CONFIANCAS = { alta: 'Alta', media: 'Média', baixa: 'Baixa' } as const;
export type Confianca = keyof typeof CONFIANCAS;

/** Status de prospecção (tabela `prospeccao`, editável no site; o reimport nunca mexe). */
export const STATUS_PROSPECCAO = { nao_contatado: 'Não contatado', contatado: 'Contatado', respondeu: 'Respondeu', cliente: 'Cliente' } as const;
export type StatusProspeccao = keyof typeof STATUS_PROSPECCAO;
export const OBSERVACAO_MAX = 1000;
export type EmpresaColumn = (typeof EMPRESA_COLUMNS)[number];
export type Empresa = Record<EmpresaColumn, string>;
/** Empresa como gravada no banco (com as chaves de deduplicação). */
export type EmpresaRow = Empresa & { chave: string; chave_nome: string };
/** Empresa + dados de prospecção (LEFT JOIN com `prospeccao`). */
export type EmpresaView = EmpresaRow & { status_prospeccao: string; data_contato: string; observacao: string };
