import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Para onde o link do e-mail de confirmação aponta.
 * Troca o código do link por uma sessão de login e leva a pessoa ao painel.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/painel`);
  }

  // Link inválido, vencido ou aberto em outro aparelho.
  return NextResponse.redirect(`${origin}/login?erro=link`);
}
