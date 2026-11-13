import { requireActiveUser } from "@/lib/auth";
import { NAV_ITEMS, ROLE_LABELS } from "@/lib/roles";
import { AppNav } from "./app-nav";

/**
 * Moldura de todas as telas internas.
 * requireActiveUser() barra quem não está logado ou ainda não foi aprovado.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireActiveUser();

  // O menu só mostra o que o perfil pode acessar.
  // (A proteção de verdade está em cada página e na RLS do banco.)
  const items = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(profile.role),
  );

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <a
        href="#conteudo"
        className="bg-brand-strong sr-only rounded-md px-3 py-2 font-semibold text-white focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50"
      >
        Ir para o conteúdo
      </a>

      <AppNav
        items={items.map(({ href, label }) => ({ href, label }))}
        userName={profile.full_name || profile.email || "Usuário"}
        roleLabel={ROLE_LABELS[profile.role]}
      />

      <main id="conteudo" className="flex-1 p-4 sm:p-8">
        {children}
      </main>
    </div>
  );
}
