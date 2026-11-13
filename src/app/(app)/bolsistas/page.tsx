import type { Metadata } from "next";
import Link from "next/link";
import { requireActiveUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  ASSIGNMENT_STATUSES,
  ASSIGNMENT_STATUS_LABELS,
  type AssignmentStatus,
} from "@/lib/roles";
import { StatusBadge } from "@/components/status-badge";
import { formatTerm } from "@/lib/format";

export const metadata: Metadata = { title: "Bolsistas - Partiu IF" };

const PAGE_SIZE = 25;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Pega um único valor do endereço (a URL pode trazer lista ou nada). */
function one(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

/** Impede que % e _ digitados na busca virem curingas do banco. */
function escapeLike(text: string): string {
  return text.replace(/[\\%_]/g, (char) => `\\${char}`);
}

export default async function ScholarsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // Todo perfil ativo pode ver a lista. Os dados sensíveis NÃO estão nestas tabelas.
  const profile = await requireActiveUser();
  const isAdmin = profile.role === "admin";

  const params = await searchParams;
  const q = one(params.q).slice(0, 100);
  const institutionId = UUID.test(one(params.instituicao))
    ? one(params.instituicao)
    : "";
  const positionTypeId = UUID.test(one(params.tipo)) ? one(params.tipo) : "";
  const editalId = UUID.test(one(params.edital)) ? one(params.edital) : "";
  const status = ASSIGNMENT_STATUSES.includes(
    one(params.situacao) as AssignmentStatus,
  )
    ? (one(params.situacao) as AssignmentStatus)
    : "";
  const page = Math.max(1, Number.parseInt(one(params.pagina), 10) || 1);

  const supabase = await createClient();

  // Listas para preencher os filtros.
  const [institutions, positionTypes, editais] = await Promise.all([
    supabase.from("institutions").select("id, name").order("name"),
    supabase.from("position_types").select("id, name").order("name"),
    supabase.from("editais").select("id, code").order("code"),
  ]);

  let query = supabase
    .from("assignments")
    .select(
      `id, scholar_id, vacancy_title, status, term_start, term_end,
       scholars!inner(full_name),
       edital:editais(code),
       position_type:position_types(name),
       institution:institutions(name),
       campus:campuses(name)`,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .order("id");

  if (q) query = query.ilike("scholars.full_name", `%${escapeLike(q)}%`);
  if (institutionId) query = query.eq("institution_id", institutionId);
  if (positionTypeId) query = query.eq("position_type_id", positionTypeId);
  if (editalId) query = query.eq("edital_id", editalId);
  if (status) query = query.eq("status", status);

  const from = (page - 1) * PAGE_SIZE;
  const { data, count, error } = await query.range(from, from + PAGE_SIZE - 1);

  const rows = data ?? [];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = Boolean(
    q || institutionId || positionTypeId || editalId || status,
  );

  /** Monta o endereço de outra página mantendo os filtros atuais. */
  function pageHref(target: number): string {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    if (institutionId) search.set("instituicao", institutionId);
    if (positionTypeId) search.set("tipo", positionTypeId);
    if (editalId) search.set("edital", editalId);
    if (status) search.set("situacao", status);
    if (target > 1) search.set("pagina", String(target));
    const text = search.toString();
    return text ? `/bolsistas?${text}` : "/bolsistas";
  }

  const fieldClass =
    "w-full rounded-md border border-black/50 bg-white px-3 py-2 text-base";

  return (
    <div className="max-w-6xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bolsistas</h1>
          <p className="mt-1 text-black/70">
            Convocações da equipe do Partiu IF. Use os filtros para encontrar
            rapidamente quem você procura.
          </p>
        </div>
        {isAdmin && (
          <div className="flex flex-wrap gap-3">
            <Link
              href="/bolsistas/importar"
              className="rounded-md border border-black/50 bg-white px-4 py-2 font-semibold hover:bg-black/5"
            >
              Importar planilha
            </Link>
            <Link
              href="/bolsistas/novo"
              className="bg-brand-strong hover:bg-brand-dark rounded-md px-4 py-2 font-semibold text-white"
            >
              Novo bolsista
            </Link>
          </div>
        )}
      </header>

      {/* Formulário simples (método GET): os filtros ficam no endereço da página. */}
      <form
        method="get"
        action="/bolsistas"
        className="grid gap-4 rounded-2xl border border-black/10 bg-white p-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <div className="sm:col-span-2 lg:col-span-3">
          <label htmlFor="q" className="block text-sm font-medium">
            Buscar por nome
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={q}
            autoComplete="off"
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="instituicao" className="block text-sm font-medium">
            Instituição
          </label>
          <select
            id="instituicao"
            name="instituicao"
            defaultValue={institutionId}
            className={fieldClass}
          >
            <option value="">Todas</option>
            {institutions.data?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="tipo" className="block text-sm font-medium">
            Tipo de vaga
          </label>
          <select
            id="tipo"
            name="tipo"
            defaultValue={positionTypeId}
            className={fieldClass}
          >
            <option value="">Todos</option>
            {positionTypes.data?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="edital" className="block text-sm font-medium">
            Edital
          </label>
          <select
            id="edital"
            name="edital"
            defaultValue={editalId}
            className={fieldClass}
          >
            <option value="">Todos</option>
            {editais.data?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.code}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2 lg:col-span-3">
          <label htmlFor="situacao" className="block text-sm font-medium">
            Situação
          </label>
          <select
            id="situacao"
            name="situacao"
            defaultValue={status}
            className={fieldClass}
          >
            <option value="">Todas</option>
            {ASSIGNMENT_STATUSES.map((value) => (
              <option key={value} value={value}>
                {ASSIGNMENT_STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-3">
          <button
            type="submit"
            className="bg-brand-strong hover:bg-brand-dark rounded-md px-4 py-2 font-semibold text-white"
          >
            Filtrar
          </button>
          {hasFilters && (
            <Link href="/bolsistas" className="font-semibold underline">
              Limpar filtros
            </Link>
          )}
        </div>
      </form>

      {error && (
        <p role="alert" className="text-danger font-medium">
          Erro: não foi possível carregar a lista. Tente novamente.
        </p>
      )}

      {!error && (
        <p role="status" className="text-black/70">
          {total === 1
            ? "1 convocação encontrada."
            : `${total} convocações encontradas.`}
        </p>
      )}

      {!error && rows.length === 0 ? (
        <section className="rounded-2xl border border-black/10 bg-white p-6">
          <h2 className="text-lg font-semibold">
            {hasFilters
              ? "Nenhum resultado para esses filtros"
              : "Ainda não há bolsistas cadastrados"}
          </h2>
          <p className="mt-1 text-black/70">
            {hasFilters
              ? "Tente remover algum filtro ou buscar por outro nome."
              : "Os bolsistas aparecerão aqui quando forem cadastrados ou importados pelo administrador."}
          </p>
        </section>
      ) : (
        <>
          {/* Celular: um cartão por convocação. */}
          <ul className="space-y-3 md:hidden">
            {rows.map((row) => (
              <li
                key={row.id}
                className="space-y-2 rounded-2xl border border-black/10 bg-white p-4"
              >
                <p className="font-semibold">
                  <Link
                    href={`/bolsistas/${row.scholar_id}`}
                    className="underline"
                  >
                    {row.scholars?.full_name}
                  </Link>
                </p>
                <p>{row.vacancy_title}</p>
                <p className="text-sm text-black/70">
                  {row.position_type?.name} · Edital {row.edital?.code}
                </p>
                <p className="text-sm text-black/70">
                  {row.institution?.name} ·{" "}
                  {row.campus?.name ?? "Campus a indicar"}
                </p>
                <p className="text-sm text-black/70">
                  Vigência: {formatTerm(row.term_start, row.term_end)}
                </p>
                <StatusBadge status={row.status} />
              </li>
            ))}
          </ul>

          {/* Telas maiores: tabela. */}
          <div className="hidden overflow-x-auto rounded-2xl border border-black/10 bg-white md:block">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Lista de convocações</caption>
              <thead className="border-b border-black/20 bg-black/5">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Bolsista
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Vaga
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Edital
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Instituição / Campus
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Vigência
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Situação
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {rows.map((row) => (
                  <tr key={row.id} className="align-top">
                    <th scope="row" className="px-4 py-3 font-semibold">
                      <Link
                        href={`/bolsistas/${row.scholar_id}`}
                        className="underline"
                      >
                        {row.scholars?.full_name}
                      </Link>
                    </th>
                    <td className="px-4 py-3">
                      {row.vacancy_title}
                      <span className="block text-black/70">
                        {row.position_type?.name}
                      </span>
                    </td>
                    <td className="px-4 py-3">{row.edital?.code}</td>
                    <td className="px-4 py-3">
                      {row.institution?.name}
                      <span className="block text-black/70">
                        {row.campus?.name ?? "Campus a indicar"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatTerm(row.term_start, row.term_end)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <nav
              aria-label="Paginação"
              className="flex items-center justify-between gap-3"
            >
              {page > 1 ? (
                <Link
                  href={pageHref(page - 1)}
                  className="rounded-md border border-black/50 bg-white px-4 py-2 font-semibold hover:bg-black/5"
                >
                  Anterior
                </Link>
              ) : (
                <span />
              )}
              <span className="text-sm text-black/70">
                Página {page} de {totalPages}
              </span>
              {page < totalPages ? (
                <Link
                  href={pageHref(page + 1)}
                  className="rounded-md border border-black/50 bg-white px-4 py-2 font-semibold hover:bg-black/5"
                >
                  Próxima
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
