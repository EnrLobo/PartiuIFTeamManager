"use client";

import { useActionState } from "react";
import { createCampus } from "./actions";
import {
  Field,
  FormMessage,
  SelectField,
  SubmitButton,
} from "@/components/form";

export function CampusForm({
  institutions,
}: {
  institutions: { id: string; name: string }[];
}) {
  const [state, formAction] = useActionState(createCampus, undefined);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-black/10 bg-white p-4 sm:p-6"
    >
      <h2 className="text-lg font-semibold">Cadastrar campus</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Instituição"
          name="institution_id"
          placeholder="Escolha a instituição"
          defaultValue={state?.values?.institution_id}
          options={institutions.map((i) => ({ value: i.id, label: i.name }))}
        />
        <Field
          label="Nome do campus"
          name="name"
          autoComplete="off"
          maxLength={120}
          defaultValue={state?.values?.name}
        />
      </div>
      {state?.error && <FormMessage type="error">{state.error}</FormMessage>}
      {state?.message && (
        <FormMessage type="success">{state.message}</FormMessage>
      )}
      <SubmitButton pendingText="Salvando...">Cadastrar campus</SubmitButton>
    </form>
  );
}
