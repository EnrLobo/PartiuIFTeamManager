import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./database.types";

/** Rotas que podem ser abertas sem estar logado. */
const PUBLIC_PATHS = ["/login", "/cadastro", "/auth"];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

/**
 * Roda antes de cada página:
 * 1. Renova a sessão do usuário (o Supabase troca o token de tempos em tempos).
 * 2. Quem não está logado e tenta abrir uma página protegida vai para /login.
 *
 * A checagem de PERMISSÃO (quem pode ver o quê) fica em src/lib/auth.ts e na RLS;
 * aqui é só a "porta de entrada".
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getClaims() valida o token e renova a sessão quando necessário.
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = Boolean(data?.claims);

  if (!isLoggedIn && !isPublic(request.nextUrl.pathname)) {
    const redirectResponse = NextResponse.redirect(
      new URL("/login", request.url),
    );
    // Mantém os cookies renovados na resposta de redirecionamento.
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  return response;
}
