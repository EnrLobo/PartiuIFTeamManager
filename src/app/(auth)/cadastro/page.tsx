import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionInfo } from "@/lib/auth";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "Cadastro - Partiu IF" };

export default async function SignupPage() {
  const { user } = await getSessionInfo();
  if (user) redirect("/painel");

  return (
    <>
      <h1 className="text-2xl font-bold">Criar conta</h1>
      <p className="mt-1 mb-6 text-black/70">
        Depois do cadastro, um administrador precisa aprovar seu acesso e
        definir seu perfil.
      </p>

      <SignupForm />

      <p className="mt-6 text-center text-sm">
        Já tem conta?{" "}
        <Link href="/login" className="font-semibold underline">
          Entrar
        </Link>
      </p>
    </>
  );
}
