import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";
import type { UserRole } from "@/lib/roles";

/**
 * Camada de acesso a dados de autenticação (sempre no SERVIDOR).
 * Toda página protegida deve passar por uma destas funções:
 * a verificação de permissão NÃO pode ficar só no menu ou no navegador.
 */

export type Profile = Tables<"profiles">;
/** Perfil de uma conta ativa: aqui o papel (role) sempre existe. */
export type ActiveProfile = Profile & { role: UserRole };

/**
 * Quem está logado e qual é o perfil dele.
 * Usa getUser(), que confirma a sessão com o Supabase (mais seguro que só ler o cookie).
 * "cache" evita repetir a consulta várias vezes na mesma requisição.
 */
export const getSessionInfo = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, profile: null };

  // A RLS garante que a pessoa só consegue ler o próprio perfil (ou todos, se for admin).
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { user, profile };
});

/** Exige conta ATIVA com perfil definido. Caso contrário, redireciona. */
export async function requireActiveUser(): Promise<ActiveProfile> {
  const { user, profile } = await getSessionInfo();

  if (!user) redirect("/login");
  if (!profile || profile.status !== "ativo" || !profile.role) {
    redirect("/aguardando-aprovacao");
  }

  return profile as ActiveProfile;
}

/** Exige administrador ativo. Outros perfis voltam ao painel. */
export async function requireAdmin(): Promise<ActiveProfile> {
  const profile = await requireActiveUser();
  if (profile.role !== "admin") redirect("/painel");
  return profile;
}
