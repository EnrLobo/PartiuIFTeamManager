"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createScholar } from "../actions";
import { AssignmentFields } from "../assignment-fields";
import { Field, FormMessage, SubmitButton } from "@/components/form";
import type { AssignmentLookups } from "@/lib/lookups";

const fieldsetClass =
  "space-y-4 rounded-2xl border border-black/10 bg-white p-4 sm:p-6";
const legendClass = "px-2 text-lg font-semibold";

export function ScholarForm({
  lookups,
  initialDefaults,
}: {
  lookups: AssignmentLookups;
  initialDefaults: Record<string, string>;
}) {
  const [state, formAction] = useActionState(createScholar, undefined);
  // Depois de um erro, o formulário volta com o que a pessoa tinha digitado.
  const defaults = state?.values ?? initialDefaults;

  return (
    <form action={formAction} className="space-y-6">
      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>Dados do bolsista</legend>
        <Field
          label="Nome completo"
          name="full_name"
          autoComplete="off"
          maxLength={150}
          defaultValue={defaults.full_name}
        />
      </fieldset>

      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>Dados sensíveis</legend>
        <p className="text-sm text-black/70">
          Estes dados são protegidos pela LGPD e só administradores podem
          vê-los.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="CPF"
            name="cpf"
            inputMode="numeric"
            autoComplete="off"
            maxLength={14}
            defaultValue={defaults.cpf}
            hint="Pode digitar com ou sem pontos e traço."
          />
          <Field
            label="E-mail"
            name="email"
            type="email"
            required={false}
            autoComplete="off"
            defaultValue={defaults.email}
          />
          <Field
            label="Telefone"
            name="phone"
            type="tel"
            required={false}
            autoComplete="off"
            maxLength={30}
            defaultValue={defaults.phone}
          />
          <Field
            label="Nome do banco"
            name="bank_name"
            required={false}
            maxLength={100}
            defaultValue={defaults.bank_name}
          />
          <Field
            label="Tipo de conta"
            name="account_type"
            required={false}
            maxLength={50}
            defaultValue={defaults.account_type}
          />
          <Field
            label="Agência"
            name="agency"
            required={false}
            maxLength={20}
            defaultValue={defaults.agency}
          />
          <Field
            label="Número da conta"
            name="account_number"
            required={false}
            maxLength={30}
            defaultValue={defaults.account_number}
          />
          <Field
            label="Tipo de chave PIX"
            name="pix_key_type"
            required={false}
            maxLength={50}
            defaultValue={defaults.pix_key_type}
          />
          <div className="sm:col-span-2">
            <Field
              label="Chave PIX"
              name="pix_key"
              required={false}
              maxLength={100}
              defaultValue={defaults.pix_key}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>Convocação</legend>
        <AssignmentFields lookups={lookups} defaults={defaults} />
      </fieldset>

      {state?.error && <FormMessage type="error">{state.error}</FormMessage>}
      {state?.values?.existing_id && (
        <p>
          <Link
            href={`/bolsistas/${state.values.existing_id}`}
            className="font-semibold underline"
          >
            Abrir a ficha do bolsista que já existe
          </Link>
        </p>
      )}

      <SubmitButton pendingText="Salvando..." className="px-6">
        Cadastrar bolsista
      </SubmitButton>
    </form>
  );
}
