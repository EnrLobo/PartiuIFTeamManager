import type { Metadata } from "next";
import Link from "next/link";
import { requireActiveUser } from "@/lib/auth";
import { getDashboardSummary } from "@/lib/dashboard-data";
import { percent, type Breakdown } from "@/lib/dashboard";
import { formatDateTime, formatNumber } from "@/lib/format";
import {
  ASSIGNMENT_STATUS_LABELS,
  ASSIGNMENT_STATUSES,
  STATUS_GROUP,
  STATUS_GROUPS,
  STATUS_GROUP_LABELS,
} from "@/lib/roles";
import {
  ChartCard,
  DataTable,
  StackedBars,
  StatTile,
  StatusBars,
} from "@/components/charts";

export const metadata: Metadata = { title: "Gráficos - Partiu IF" };

/** Linhas da versão em tabela de um gráfico por instituição/tipo/edital. */
function breakdownRows(items: Breakdown[]): string[][] {
  return items.map((i) => [
    i.label,
    ...STATUS_GROUPS.map((g) => formatNumber(i.counts[g])),
    formatNumber(i.total),
  ]);
}

const BREAKDOWN_HEADERS = (first: string) => [
  first,
  ...STATUS_GROUPS.map((g) => STATUS_GROUP_LABELS[g]),
  "Total",
];

export default async function GraficosPage() {
  const profile = await requireActiveUser();
  const result = await getDashboardSummary();

  if ("error" in result) {
    return (
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight">
          Visão geral da gestão
        </h1>
        <p role="alert" className="text-danger mt-4 font-semibold">
          {result.error}
        </p>
      </div>
    );
  }

  const { summary } = result;

  if (summary.total === 0) {
    return (
      <div className="max-w-3xl space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Visão geral da gestão
        </h1>
        <p className="text-black/70">
          Ainda não há convocações cadastradas, então não há o que mostrar.
        </p>
        {profile.role === "admin" && (
          <Link
            href="/bolsistas/novo"
            className="bg-brand-strong hover:bg-brand-dark inline-block rounded-md px-4 py-2 font-semibold text-white"
          >
            Cadastrar bolsista
          </Link>
        )}
      </div>
    );
  }

  // Nos gráficos por item mostramos só quem tem convocações; os demais vão numa lista.
  const withData = (items: Breakdown[]) => items.filter((i) => i.total > 0);
  const withoutData = (items: Breakdown[]) =>
    items.filter((i) => i.total === 0);
  const emptyEditais = withoutData(summary.byEdital);

  return (
    <div className="max-w-5xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">
          Visão geral da gestão
        </h1>
        <p className="mt-1 text-sm text-black/70">
          Atualizado em {formatDateTime(new Date().toISOString())}. Números
          agregados, sem dados pessoais.
        </p>
      </header>

      <section
        aria-label="Indicadores principais"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <StatTile
          label="Convocações"
          value={formatNumber(summary.total)}
          note={`${formatNumber(summary.scholars)} bolsistas`}
          accent="bg-brand"
        />
        <StatTile
          label="Termos assinados"
          value={formatNumber(summary.groups.assinado)}
          note={`${percent(summary.groups.assinado, summary.total)}% das convocações`}
          accent="bg-success"
        />
        <StatTile
          label="Em andamento"
          value={formatNumber(summary.groups.andamento)}
          note={`${percent(summary.groups.andamento, summary.total)}% das convocações`}
          accent="bg-progress"
        />
        <StatTile
          label="Solicitaram desligamento"
          value={formatNumber(summary.byStatus.solicitou_desligamento)}
          note={`${percent(summary.byStatus.solicitou_desligamento, summary.total)}% das convocações`}
          accent="bg-danger"
        />
        <StatTile
          label="Convocar próximo candidato"
          value={formatNumber(
            summary.byStatus.nao_manifestou_interesse_convocar_proximo,
          )}
          note="Não manifestaram interesse no prazo"
          accent="bg-danger"
        />
      </section>

      <ChartCard
        id="grafico-situacao"
        title="Convocações por situação"
        description="Quantas convocações estão em cada uma das 8 situações."
        table={
          <DataTable
            caption="Convocações por situação"
            headers={["Situação", "Grupo", "Convocações"]}
            rows={ASSIGNMENT_STATUSES.map((s) => [
              ASSIGNMENT_STATUS_LABELS[s],
              STATUS_GROUP_LABELS[STATUS_GROUP[s]],
              formatNumber(summary.byStatus[s]),
            ])}
          />
        }
      >
        <StatusBars summary={summary} />
      </ChartCard>

      <ChartCard
        id="grafico-instituicao"
        title="Convocações por instituição"
        table={
          <DataTable
            caption="Convocações por instituição"
            headers={BREAKDOWN_HEADERS("Instituição")}
            rows={breakdownRows(summary.byInstitution)}
          />
        }
      >
        <StackedBars items={withData(summary.byInstitution)} />
      </ChartCard>

      <ChartCard
        id="grafico-tipo-vaga"
        title="Convocações por tipo de vaga"
        table={
          <DataTable
            caption="Convocações por tipo de vaga"
            headers={BREAKDOWN_HEADERS("Tipo de vaga")}
            rows={breakdownRows(summary.byPositionType)}
          />
        }
      >
        <StackedBars items={withData(summary.byPositionType)} />
      </ChartCard>

      <ChartCard
        id="grafico-edital"
        title="Convocações por edital"
        table={
          <DataTable
            caption="Convocações por edital"
            headers={BREAKDOWN_HEADERS("Edital")}
            rows={breakdownRows(summary.byEdital)}
          />
        }
      >
        <StackedBars items={withData(summary.byEdital)} />
        {emptyEditais.length > 0 && (
          <p className="mt-3 text-sm text-black/70">
            Editais sem convocações:{" "}
            {emptyEditais.map((e) => e.label).join(", ")}.
          </p>
        )}
      </ChartCard>
    </div>
  );
}
