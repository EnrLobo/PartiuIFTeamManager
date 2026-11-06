import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionInfo } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar - Partiu IF" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  // Quem já está logado não precisa ver a tela de login.
  const { user } = await getSessionInfo();
  if (user) redirect("/painel");

  const { erro } = await searchParams;

  return (
    <>
      <h1 className="text-2xl font-bold">Entrar</h1>
      <p className="mt-1 mb-6 text-black/70">
        Use seu e-mail e senha para acessar o sistema.
      </p>

      {erro === "link" && (
        <p
          role="alert"
          className="border-danger text-danger mb-4 rounded-md border bg-white px-3 py-2 text-sm"
        >
          <strong>Aviso: </strong>
          não foi possível concluir pelo link do e-mail. Se você já confirmou
          seu e-mail, basta entrar com e-mail e senha.
        </p>
      )}

      <LoginForm />

      <p className="mt-6 text-center text-sm">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-semibold underline">
          Cadastre-se
        </Link>
      </p>
    </>
  );
}
