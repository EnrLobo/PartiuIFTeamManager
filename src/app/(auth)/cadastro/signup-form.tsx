"use client";

import { useActionState } from "react";
import { signup } from "../actions";
import { Field, FormMessage, SubmitButton } from "@/components/form";

export function SignupForm() {
  const [state, formAction] = useActionState(signup, undefined);

  // Cadastro feito: mostra só a mensagem, sem o formulário.
  if (state?.message) {
    return <FormMessage type="success">{state.message}</FormMessage>;
  }

  return (
    <form action={formAction} className="space-y-4">
      <Field
        label="Nome completo"
        name="full_name"
        autoComplete="name"
        defaultValue={state?.values?.full_name}
      />
      <Field
        label="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={state?.values?.email}
      />
      <Field
        label="Senha"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        hint="Mínimo de 8 caracteres."
      />
      <Field
        label="Repita a senha"
        name="password_confirm"
        type="password"
        autoComplete="new-password"
        minLength={8}
      />
      {state?.error && <FormMessage type="error">{state.error}</FormMessage>}
      <SubmitButton pendingText="Enviando..." className="w-full">
        Criar conta
      </SubmitButton>
    </form>
  );
}
