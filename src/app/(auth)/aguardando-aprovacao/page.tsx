import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionInfo } from "@/lib/auth";
import { logout } from "../actions";

export const metadata: Metadata = { title: "Aguardando aprovação - Partiu IF" };

export default async function PendingPage() {
  const { user, profile } = await getSessionInfo();

  if (!user) redirect("/login");
  // Conta já aprovada: segue para o painel.
  if (profile?.status === "ativo" && profile.role) redirect("/painel");

  const blocked = profile?.status === "bloqueado";

  return (
    <>
      <h1 className="text-2xl font-bold">
        {blocked ? "Acesso bloqueado" : "Aguardando aprovação"}
      </h1>

      <p className="mt-3">
        {blocked
          ? "Seu acesso foi bloqueado por um administrador. Em caso de dúvida, fale com a equipe gestora do Partiu IF."
          : profile
            ? "Seu cadastro foi recebido. Um administrador precisa aprovar sua conta e definir seu perfil de acesso. Você poderá usar o sistema assim que isso acontecer."
            : "Sua conta ainda não tem um perfil no sistema. Fale com um administrador do Partiu IF."}
      </p>

      <p className="mt-3 text-sm text-black/70">
        Conectado como <strong>{user.email}</strong>.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        {/* Recarregar a página confere se a aprovação já saiu. */}
        {!blocked && (
          <a
            href="/aguardando-aprovacao"
            className="bg-brand-strong hover:bg-brand-dark rounded-md px-4 py-2 font-semibold text-white"
          >
            Verificar novamente
          </a>
        )}
        <form action={logout}>
          <button
            type="submit"
            className="rounded-md border border-black/50 bg-white px-4 py-2 font-semibold hover:bg-black/5"
          >
            Sair
          </button>
        </form>
      </div>
    </>
  );
}
