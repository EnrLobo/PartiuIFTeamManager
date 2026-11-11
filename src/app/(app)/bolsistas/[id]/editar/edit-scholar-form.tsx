"use client";

import { useActionState } from "react";
import Link from "next/link";
import { updateScholar } from "../../actions";
import { ScholarFields } from "../../scholar-fields";
import { FormMessage, SubmitButton } from "@/components/form";

export function EditScholarForm({
  scholarId,
  initialDefaults,
}: {
  scholarId: string;
  initialDefaults: Record<string, string>;
}) {
  const [state, formAction] = useActionState(updateScholar, undefined);
  const defaults = state?.values ?? initialDefaults;

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="scholar_id" value={scholarId} />

      <ScholarFields defaults={defaults} />

      {state?.error && <FormMessage type="error">{state.error}</FormMessage>}
      {state?.values?.existing_id && (
        <p>
          <Link
            href={`/bolsistas/${state.values.existing_id}`}
            className="font-semibold underline"
          >
            Abrir a ficha do bolsista que já tem este CPF
          </Link>
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton pendingText="Salvando..." className="px-6">
          Salvar alterações
        </SubmitButton>
        <Link
          href={`/bolsistas/${scholarId}`}
          className="font-semibold underline"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
