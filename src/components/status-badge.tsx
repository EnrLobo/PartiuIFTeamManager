import {
  ASSIGNMENT_STATUS_LABELS,
  STATUS_GROUP,
  type AssignmentStatus,
  type StatusGroup,
} from "@/lib/roles";

/**
 * Cor do marcador de cada situação, por grupo (as mesmas cores dos gráficos):
 * verde = termo assinado, cinza = em andamento, vermelho = desligamento/sem interesse.
 * A cor é só um reforço: o texto da situação sempre aparece escrito,
 * então quem não distingue cores não perde informação.
 */
const DOT: Record<StatusGroup, string> = {
  assinado: "bg-success",
  andamento: "bg-progress",
  encerrado: "bg-danger",
};

export function StatusBadge({ status }: { status: AssignmentStatus }) {
  return (
    <span className="inline-flex items-start gap-2 rounded-md border border-black/30 bg-white px-2 py-1 text-sm">
      <span
        aria-hidden="true"
        className={`mt-1.5 size-2.5 shrink-0 rounded-full ${DOT[STATUS_GROUP[status]]}`}
      />
      <span>{ASSIGNMENT_STATUS_LABELS[status]}</span>
    </span>
  );
}
