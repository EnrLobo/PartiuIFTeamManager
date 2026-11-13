import { createClient } from "@/lib/supabase/server";
import { summarize, type AssignmentRow, type Summary } from "@/lib/dashboard";

/** O Supabase devolve no máximo 1000 linhas por consulta; buscamos em páginas. */
const PAGE_SIZE = 1000;
/** Trava de segurança contra um laço sem fim. */
const MAX_ROWS = 200_000;

const LOAD_ERROR = "Não foi possível carregar os números. Tente novamente.";

/**
 * Busca as convocações (só colunas sem dado pessoal) e calcula os números dos gráficos.
 * Roda no servidor, como o usuário logado: a RLS do banco decide o que ele pode ler.
 */
export async function getDashboardSummary(): Promise<
  { summary: Summary } | { error: string }
> {
  const supabase = await createClient();

  const [institutions, positionTypes, editais, count] = await Promise.all([
    supabase.from("institutions").select("id, name"),
    supabase.from("position_types").select("id, name"),
    supabase.from("editais").select("id, code"),
    supabase.from("assignments").select("id", { count: "exact", head: true }),
  ]);

  if (
    institutions.error ||
    positionTypes.error ||
    editais.error ||
    count.error
  ) {
    return { error: LOAD_ERROR };
  }

  // Páginas em ordem fixa (por id) para não repetir nem pular linhas.
  const total = count.count ?? 0;
  const rows: AssignmentRow[] = [];
  while (rows.length < total && rows.length < MAX_ROWS) {
    const { data, error } = await supabase
      .from("assignments")
      .select("scholar_id, status, institution_id, position_type_id, edital_id")
      .order("id")
      .range(rows.length, rows.length + PAGE_SIZE - 1);

    if (error) return { error: LOAD_ERROR };
    if (!data || data.length === 0) break;
    rows.push(...data);
  }

  return {
    summary: summarize(rows, {
      institutions: (institutions.data ?? []).map((i) => ({
        id: i.id,
        label: i.name,
      })),
      positionTypes: (positionTypes.data ?? []).map((p) => ({
        id: p.id,
        label: p.name,
      })),
      editais: (editais.data ?? []).map((e) => ({ id: e.id, label: e.code })),
    }),
  };
}
