"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createScholar } from "../actions";
import { AssignmentFields } from "../assignment-fields";
import { ScholarFields, fieldsetClass, legendClass } from "../scholar-fields";
import { FormMessage, SubmitButton } from "@/components/form";
import type { AssignmentLookups } from "@/lib/lookups";

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
      <ScholarFields defaults={defaults} />

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
