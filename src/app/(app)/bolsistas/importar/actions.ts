"use server";

import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { normalizeCpf } from "@/lib/cpf";
import { parseCsv } from "@/lib/import/csv";
import {
  readRows,
  validateRows,
  type ImportContext,
  type Issue,
} from "@/lib/import/validate";

/**
 * Importação por planilha, etapa 1: CONFERÊNCIA (nada é gravado).
 * SOMENTE administrador. Toda a validação roda aqui no servidor.
 */

const MAX_BYTES = 1_000_000; // 1 MB
const CHUNK = 100;

/** Resultado enviado para a tela. Não leva CPF nem outros dados sensíveis. */
export type PreviewResult =
  | { fatal: string }
  | {
      fatal?: undefined;
      totalRows: number;
      newScholars: number;
      existingScholars: number;
      /** Linhas válidas que usam um CPF já cadastrado: a gravação vai perguntar se atualiza. */
      existingNames: string[];
      issues: Issue[];
    };

/** Excel em português costuma salvar CSV em Windows-1252; tentamos UTF-8 e depois esse. */
function decode(buffer: ArrayBuffer): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    return new TextDecoder("windows-1252").decode(buffer);
  }
}

export async function previewImport(
  formData: FormData,
): Promise<PreviewResult> {
  await requireAdmin();

  const file = formData.get("arquivo");
  if (!(file instanceof File) || file.size === 0) {
    return { fatal: "Escolha um arquivo CSV." };
  }
  if (file.size > MAX_BYTES) {
    return { fatal: "O arquivo é grande demais (máximo de 1 MB)." };
  }

  const parsed = readRows(parseCsv(decode(await file.arrayBuffer())));
  if ("fatal" in parsed) return { fatal: parsed.fatal };

  const supabase = await createClient();

  // Listas de apoio e administradores.
  const [institutions, campuses, positionTypes, editais, admins] =
    await Promise.all([
      supabase.from("institutions").select("id, name"),
      supabase.from("campuses").select("id, name, institution_id"),
      supabase.from("position_types").select("id, name"),
      supabase.from("editais").select("id, code"),
      supabase
        .from("profiles")
        .select("id, email")
        .eq("role", "admin")
        .eq("status", "ativo"),
    ]);
  if (
    institutions.error ||
    campuses.error ||
    positionTypes.error ||
    editais.error ||
    admins.error
  ) {
    return {
      fatal: "Não foi possível consultar os cadastros. Tente novamente.",
    };
  }

  // Bolsistas que já existem (pelo CPF), em lotes para não estourar o tamanho da consulta.
  const cpfs = [
    ...new Set(parsed.rows.map((r) => normalizeCpf(r.values.cpf))),
  ].filter((c) => c.length === 11);

  const existingByCpf: ImportContext["existingByCpf"] = new Map();
  const scholarIds: string[] = [];
  for (let i = 0; i < cpfs.length; i += CHUNK) {
    const { data, error } = await supabase
      .from("scholar_sensitive")
      .select("cpf, scholar_id, scholars!inner(full_name)")
      .in("cpf", cpfs.slice(i, i + CHUNK));
    if (error) return { fatal: "Não foi possível consultar os bolsistas." };
    for (const row of data ?? []) {
      const scholar = Array.isArray(row.scholars)
        ? row.scholars[0]
        : row.scholars;
      existingByCpf.set(row.cpf, {
        scholarId: row.scholar_id,
        fullName: scholar?.full_name ?? "",
      });
      scholarIds.push(row.scholar_id);
    }
  }

  // Convocações que esses bolsistas já têm (uma por edital).
  const existingAssignments = new Set<string>();
  for (let i = 0; i < scholarIds.length; i += CHUNK) {
    const { data, error } = await supabase
      .from("assignments")
      .select("scholar_id, edital_id")
      .in("scholar_id", scholarIds.slice(i, i + CHUNK));
    if (error) return { fatal: "Não foi possível consultar as convocações." };
    for (const a of data ?? []) {
      existingAssignments.add(`${a.scholar_id}|${a.edital_id}`);
    }
  }

  const { valid, issues } = validateRows(parsed.rows, {
    institutions: institutions.data ?? [],
    campuses: campuses.data ?? [],
    positionTypes: positionTypes.data ?? [],
    editais: editais.data ?? [],
    admins: admins.data ?? [],
    existingByCpf,
    existingAssignments,
  });

  const existing = valid.filter((r) => r.existingScholarId);
  return {
    totalRows: parsed.rows.length,
    newScholars: new Set(
      valid.filter((r) => !r.existingScholarId).map((r) => r.cpf),
    ).size,
    existingScholars: new Set(existing.map((r) => r.cpf)).size,
    existingNames: [...new Set(existing.map((r) => r.fullName))],
    issues,
  };
}
