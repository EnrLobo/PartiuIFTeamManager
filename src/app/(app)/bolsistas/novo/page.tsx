import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getAssignmentLookups } from "@/lib/lookups";
import { ScholarForm } from "./scholar-form";

export const metadata: Metadata = { title: "Novo bolsista - Partiu IF" };

export default async function NewScholarPage() {
  // Só administrador cadastra; os demais voltam ao painel.
  const admin = await requireAdmin();
  const lookups = await getAssignmentLookups();

  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <Link href="/bolsistas" className="text-sm font-semibold underline">
          ← Voltar para a lista
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Novo bolsista
        </h1>
        <p className="mt-1 text-black/70">
          Cadastre a pessoa e a primeira convocação dela. Outras convocações (de
          outros editais) podem ser adicionadas depois, na ficha.
        </p>
      </header>

      <ScholarForm
        lookups={lookups}
        // Já vem com você como responsável e a situação inicial padrão.
        initialDefaults={{ called_by: admin.id, status: "convocacao_pendente" }}
      />
    </div>
  );
}
