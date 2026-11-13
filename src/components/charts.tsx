import type { ReactNode } from "react";
import { formatNumber } from "@/lib/format";
import {
  ASSIGNMENT_STATUS_LABELS,
  ASSIGNMENT_STATUSES,
  STATUS_GROUP,
  STATUS_GROUP_LABELS,
  STATUS_GROUPS,
  type StatusGroup,
} from "@/lib/roles";
import type { Breakdown, Summary } from "@/lib/dashboard";

/**
 * Peças dos gráficos (feitas em HTML/CSS puro, sem biblioteca).
 * Regras de acessibilidade:
 * - a cor nunca é o único canal: sempre há legenda, número escrito e "Ver como tabela";
 * - verde / cinza / vermelho = termo assinado / em andamento / desligamento.
 */

/** Cor de cada grupo de situação (classes do Tailwind definidas em globals.css). */
export const GROUP_BG: Record<StatusGroup, string> = {
  assinado: "bg-success",
  andamento: "bg-progress",
  encerrado: "bg-danger",
};

/** Cartão com um número grande (indicador). */
export function StatTile({
  label,
  value,
  note,
  accent,
}: {
  label: string;
  value: string;
  note?: string;
  accent: string;
}) {
  return (
    <div className="flex overflow-hidden rounded-xl border border-black/10 bg-white">
      <span aria-hidden="true" className={`w-1.5 shrink-0 ${accent}`} />
      <div className="p-4">
        <p className="text-sm font-medium text-black/70">{label}</p>
        <p className="mt-1 text-4xl font-semibold tracking-tight">{value}</p>
        {note && <p className="mt-1 text-sm text-black/70">{note}</p>}
      </div>
    </div>
  );
}

/** Legenda dos grupos (verde / cinza / vermelho), sempre com texto. */
export function Legend() {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
      {STATUS_GROUPS.map((group) => (
        <li key={group} className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={`size-3 rounded-sm ${GROUP_BG[group]}`}
          />
          {STATUS_GROUP_LABELS[group]}
        </li>
      ))}
    </ul>
  );
}

/** Cartão de um gráfico, com a versão em tabela dentro de "Ver como tabela". */
export function ChartCard({
  id,
  title,
  description,
  legend = true,
  table,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  legend?: boolean;
  table: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="rounded-2xl border border-black/10 bg-white p-5 sm:p-6"
    >
      <h2 id={id} className="text-lg font-semibold">
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-sm text-black/70">{description}</p>
      )}
      {legend && (
        <div className="mt-3">
          <Legend />
        </div>
      )}
      <div className="mt-4">{children}</div>
      <details className="mt-4 text-sm">
        <summary className="cursor-pointer font-semibold underline underline-offset-2">
          Ver como tabela
        </summary>
        <div className="mt-2 overflow-x-auto">{table}</div>
      </details>
    </section>
  );
}

/** Tabela simples (a versão acessível dos gráficos). */
export function DataTable({
  caption,
  headers,
  rows,
}: {
  caption: string;
  headers: string[];
  rows: string[][];
}) {
  return (
    <table className="w-full border-collapse text-left">
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th
              key={h}
              scope="col"
              className={`border-b border-black/30 px-2 py-1 font-semibold ${i > 0 ? "text-right" : ""}`}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row[0]}>
            {row.map((cell, i) => (
              <td
                key={i}
                className={`border-b border-black/10 px-2 py-1 ${i > 0 ? "text-right tabular-nums" : ""}`}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Uma barra por situação (as 8 situações), colorida pelo grupo. */
export function StatusBars({ summary }: { summary: Summary }) {
  const max = Math.max(
    1,
    ...ASSIGNMENT_STATUSES.map((s) => summary.byStatus[s]),
  );

  return (
    <ul className="space-y-3">
      {ASSIGNMENT_STATUSES.map((status) => {
        const value = summary.byStatus[status];
        const width = (value / max) * 100;
        return (
          <li
            key={status}
            className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 sm:grid-cols-[16rem_1fr_3rem]"
          >
            <span className="col-span-2 text-sm sm:col-span-1">
              {ASSIGNMENT_STATUS_LABELS[status]}
            </span>
            <div className="h-5">
              {value > 0 && (
                <div
                  className={`h-5 rounded-r-[4px] ${GROUP_BG[STATUS_GROUP[status]]}`}
                  style={{ width: `${width}%`, minWidth: 4 }}
                />
              )}
            </div>
            <span className="text-right text-sm font-semibold tabular-nums">
              {formatNumber(value)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** Barras empilhadas (verde | cinza | vermelho) para cada item de uma lista. */
export function StackedBars({ items }: { items: Breakdown[] }) {
  const max = Math.max(1, ...items.map((i) => i.total));

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item.id}
          className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 sm:grid-cols-[12rem_1fr_3rem]"
        >
          <span className="col-span-2 text-sm sm:col-span-1">{item.label}</span>
          <div className="h-5">
            <div
              className="flex h-5 gap-0.5"
              style={{ width: `${(item.total / max) * 100}%`, minWidth: 4 }}
            >
              {STATUS_GROUPS.filter((g) => item.counts[g] > 0).map(
                (g, idx, arr) => (
                  <div
                    key={g}
                    title={`${STATUS_GROUP_LABELS[g]}: ${item.counts[g]}`}
                    className={`${GROUP_BG[g]} ${idx === arr.length - 1 ? "rounded-r-[4px]" : ""}`}
                    style={{ flexGrow: item.counts[g], flexBasis: 0 }}
                  />
                ),
              )}
            </div>
          </div>
          <span className="text-right text-sm font-semibold tabular-nums">
            {formatNumber(item.total)}
          </span>
          <span className="sr-only">
            {STATUS_GROUPS.map(
              (g) => `${STATUS_GROUP_LABELS[g]}: ${item.counts[g]}. `,
            ).join("")}
          </span>
        </li>
      ))}
    </ul>
  );
}
