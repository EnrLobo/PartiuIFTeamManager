import type { Enums } from "./supabase/database.types";

export type UserRole = Enums<"user_role">;
export type AccountStatus = Enums<"account_status">;

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

export const ROLES = Object.keys(ROLE_LABELS) as UserRole[];
export const STATUSES = Object.keys(STATUS_LABELS) as AccountStatus[];

/**
 * Itens do menu lateral. Se "roles" estiver definido, só esses perfis veem o item.
 * Novos itens (Bolsistas, Importação, Gráficos...) entram aqui nas próximas etapas.
 */
export type NavItem = { href: string; label: string; roles?: UserRole[] };

export const NAV_ITEMS: NavItem[] = [
  { href: "/painel", label: "Painel" },
  { href: "/usuarios", label: "Usuários", roles: ["admin"] },
];
