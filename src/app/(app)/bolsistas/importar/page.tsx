import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { COLUMNS } from "@/lib/import/model";
import { ImportForm } from "./import-form";

export const metadata: Metadata = { title: "Importar planilha - Partiu IF" };

export default async function ImportPage() {
  // Só administrador importa.
  await requireAdmin();

  return (
    <div className="max-w-4xl space-y-6">
      <header>
        <Link
          href="/bolsistas"
          className="text-sm underline underline-offset-2"
        >
          ← Voltar para bolsistas
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Importar planilha
        </h1>
        <p className="mt-1 text-black/70">
          Cadastre várias convocações de uma vez. Cada linha da planilha é uma
          convocação. Se qualquer linha tiver erro, nada é importado.
        </p>
      </header>

      <section
        aria-labelledby="titulo-modelo"
        className="space-y-3 rounded-2xl border border-black/10 bg-white p-4 sm:p-6"
      >
        <h2 id="titulo-modelo" className="text-lg font-semibold">
          1. Baixar o modelo
        </h2>
        <p className="text-sm">
          Preencha o modelo e salve como CSV. Instituição, campus, edital e tipo
          de vaga precisam já estar cadastrados, com o nome igual ao do sistema
          (maiúsculas e acentos não importam). O responsável é o e-mail de um
          administrador ativo. Datas no formato DD/MM/AAAA.
        </p>
        {/* Download de arquivo: um <a> comum é o correto (o Link do Next é para páginas). */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/bolsistas/importar/modelo"
          className="inline-block rounded-md border border-black/50 bg-white px-4 py-2 font-semibold hover:bg-black/5"
        >
          Baixar modelo (CSV)
        </a>
        <details className="text-sm">
          <summary className="cursor-pointer font-semibold underline underline-offset-2">
            Ver as colunas
          </summary>
          <ul className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2">
            {COLUMNS.map((c) => (
              <li key={c.key}>
                <code>{c.key}</code>{" "}
                {c.required ? "(obrigatória)" : "(opcional)"}
              </li>
            ))}
          </ul>
        </details>
      </section>

      <ImportForm />
    </div>
  );
}
