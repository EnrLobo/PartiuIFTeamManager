"use client";

import { useActionState } from "react";
import Link from "next/link";
import { updateAssignment } from "../../../../actions";
import { AssignmentFields } from "../../../../assignment-fields";
import { FormMessage, SubmitButton } from "@/components/form";
import type { AssignmentLookups } from "@/lib/lookups";

export function EditAssignmentForm({
  scholarId,
  assignmentId,
  lookups,
  initialDefaults,
}: {
  scholarId: string;
  assignmentId: string;
  lookups: AssignmentLookups;
  initialDefaults: Record<string, string>;
}) {
  const [state, formAction] = useActionState(updateAssignment, undefined);
  const defaults = state?.values ?? initialDefaults;

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="scholar_id" value={scholarId} />
      <input type="hidden" name="assignment_id" value={assignmentId} />

      <div className="rounded-2xl border border-black/10 bg-white p-4 sm:p-6">
        <AssignmentFields lookups={lookups} defaults={defaults} />
      </div>

      {state?.error && <FormMessage type="error">{state.error}</FormMessage>}

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
