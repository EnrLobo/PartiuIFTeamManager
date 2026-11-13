import { csvCell } from "./csv";

/**
 * A planilha-modelo: uma linha por convocação.
 * Os nomes das colunas (key) são fixos; é isso que torna a importação igual para qualquer edital.
 */
export type ColumnKey =
  | "nome_completo"
  | "cpf"
  | "email"
  | "telefone"
  | "banco"
  | "agencia"
  | "conta"
  | "tipo_conta"
  | "tipo_chave_pix"
  | "chave_pix"
  | "instituicao"
  | "campus"
  | "edital"
  | "tipo_vaga"
  | "titulo_vaga"
  | "situacao"
  | "responsavel_convocacao"
  | "email_enviado_em"
  | "prazo_resposta"
  | "inicio_termo"
  | "fim_termo";

export const COLUMNS: {
  key: ColumnKey;
  required: boolean;
  example: string;
}[] = [
  { key: "nome_completo", required: true, example: "Maria da Silva Exemplo" },
  { key: "cpf", required: true, example: "123.456.789-09" },
  { key: "email", required: false, example: "maria@exemplo.com" },
  { key: "telefone", required: false, example: "(11) 99999-0000" },
  { key: "banco", required: false, example: "Banco Exemplo" },
  { key: "agencia", required: false, example: "0001" },
  { key: "conta", required: false, example: "12345-6" },
  { key: "tipo_conta", required: false, example: "Corrente" },
  { key: "tipo_chave_pix", required: false, example: "E-mail" },
  { key: "chave_pix", required: false, example: "maria@exemplo.com" },
  { key: "instituicao", required: true, example: "(nome igual ao cadastrado)" },
  { key: "campus", required: false, example: "(nome igual ao cadastrado)" },
  { key: "edital", required: true, example: "(código igual ao cadastrado)" },
  { key: "tipo_vaga", required: true, example: "(nome igual ao cadastrado)" },
  { key: "titulo_vaga", required: true, example: "Professor(a) de Matemática" },
  { key: "situacao", required: false, example: "Convocação pendente" },
  {
    key: "responsavel_convocacao",
    required: true,
    example: "e-mail do administrador",
  },
  { key: "email_enviado_em", required: false, example: "10/03/2026" },
  { key: "prazo_resposta", required: false, example: "17/03/2026" },
  { key: "inicio_termo", required: false, example: "01/04/2026" },
  { key: "fim_termo", required: false, example: "31/12/2026" },
];

export const COLUMN_KEYS = COLUMNS.map((c) => c.key);

/** Texto do arquivo-modelo: cabeçalho + uma linha de exemplo (fictícia). Separador ";" para o Excel em português. */
export function templateCsv(): string {
  const header = COLUMNS.map((c) => c.key).join(";");
  const example = COLUMNS.map((c) => csvCell(c.example)).join(";");
  // O BOM no início faz o Excel abrir os acentos corretamente.
  return `﻿${header}\r\n${example}\r\n`;
}
