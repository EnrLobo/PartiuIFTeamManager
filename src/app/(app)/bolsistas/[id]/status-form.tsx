"use client";

import { useActionState } from "react";
import { updateAssignmentStatus } from "../actions";
import { FormMessage, SelectField, SubmitButton } from "@/components/form";
import {
  ASSIGNMENT_STATUSES,
  ASSIGNMENT_STATUS_LABELS,
  type AssignmentStatus,
} from "@/lib/roles";

/** Atalho para alterar a situação de uma convocação direto na ficha. */
export function StatusForm({
  assignmentId,
  scholarId,
  current,
}: {
  assignmentId: string;
  scholarId: string;
  current: AssignmentStatus;
}) {
  const [state, formAction] = useActionState(updateAssignmentStatus, undefined);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="assignment_id" value={assignmentId} />
      <input type="hidden" name="scholar_id" value={scholarId} />

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-64 flex-1">
          <SelectField
            label="Alterar situação"
            name="status"
            defaultValue={current}
            options={ASSIGNMENT_STATUSES.map((value) => ({
              value,
              label: ASSIGNMENT_STATUS_LABELS[value],
            }))}
          />
        </div>
        <SubmitButton pendingText="Salvando...">Salvar situação</SubmitButton>
      </div>

      {state?.error && <FormMessage type="error">{state.error}</FormMessage>}
      {state?.message && (
        <FormMessage type="success">{state.message}</FormMessage>
      )}
    </form>
  );
}
