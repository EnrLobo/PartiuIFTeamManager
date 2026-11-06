"use client";

import { useId, type ReactNode } from "react";
import { useFormStatus } from "react-dom";

/** Campo de texto com rótulo visível, ligado ao input (acessibilidade). */
export function Field({
  label,
  name,
  type = "text",
  autoComplete,
  defaultValue,
  minLength,
  hint,
}: {
  label: string;
  name: string;
  type?: "text" | "email" | "password";
  autoComplete?: string;
  defaultValue?: string;
  minLength?: number;
  hint?: string;
}) {
  const id = useId();
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        minLength={minLength}
        required
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="w-full rounded-md border border-black/50 bg-white px-3 py-2 text-base"
      />
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-black/70">
          {hint}
        </p>
      )}
    </div>
  );
}

/** Botão de envio: desativa e muda o texto enquanto o formulário é enviado. */
export function SubmitButton({
  children,
  pendingText = "Aguarde...",
  className = "",
}: {
  children: ReactNode;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`bg-brand text-ink rounded-md px-4 py-2 font-semibold hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {pending ? pendingText : children}
    </button>
  );
}

/**
 * Mensagem do formulário. "role" faz o leitor de tela anunciar o aviso.
 * Além da cor, usa um prefixo em texto (não depende só de cor).
 */
export function FormMessage({
  type,
  children,
}: {
  type: "error" | "success";
  children: ReactNode;
}) {
  const isError = type === "error";
  return (
    <p
      role={isError ? "alert" : "status"}
      className={`rounded-md border px-3 py-2 text-sm ${
        isError
          ? "border-danger text-danger bg-white"
          : "border-success bg-white text-black"
      }`}
    >
      <strong>{isError ? "Erro: " : "Pronto: "}</strong>
      {children}
    </p>
  );
}
