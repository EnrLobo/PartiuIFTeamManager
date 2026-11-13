import { isValidCpf, normalizeCpf } from "@/lib/cpf";
import {
  ASSIGNMENT_STATUS_LABELS,
  ASSIGNMENT_STATUSES,
  type AssignmentStatus,
} from "@/lib/roles";
import { COLUMNS, COLUMN_KEYS, type ColumnKey } from "./model";

/**
 * Validação da planilha de importação. Funções puras (sem banco):
 * os dados do banco chegam prontos em "ImportContext", então dá para testar com exemplos.
 * Regra combinada: se QUALQUER linha tiver erro, nada é importado.
 */

export const MAX_ROWS = 1000;

/** Um problema encontrado: a linha (como no Excel, começando em 2), a coluna e o motivo. Sem dados sensíveis. */
export type Issue = { line: number; field: string; message: string };

export type ImportContext = {
  institutions: { id: string; name: string }[];
  campuses: { id: string; name: string; institution_id: string }[];
  positionTypes: { id: string; name: string }[];
  editais: { id: string; code: string }[];
  /** Administradores ativos (quem pode ser "responsável pela convocação"). */
  admins: { id: string; email: string | null }[];
  /** Bolsistas que já existem, pelo CPF (só números). */
  existingByCpf: Map<string, { scholarId: string; fullName: string }>;
  /** Pares "bolsista|edital" que já têm convocação. */
  existingAssignments: Set<string>;
};

/** Uma linha da planilha já lida, com os nomes das colunas. */
export type RawRow = { line: number; values: Record<ColumnKey, string> };

/** Linha validada e traduzida para ids do banco. */
export type ValidRow = {
  line: number;
  fullName: string;
  cpf: string;
  /** Se o CPF já existe, o id do bolsista (a gravação pergunta se atualiza os dados). */
  existingScholarId: string | null;
  contact: {
    email: string | null;
    phone: string | null;
    bank_name: string | null;
    account_type: string | null;
    agency: string | null;
    account_number: string | null;
    pix_key_type: string | null;
    pix_key: string | null;
  };
  assignment: {
    institution_id: string;
    campus_id: string | null;
    edital_id: string;
    position_type_id: string;
    vacancy_title: string;
    status: AssignmentStatus;
    called_by: string;
    email_sent_at: string | null;
    response_deadline: string | null;
    term_start: string | null;
    term_end: string | null;
  };
};

/** Minúsculas, sem acento e sem espaços repetidos: "  Matemática " == "matematica". */
export function norm(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Lê a tabela do CSV: confere o cabeçalho e devolve as linhas com os nomes das colunas.
 * "fatal" = problema no arquivo todo (cabeçalho errado, vazio, grande demais).
 */
export function readRows(
  table: string[][],
): { fatal: string } | { rows: RawRow[] } {
  // Ignora linhas totalmente vazias (comuns no fim de planilhas exportadas).
  const filled = table
    .map((cells, index) => ({ cells, line: index + 1 }))
    .filter(({ cells }) => cells.some((c) => c.trim() !== ""));

  if (filled.length === 0) return { fatal: "O arquivo está vazio." };

  const headers = filled[0].cells.map((h) => norm(h).replace(/ /g, "_"));
  const known = new Set<string>(COLUMN_KEYS);

  const unknown = headers.filter((h) => h && !known.has(h));
  if (unknown.length > 0) {
    return {
      fatal: `Colunas desconhecidas no cabeçalho: ${unknown.join(", ")}. Use o modelo para não errar os nomes.`,
    };
  }
  const duplicated = headers.filter((h, i) => h && headers.indexOf(h) !== i);
  if (duplicated.length > 0) {
    return { fatal: `Coluna repetida no cabeçalho: ${duplicated[0]}.` };
  }
  const missing = COLUMNS.filter((c) => c.required && !headers.includes(c.key));
  if (missing.length > 0) {
    return {
      fatal: `Faltam colunas obrigatórias: ${missing.map((c) => c.key).join(", ")}.`,
    };
  }

  const body = filled.slice(1);
  if (body.length === 0) {
    return {
      fatal: "O arquivo tem só o cabeçalho, sem nenhuma linha de dados.",
    };
  }
  if (body.length > MAX_ROWS) {
    return {
      fatal: `O arquivo tem ${body.length} linhas. O máximo por importação é ${MAX_ROWS}. Divida em partes.`,
    };
  }

  const rows = body.map(({ cells, line }) => {
    const values = Object.fromEntries(
      COLUMN_KEYS.map((key) => {
        const index = headers.indexOf(key);
        return [key, index >= 0 ? (cells[index] ?? "").trim() : ""];
      }),
    ) as Record<ColumnKey, string>;
    return { line, values };
  });

  return { rows };
}

/** Converte DD/MM/AAAA (ou AAAA-MM-DD) em AAAA-MM-DD. Devolve null se não for uma data real. */
export function parseDate(value: string): string | null {
  let year: string, month: string, day: string;
  const br = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (br) [, day, month, year] = br;
  else if (iso) [, year, month, day] = iso;
  else return null;

  const result = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  const date = new Date(`${result}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === result
    ? result
    : null;
}

/** Valida todas as linhas. Devolve as linhas boas (já com ids) e todos os problemas. */
export function validateRows(
  rows: RawRow[],
  ctx: ImportContext,
): { valid: ValidRow[]; issues: Issue[] } {
  const issues: Issue[] = [];
  const valid: ValidRow[] = [];

  const institutions = new Map(ctx.institutions.map((i) => [norm(i.name), i]));
  const positionTypes = new Map(
    ctx.positionTypes.map((p) => [norm(p.name), p]),
  );
  const editais = new Map(ctx.editais.map((e) => [norm(e.code), e]));
  const admins = new Map(
    ctx.admins.filter((a) => a.email).map((a) => [norm(a.email!), a]),
  );
  const statusByText = new Map<string, AssignmentStatus>();
  for (const status of ASSIGNMENT_STATUSES) {
    statusByText.set(norm(ASSIGNMENT_STATUS_LABELS[status]), status);
    statusByText.set(norm(status), status);
  }

  // Para achar repetidos dentro do próprio arquivo.
  const seenCpfEdital = new Set<string>();
  const nameByCpf = new Map<string, string>();

  for (const { line, values: v } of rows) {
    const before = issues.length;
    const fail = (field: ColumnKey, message: string) =>
      issues.push({ line, field, message });

    // --- Bolsista ---
    if (v.nome_completo.length < 3 || v.nome_completo.length > 150) {
      fail("nome_completo", "Informe o nome completo (3 a 150 caracteres).");
    }
    const cpf = normalizeCpf(v.cpf);
    if (!isValidCpf(cpf)) fail("cpf", "CPF inválido.");
    if (v.email && !/^\S+@\S+\.\S+$/.test(v.email)) {
      fail("email", "E-mail inválido.");
    }

    // --- Convocação ---
    const institution = institutions.get(norm(v.instituicao));
    if (!institution) fail("instituicao", "Instituição não cadastrada.");

    let campusId: string | null = null;
    if (v.campus) {
      const campus = institution
        ? ctx.campuses.find(
            (c) =>
              c.institution_id === institution.id &&
              norm(c.name) === norm(v.campus),
          )
        : undefined;
      if (campus) campusId = campus.id;
      else if (institution) {
        fail("campus", "Campus não cadastrado nessa instituição.");
      }
    }

    const edital = editais.get(norm(v.edital));
    if (!edital) fail("edital", "Edital não cadastrado.");

    const positionType = positionTypes.get(norm(v.tipo_vaga));
    if (!positionType) fail("tipo_vaga", "Tipo de vaga não cadastrado.");

    if (v.titulo_vaga.length < 3 || v.titulo_vaga.length > 150) {
      fail("titulo_vaga", "Informe a vaga (3 a 150 caracteres).");
    }

    // Situação vazia = "Convocação pendente".
    let status: AssignmentStatus = "convocacao_pendente";
    if (v.situacao) {
      const found = statusByText.get(norm(v.situacao));
      if (found) status = found;
      else
        fail(
          "situacao",
          "Situação não reconhecida. Use o texto exato do sistema.",
        );
    }

    const responsible = admins.get(norm(v.responsavel_convocacao));
    if (!responsible) {
      fail(
        "responsavel_convocacao",
        "Responsável não encontrado. Use o e-mail de um administrador ativo.",
      );
    }

    const dates: Partial<Record<ColumnKey, string | null>> = {};
    for (const key of [
      "email_enviado_em",
      "prazo_resposta",
      "inicio_termo",
      "fim_termo",
    ] as const) {
      if (!v[key]) {
        dates[key] = null;
        continue;
      }
      const parsed = parseDate(v[key]);
      if (parsed) dates[key] = parsed;
      else fail(key, "Data inválida. Use DD/MM/AAAA.");
    }
    if (
      dates.inicio_termo &&
      dates.fim_termo &&
      dates.fim_termo < dates.inicio_termo
    ) {
      fail("fim_termo", "O fim da vigência não pode ser antes do início.");
    }

    // --- Repetições ---
    const existing = isValidCpf(cpf) ? ctx.existingByCpf.get(cpf) : undefined;
    if (isValidCpf(cpf)) {
      const knownName = nameByCpf.get(cpf);
      if (knownName !== undefined && knownName !== norm(v.nome_completo)) {
        fail(
          "nome_completo",
          "O mesmo CPF aparece no arquivo com nomes diferentes.",
        );
      }
      nameByCpf.set(cpf, norm(v.nome_completo));

      if (edital) {
        const key = `${cpf}|${edital.id}`;
        if (seenCpfEdital.has(key)) {
          fail(
            "cpf",
            "O mesmo CPF aparece mais de uma vez neste edital no arquivo.",
          );
        }
        seenCpfEdital.add(key);

        if (
          existing &&
          ctx.existingAssignments.has(`${existing.scholarId}|${edital.id}`)
        ) {
          fail("edital", "Este bolsista já tem convocação neste edital.");
        }
      }
    }

    if (issues.length > before) continue;

    valid.push({
      line,
      fullName: v.nome_completo,
      cpf,
      existingScholarId: existing?.scholarId ?? null,
      contact: {
        email: v.email || null,
        phone: v.telefone || null,
        bank_name: v.banco || null,
        account_type: v.tipo_conta || null,
        agency: v.agencia || null,
        account_number: v.conta || null,
        pix_key_type: v.tipo_chave_pix || null,
        pix_key: v.chave_pix || null,
      },
      assignment: {
        institution_id: institution!.id,
        campus_id: campusId,
        edital_id: edital!.id,
        position_type_id: positionType!.id,
        vacancy_title: v.titulo_vaga,
        status,
        called_by: responsible!.id,
        email_sent_at: dates.email_enviado_em ?? null,
        response_deadline: dates.prazo_resposta ?? null,
        term_start: dates.inicio_termo ?? null,
        term_end: dates.fim_termo ?? null,
      },
    });
  }

  return { valid, issues };
}
