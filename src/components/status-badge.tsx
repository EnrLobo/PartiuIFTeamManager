import { ASSIGNMENT_STATUS_LABELS, type AssignmentStatus } from "@/lib/roles";

/**
 * Cor do marcador de cada situação.
 * A cor é só um reforço: o texto da situação sempre aparece escrito,
 * então quem não distingue cores não perde informação.
 */
const DOT: Record<AssignmentStatus, string> = {
  termo_assinado: "bg-success",
  solicitou_desligamento: "bg-danger",
  nao_manifestou_interesse_convocar_proximo: "bg-danger",
  convocado_aguardando_manifestacao: "bg-brand",
  manifestou_interesse_enviar_termo: "bg-brand",
  aguardando_assinatura_termo: "bg-brand",
  convocacao_pendente: "bg-black/40",
  aguardando_indicacao_campus: "bg-black/40",
};

export function StatusBadge({ status }: { status: AssignmentStatus }) {
  return (
    <span className="inline-flex items-start gap-2 rounded-md border border-black/30 bg-white px-2 py-1 text-sm">
      <span
        aria-hidden="true"
        className={`mt-1.5 size-2.5 shrink-0 rounded-full ${DOT[status]}`}
      />
      <span>{ASSIGNMENT_STATUS_LABELS[status]}</span>
    </span>
  );
}
