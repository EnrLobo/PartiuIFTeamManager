/** Datas do banco chegam como AAAA-MM-DD; mostramos DD/MM/AAAA sem mexer em fuso. */
export function formatDate(date: string | null): string {
  if (!date) return "—";
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

export function formatTerm(start: string | null, end: string | null): string {
  if (!start && !end) return "—";
  return `${formatDate(start)} a ${formatDate(end)}`;
}

/** Número com separador de milhar no padrão brasileiro (1.234). */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}

/** Data e hora (ex.: histórico de situação), no horário de Brasília. */
export function formatDateTime(timestamp: string): string {
  return new Date(timestamp).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "short",
  });
}
