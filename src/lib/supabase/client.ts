import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente do Supabase para uso em componentes que rodam no NAVEGADOR
 * (arquivos com "use client"). Usa só a chave pública; quem protege
 * os dados é a RLS (segurança por linha) configurada no banco.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
