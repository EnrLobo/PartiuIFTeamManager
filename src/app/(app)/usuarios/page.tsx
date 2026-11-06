import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { UserRow } from "./user-row";

export const metadata: Metadata = { title: "Usuários - Partiu IF" };

const STATUS_ORDER = { pendente: 0, ativo: 1, bloqueado: 2 } as const;

export default async function UsersPage() {
  // Só administrador entra aqui; os demais voltam ao painel.
  const admin = await requireAdmin();

  const supabase = await createClient();
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, status, created_at");

  // Pendentes primeiro (são os que precisam de ação), depois por nome.
  const users = [...(profiles ?? [])].sort(
    (a, b) =>
      STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
      (a.full_name ?? a.email ?? "").localeCompare(
        b.full_name ?? b.email ?? "",
        "pt-BR",
      ),
  );

  return (
    <div className="max-w-4xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
        <p className="mt-1 text-black/70">
          Aprove novas contas, defina o perfil de acesso de cada pessoa ou
          bloqueie o acesso.
        </p>
      </header>

      {error && (
        <p role="alert" className="text-danger font-medium">
          Erro: não foi possível carregar os usuários.
        </p>
      )}

      {users.length === 0 && !error ? (
        <p>Nenhum usuário cadastrado ainda.</p>
      ) : (
        <ul className="space-y-4">
          {users.map((u) => (
            <UserRow
              key={u.id}
              id={u.id}
              name={u.full_name || "Sem nome"}
              email={u.email ?? ""}
              createdAt={new Date(u.created_at).toLocaleDateString("pt-BR", {
                timeZone: "America/Sao_Paulo",
              })}
              role={u.role}
              status={u.status}
              isSelf={u.id === admin.id}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
