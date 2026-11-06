"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/form-state";

/** Traduz os erros do Supabase para mensagens claras em português. */
function traduzirErro(error: AuthError): string {
  switch (error.code) {
    case "invalid_credentials":
      return "E-mail ou senha incorretos.";
    case "email_not_confirmed":
      return "Confirme seu e-mail antes de entrar. Procure a mensagem de confirmação na sua caixa de entrada (e no spam).";
    case "weak_password":
      return "Senha fraca. Use pelo menos 8 caracteres, misturando letras e números.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente de novo.";
    default:
      return "Não foi possível concluir a operação. Tente novamente em instantes.";
  }
}

export async function login(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Informe e-mail e senha.", values: { email } };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: traduzirErro(error), values: { email } };

  // O painel decide se a conta já está aprovada ou se vai para "aguardando".
  redirect("/painel");
}

export async function signup(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("password_confirm") ?? "");
  const values = { full_name: fullName, email };

  if (fullName.length < 3) {
    return { error: "Informe seu nome completo.", values };
  }
  if (!email.includes("@")) {
    return { error: "Informe um e-mail válido.", values };
  }
  if (password.length < 8) {
    return { error: "A senha precisa ter pelo menos 8 caracteres.", values };
  }
  if (password !== confirm) {
    return { error: "As senhas não são iguais.", values };
  }

  // Endereço do site, para o link de confirmação do e-mail voltar para cá.
  const headerList = await headers();
  const origin =
    headerList.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) return { error: traduzirErro(error), values };

  // Se a confirmação de e-mail estiver desligada no Supabase, a sessão já vem pronta.
  if (data.session) redirect("/aguardando-aprovacao");

  return {
    message:
      "Cadastro recebido! Enviamos um e-mail de confirmação. Depois de confirmar, sua conta ainda precisará ser aprovada por um administrador.",
  };
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
