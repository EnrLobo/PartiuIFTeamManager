"use client";

import { useActionState } from "react";
import { updateUser } from "./actions";
import { SubmitButton } from "@/components/form";
import {
  ROLES,
  ROLE_LABELS,
  STATUSES,
  STATUS_LABELS,
  type AccountStatus,
  type UserRole,
} from "@/lib/roles";

type Props = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  role: UserRole | null;
  status: AccountStatus;
  isSelf: boolean;
};

const selectClass =
  "w-full rounded-md border border-black/50 bg-white px-3 py-2 text-base disabled:bg-black/5";

export function UserRow({
  id,
  name,
  email,
  createdAt,
  role,
  status,
  isSelf,
}: Props) {
  const [state, formAction] = useActionState(updateUser, undefined);

  return (
    <li className="rounded-2xl border border-black/10 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold">
            {name}
            {isSelf && <span className="text-black/70"> (você)</span>}
          </p>
          <p className="text-sm text-black/70">{email}</p>
          <p className="text-sm text-black/70">Cadastro em {createdAt}</p>
        </div>
        {/* A situação aparece em texto, não só na cor. */}
        <span className="rounded-full border border-black/40 px-3 py-1 text-sm font-semibold">
          {STATUS_LABELS[status]}
        </span>
      </div>

      <form
        action={formAction}
        className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      >
        <input type="hidden" name="id" value={id} />

        <div>
          <label htmlFor={`role-${id}`} className="block text-sm font-medium">
            Perfil
          </label>
          <select
            id={`role-${id}`}
            name="role"
            defaultValue={role ?? ""}
            disabled={isSelf}
            className={selectClass}
          >
            <option value="">Sem perfil</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`status-${id}`} className="block text-sm font-medium">
            Situação
          </label>
          <select
            id={`status-${id}`}
            name="status"
            defaultValue={status}
            disabled={isSelf}
            className={selectClass}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        {!isSelf && (
          <SubmitButton pendingText="Salvando...">Salvar</SubmitButton>
        )}
      </form>

      {state?.error && (
        <p role="alert" className="text-danger mt-3 text-sm font-medium">
          Erro: {state.error}
        </p>
      )}
      {state?.message && (
        <p role="status" className="mt-3 text-sm font-medium">
          {state.message}
        </p>
      )}
    </li>
  );
}
