"use client";

import { useActionState } from "react";
import { createEdital, createPositionType } from "./actions";
import { Field, FormMessage, SubmitButton } from "@/components/form";

/** Formulário de um cadastro simples (um campo de texto + botão). */
function SimpleForm({
  title,
  label,
  name,
  action,
  button,
}: {
  title: string;
  label: string;
  name: string;
  action: typeof createEdital;
  button: string;
}) {
  const [state, formAction] = useActionState(action, undefined);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-black/10 bg-white p-4 sm:p-6"
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      <Field
        label={label}
        name={name}
        autoComplete="off"
        maxLength={120}
        defaultValue={state?.values?.[name]}
      />
      {state?.error && <FormMessage type="error">{state.error}</FormMessage>}
      {state?.message && (
        <FormMessage type="success">{state.message}</FormMessage>
      )}
      <SubmitButton pendingText="Salvando...">{button}</SubmitButton>
    </form>
  );
}

export function EditalForm() {
  return (
    <SimpleForm
      title="Cadastrar edital"
      label="Edital (ex.: 03/2026 ou Indicação)"
      name="code"
      action={createEdital}
      button="Cadastrar edital"
    />
  );
}

export function PositionTypeForm() {
  return (
    <SimpleForm
      title="Cadastrar tipo de vaga"
      label="Tipo de vaga (ex.: Professor(a) de Matemática)"
      name="name"
      action={createPositionType}
      button="Cadastrar tipo de vaga"
    />
  );
}
