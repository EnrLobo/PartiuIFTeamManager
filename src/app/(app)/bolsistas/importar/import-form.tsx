"use client";

import { useRef, useState, useTransition } from "react";
import { previewImport, type PreviewResult } from "./actions";

/**
 * Envio da planilha e conferência.
 * O envio é feito por código (e não pelo "action" do formulário) para o arquivo
 * continuar escolhido depois da conferência.
 */
export function ImportForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<PreviewResult | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(async () => {
      try {
        setResult(await previewImport(data));
      } catch {
        setResult({
          fatal: "Não foi possível conferir o arquivo. Tente novamente.",
        });
      }
    });
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl border border-black/10 bg-white p-4 sm:p-6"
      >
        <h2 className="text-lg font-semibold">2. Conferir a planilha</h2>
        <div>
          <label htmlFor="arquivo" className="block font-medium">
            Arquivo CSV
          </label>
          <input
            ref={inputRef}
            id="arquivo"
            name="arquivo"
            type="file"
            accept=".csv,text/csv"
            required
            onChange={() => setResult(null)}
            className="mt-1 block w-full rounded-md border border-black/50 bg-white p-2"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="bg-brand-strong hover:bg-brand-dark rounded-md px-4 py-2 font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Conferindo..." : "Conferir planilha"}
        </button>
      </form>

      <div aria-live="polite">{result && <Report result={result} />}</div>
    </div>
  );
}

function Report({ result }: { result: PreviewResult }) {
  if (result.fatal !== undefined) {
    return (
      <p
        role="alert"
        className="border-danger rounded-md border bg-white p-4 font-semibold"
      >
        {result.fatal}
      </p>
    );
  }

  const hasIssues = result.issues.length > 0;

  return (
    <section className="space-y-4 rounded-2xl border border-black/10 bg-white p-4 sm:p-6">
      <h2 className="text-lg font-semibold">Resultado da conferência</h2>

      {hasIssues ? (
        <p role="alert" className="font-semibold">
          <span aria-hidden="true">✖ </span>
          {result.issues.length} problema(s) encontrado(s). Nada será importado
          até você corrigir a planilha e conferir de novo.
        </p>
      ) : (
        <p className="font-semibold">
          <span aria-hidden="true">✔ </span>
          Tudo certo: {result.totalRows} linha(s) prontas.
        </p>
      )}

      <ul className="list-inside list-disc text-sm">
        <li>Linhas lidas: {result.totalRows}</li>
        <li>Bolsistas novos: {result.newScholars}</li>
        <li>Bolsistas que já existem (pelo CPF): {result.existingScholars}</li>
      </ul>

      {result.existingNames.length > 0 && (
        <p className="text-sm">
          Já cadastrados: {result.existingNames.join(", ")}. Na gravação, você
          escolherá se os dados deles são atualizados.
        </p>
      )}

      {hasIssues && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">
              Problemas encontrados na planilha
            </caption>
            <thead>
              <tr>
                <th scope="col" className="border-b border-black/30 px-2 py-1">
                  Linha
                </th>
                <th scope="col" className="border-b border-black/30 px-2 py-1">
                  Coluna
                </th>
                <th scope="col" className="border-b border-black/30 px-2 py-1">
                  Problema
                </th>
              </tr>
            </thead>
            <tbody>
              {result.issues.slice(0, 200).map((issue, i) => (
                <tr key={i}>
                  <td className="border-b border-black/10 px-2 py-1 tabular-nums">
                    {issue.line}
                  </td>
                  <td className="border-b border-black/10 px-2 py-1">
                    {issue.field}
                  </td>
                  <td className="border-b border-black/10 px-2 py-1">
                    {issue.message}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {result.issues.length > 200 && (
            <p className="mt-2 text-sm">
              Mostrando os 200 primeiros problemas de {result.issues.length}.
            </p>
          )}
        </div>
      )}

      {!hasIssues && (
        <p className="text-sm text-black/70">
          A gravação no banco será liberada na próxima etapa. Por enquanto, nada
          foi salvo.
        </p>
      )}
    </section>
  );
}
