import type { Enums } from "./supabase/database.types";

export type UserRole = Enums<"user_role">;
export type AccountStatus = Enums<"account_status">;
export type AssignmentStatus = Enums<"assignment_status">;

/** Nome amigável de cada perfil de acesso (o que aparece na tela). */
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  coordenador_gestao: "Coordenador de gestão",
  coordenador_pedagogico: "Coordenador pedagógico",
  apoio_administrativo: "Apoio administrativo",
  apoio_secretaria: "Apoio de secretaria",
};

export const STATUS_LABELS: Record<AccountStatus, string> = {
  pendente: "Pendente",
  ativo: "Ativo",
  bloqueado: "Bloqueado",
};

/** Situação da convocação/termo de compromisso (as 8 opções do documento de requisitos). */
export const ASSIGNMENT_STATUS_LABELS: Record<AssignmentStatus, string> = {
  convocado_aguardando_manifestacao:
    "Convocado, aguardando manifestação de interesse",
  convocacao_pendente: "Convocação pendente",
  manifestou_interesse_enviar_termo:
    "Manifestou interesse, enviar termo de compromisso",
  termo_assinado: "Termo de compromisso assinado",
  solicitou_desligamento: "Solicitou desligamento",
  aguardando_indicacao_campus: "Aguardando indicação do campus",
  aguardando_assinatura_termo: "Aguardando assinatura do termo de compromisso",
  nao_manifestou_interesse_convocar_proximo:
    "Não manifestou interesse no prazo, convocar próximo candidato",
};

export const ASSIGNMENT_STATUSES = Object.keys(
  ASSIGNMENT_STATUS_LABELS,
) as AssignmentStatus[];

/**
 * Grupos de situação, usados nos gráficos e nas cores dos marcadores.
 * A ordem do array é a ordem de empilhamento das barras: verde | cinza | vermelho.
 */
export type StatusGroup = "assinado" | "andamento" | "encerrado";

export const STATUS_GROUPS: StatusGroup[] = [
  "assinado",
  "andamento",
  "encerrado",
];

export const STATUS_GROUP_LABELS: Record<StatusGroup, string> = {
  assinado: "Termo assinado",
  andamento: "Em andamento",
  encerrado: "Desligamento ou sem interesse",
};

/** A qual grupo pertence cada situação da convocação. */
export const STATUS_GROUP: Record<AssignmentStatus, StatusGroup> = {
  termo_assinado: "assinado",
  solicitou_desligamento: "encerrado",
  nao_manifestou_interesse_convocar_proximo: "encerrado",
  convocado_aguardando_manifestacao: "andamento",
  convocacao_pendente: "andamento",
  manifestou_interesse_enviar_termo: "andamento",
  aguardando_indicacao_campus: "andamento",
  aguardando_assinatura_termo: "andamento",
};

export const ROLES = Object.keys(ROLE_LABELS) as UserRole[];
export const STATUSES = Object.keys(STATUS_LABELS) as AccountStatus[];

/**
 * Itens do menu lateral. Se "roles" estiver definido, só esses perfis veem o item.
 * Novos itens (Importação...) entram aqui nas próximas etapas.
 */
export type NavItem = { href: string; label: string; roles?: UserRole[] };

export const NAV_ITEMS: NavItem[] = [
  { href: "/painel", label: "Painel" },
  { href: "/bolsistas", label: "Bolsistas" },
  { href: "/graficos", label: "Gráficos" },
  { href: "/campi", label: "Campi", roles: ["admin"] },
  { href: "/editais", label: "Editais e vagas", roles: ["admin"] },
  { href: "/usuarios", label: "Usuários", roles: ["admin"] },
];
