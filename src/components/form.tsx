"use client";

import { useId, type ReactNode } from "react";
import { useFormStatus } from "react-dom";

const inputClass =
  "w-full rounded-md border border-black/50 bg-white px-3 py-2 text-base";

/** Campo de texto com rótulo visível, ligado ao input (acessibilidade). */
export function Field({
  label,
  name,
  type = "text",
  autoComplete,
  defaultValue,
  minLength,
  maxLength,
  required = true,
  inputMode,
  hint,
}: {
  label: string;
  name: string;
  type?: "text" | "email" | "password" | "date" | "tel";
  autoComplete?: string;
  defaultValue?: string;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  inputMode?: "text" | "numeric" | "tel" | "email";
  hint?: string;
}) {
  const id = useId();
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
        {!required && <span className="text-black/70"> (opcional)</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        minLength={minLength}
        maxLength={maxLength}
        required={required}
        inputMode={inputMode}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={inputClass}
      />
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-black/70">
          {hint}
        </p>
      )}
    </div>
  );
}

/** Lista de opções (select) com rótulo visível. */
export function SelectField({
  label,
  name,
  options,
  defaultValue,
  placeholder,
  required = true,
  onChange,
  hint,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
  /** Texto da primeira opção vazia (ex.: "Escolha..."). */
  placeholder?: string;
  required?: boolean;
  onChange?: (value: string) => void;
  hint?: string;
}) {
  const id = useId();
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
        {!required && <span className="text-black/70"> (opcional)</span>}
      </label>
      <select
        id={id}
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        onChange={
          onChange ? (event) => onChange(event.target.value) : undefined
        }
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={inputClass}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-black/70">
          {hint}
        </p>
      )}
    </div>
  );
}

/** Caixa de texto de várias linhas. */
export function TextareaField({
  label,
  name,
  defaultValue,
  maxLength,
  required = false,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  maxLength?: number;
  required?: boolean;
  hint?: string;
}) {
  const id = useId();
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
        {!required && <span className="text-black/70"> (opcional)</span>}
      </label>
      <textarea
        id={id}
        name={name}
        rows={4}
        defaultValue={defaultValue}
        maxLength={maxLength}
        required={required}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={inputClass}
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
