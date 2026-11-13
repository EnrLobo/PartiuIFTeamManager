import {
  ASSIGNMENT_STATUSES,
  STATUS_GROUP,
  type AssignmentStatus,
  type StatusGroup,
} from "@/lib/roles";

/**
 * Contas dos gráficos. São funções puras (sem banco de dados), por isso
 * dá para testá-las com dados de exemplo.
 */

/** Só as colunas necessárias: nada de dado pessoal chega aqui. */
export type AssignmentRow = {
  scholar_id: string;
  status: AssignmentStatus;
  institution_id: string;
  position_type_id: string;
  edital_id: string;
};

/** Item de uma lista de apoio (instituição, tipo de vaga ou edital). */
export type Lookup = { id: string; label: string };

export type GroupCounts = Record<StatusGroup, number>;

/** Convocações de um item (ex.: uma instituição), divididas por grupo de situação. */
export type Breakdown = {
  id: string;
  label: string;
  counts: GroupCounts;
  total: number;
};

export type Summary = {
  total: number;
  /** Quantos bolsistas diferentes têm pelo menos uma convocação. */
  scholars: number;
  byStatus: Record<AssignmentStatus, number>;
  groups: GroupCounts;
  byInstitution: Breakdown[];
  byPositionType: Breakdown[];
  byEdital: Breakdown[];
};

function emptyCounts(): GroupCounts {
  return { assinado: 0, andamento: 0, encerrado: 0 };
}

/** Conta as convocações de cada item da lista, do maior para o menor total. */
function breakdown(
  rows: AssignmentRow[],
  items: Lookup[],
  pick: (row: AssignmentRow) => string,
): Breakdown[] {
  const map = new Map<string, Breakdown>();
  // Todos os itens entram, mesmo sem convocação (total 0).
  for (const item of items) {
    map.set(item.id, {
      id: item.id,
      label: item.label,
      counts: emptyCounts(),
      total: 0,
    });
  }

  for (const row of rows) {
    const id = pick(row);
    let entry = map.get(id);
    if (!entry) {
      // Não deveria acontecer (o banco garante o vínculo), mas nunca perdemos uma contagem.
      entry = {
        id,
        label: "Não identificado",
        counts: emptyCounts(),
        total: 0,
      };
      map.set(id, entry);
    }
    entry.counts[STATUS_GROUP[row.status]] += 1;
    entry.total += 1;
  }

  return [...map.values()].sort(
    (a, b) => b.total - a.total || a.label.localeCompare(b.label, "pt-BR"),
  );
}

export function summarize(
  rows: AssignmentRow[],
  lookups: {
    institutions: Lookup[];
    positionTypes: Lookup[];
    editais: Lookup[];
  },
): Summary {
  const byStatus = Object.fromEntries(
    ASSIGNMENT_STATUSES.map((status) => [status, 0]),
  ) as Record<AssignmentStatus, number>;
  const groups = emptyCounts();
  const scholars = new Set<string>();

  for (const row of rows) {
    byStatus[row.status] += 1;
    groups[STATUS_GROUP[row.status]] += 1;
    scholars.add(row.scholar_id);
  }

  return {
    total: rows.length,
    scholars: scholars.size,
    byStatus,
    groups,
    byInstitution: breakdown(
      rows,
      lookups.institutions,
      (r) => r.institution_id,
    ),
    byPositionType: breakdown(
      rows,
      lookups.positionTypes,
      (r) => r.position_type_id,
    ),
    byEdital: breakdown(rows, lookups.editais, (r) => r.edital_id),
  };
}

/** Porcentagem inteira (0 quando não há nada no total). */
export function percent(part: number, whole: number): number {
  return whole === 0 ? 0 : Math.round((part / whole) * 100);
}
