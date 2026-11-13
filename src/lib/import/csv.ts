/**
 * Leitor de CSV simples (sem biblioteca).
 * Aceita vírgula OU ponto e vírgula (o Excel em português salva com ";"),
 * campos entre aspas, aspas duplas escapadas ("") e quebras de linha do Windows.
 */
export function parseCsv(input: string): string[][] {
  // Remove o BOM (marca invisível que o Excel coloca no início do arquivo).
  const text = input.replace(/^﻿/, "");

  // Descobre o separador pela primeira linha: o que aparecer mais vence.
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const delimiter =
    (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0)
      ? ";"
      : ",";

  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === delimiter) {
      row.push(cell);
      cell = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  // Última linha (quando o arquivo não termina com quebra de linha).
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

/** Escreve um campo para CSV (com aspas quando necessário). */
export function csvCell(value: string): string {
  return /[";,\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}
