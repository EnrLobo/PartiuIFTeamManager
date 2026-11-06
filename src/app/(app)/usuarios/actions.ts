"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/form-state";
import {
  ROLES,
  STATUSES,
  type AccountStatus,
  type UserRole,
} from "@/lib/roles";

/**
 * Aprovar conta, definir perfil ou bloquear. SOMENTE administrador.
 * A checagem é refeita aqui no servidor (não basta esconder o botão),
 * e a RLS do banco é a segunda trava.
 */
export async function updateUser(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const admin = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!id) return { error: "Usuário não identificado." };
  if (role && !ROLES.includes(role as UserRole)) {
    return { error: "Perfil inválido." };
  }
  if (!STATUSES.includes(status as AccountStatus)) {
    return { error: "Situação inválida." };
  }
  // Evita o administrador se trancar para fora do sistema sem querer.
  if (id === admin.id) {
    return { error: "Você não pode alterar a sua própria conta por aqui." };
  }
  if (status === "ativo" && !role) {
    return { error: "Escolha um perfil antes de ativar a conta." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({
      role: (role || null) as UserRole | null,
      status: status as AccountStatus,
    })
    .eq("id", id)
    .select("id");

  if (error || !data?.length) {
    return { error: "Não foi possível salvar. Tente novamente." };
  }

  revalidatePath("/usuarios");
  return { message: "Salvo." };
}
