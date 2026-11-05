import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

/**
 * Cliente do Supabase para uso no SERVIDOR (Server Components, Server
 * Actions e Route Handlers). Lê a sessão do usuário nos cookies, então
 * as consultas respeitam a RLS conforme o perfil de quem está logado.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Chamado a partir de um Server Component, onde não é permitido
            // gravar cookies. Pode ser ignorado: a renovação da sessão será
            // feita no proxy (configurado junto com o login, na Etapa 3).
          }
        },
      },
    },
  );
}
