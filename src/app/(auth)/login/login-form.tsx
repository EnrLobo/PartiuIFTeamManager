"use client";

import { useActionState } from "react";
import { login } from "../actions";
import { Field, FormMessage, SubmitButton } from "@/components/form";

export function LoginForm() {
  const [state, formAction] = useActionState(login, undefined);

  return (
    <form action={formAction} className="space-y-4">
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
        autoComplete="current-password"
      />
      {state?.error && <FormMessage type="error">{state.error}</FormMessage>}
      <SubmitButton pendingText="Entrando..." className="w-full">
        Entrar
      </SubmitButton>
    </form>
  );
}
