import type { Metadata } from "next";
import Link from "next/link";
import { requireActiveUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ROLE_LABELS } from "@/lib/roles";

export const metadata: Metadata = { title: "Painel - Partiu IF" };

export default async function DashboardPage() {
  const profile = await requireActiveUser();
  const firstName = (profile.full_name ?? "").split(" ")[0] || "bem-vindo(a)";

  // Só o administrador enxerga a fila de contas pendentes (a RLS também garante isso).
  let pendingCount = 0;
  if (profile.role === "admin") {
    const supabase = await createClient();
    const { count } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("status", "pendente");
    pendingCount = count ?? 0;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Olá, {firstName}!</h1>
        <p className="mt-1 text-black/70">
          Seu perfil: <strong>{ROLE_LABELS[profile.role]}</strong>
        </p>
      </header>

      {profile.role === "admin" && (
        <section
          aria-labelledby="titulo-pendentes"
          className="rounded-2xl border border-black/10 bg-white p-6"
        >
          <h2 id="titulo-pendentes" className="text-lg font-semibold">
            Contas aguardando aprovação
          </h2>
          <p className="mt-1 text-4xl font-bold">{pendingCount}</p>
          <Link
            href="/usuarios"
            className="bg-brand text-ink mt-4 inline-block rounded-md px-4 py-2 font-semibold hover:brightness-95"
          >
            Gerenciar usuários
          </Link>
        </section>
      )}

      <section className="rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-lg font-semibold">Em construção</h2>
        <p className="mt-1 text-black/70">
          Os cadastros de bolsistas, a importação dos formulários e os gráficos
          de visão geral serão liberados nas próximas etapas.
        </p>
      </section>
    </div>
  );
}
