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
            className="bg-brand-strong hover:bg-brand-dark mt-4 inline-block rounded-md px-4 py-2 font-semibold text-white"
          >
            Gerenciar usuários
          </Link>
        </section>
      )}

      <section
        aria-labelledby="titulo-atalhos"
        className="rounded-2xl border border-black/10 bg-white p-6"
      >
        <h2 id="titulo-atalhos" className="text-lg font-semibold">
          Acesso rápido
        </h2>
        <ul className="mt-3 flex flex-wrap gap-3">
          <li>
            <Link
              href="/bolsistas"
              className="inline-block rounded-md border border-black/50 bg-white px-4 py-2 font-semibold hover:bg-black/5"
            >
              Ver bolsistas
            </Link>
          </li>
          <li>
            <Link
              href="/graficos"
              className="inline-block rounded-md border border-black/50 bg-white px-4 py-2 font-semibold hover:bg-black/5"
            >
              Ver gráficos
            </Link>
          </li>
        </ul>
        <p className="mt-4 text-sm text-black/70">
          Em breve: importação dos formulários de inscrição.
        </p>
      </section>
    </div>
  );
}
