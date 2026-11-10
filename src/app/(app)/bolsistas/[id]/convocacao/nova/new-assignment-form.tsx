"use client";

import { useActionState } from "react";
import { addAssignment } from "../../../actions";
import { AssignmentFields } from "../../../assignment-fields";
import { FormMessage, SubmitButton } from "@/components/form";
import type { AssignmentLookups } from "@/lib/lookups";

export function NewAssignmentForm({
  scholarId,
  lookups,
  initialDefaults,
}: {
  scholarId: string;
  lookups: AssignmentLookups;
  initialDefaults: Record<string, string>;
}) {
  const [state, formAction] = useActionState(addAssignment, undefined);
  const defaults = state?.values ?? initialDefaults;

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="scholar_id" value={scholarId} />

      <div className="rounded-2xl border border-black/10 bg-white p-4 sm:p-6">
        <AssignmentFields lookups={lookups} defaults={defaults} />
      </div>

      {state?.error && <FormMessage type="error">{state.error}</FormMessage>}

      <SubmitButton pendingText="Salvando..." className="px-6">
        Adicionar convocação
      </SubmitButton>
    </form>
  );
}
