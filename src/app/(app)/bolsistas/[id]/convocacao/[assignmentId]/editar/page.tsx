import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getAssignmentLookups } from "@/lib/lookups";
import { EditAssignmentForm } from "./edit-assignment-form";

export const metadata: Metadata = { title: "Editar convocação - Partiu IF" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditAssignmentPage({
  params,
}: {
  params: Promise<{ id: string; assignmentId: string }>;
}) {
  // Só administrador edita; os demais voltam ao painel.
  await requireAdmin();

  const { id, assignmentId } = await params;
  if (!UUID.test(id) || !UUID.test(assignmentId)) notFound();

  const supabase = await createClient();

  const [scholar, assignment, notes, others, lookups] = await Promise.all([
    supabase
      .from("scholars")
      .select("id, full_name")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("assignments")
      .select("*")
      .eq("id", assignmentId)
      .eq("scholar_id", id)
      .maybeSingle(),
    supabase
      .from("assignment_notes")
      .select("notes")
      .eq("assignment_id", assignmentId)
      .maybeSingle(),
    supabase
      .from("assignments")
      .select("edital_id")
      .eq("scholar_id", id)
      .neq("id", assignmentId),
    getAssignmentLookups(),
  ]);

  if (!scholar.data || !assignment.data) notFound();
  const current = assignment.data;

  // Uma convocação por edital: esconde os editais usados em OUTRAS convocações da pessoa.
  const usedByOthers = new Set((others.data ?? []).map((a) => a.edital_id));
  const availableEditais = lookups.editais.filter(
    (edital) => !usedByOthers.has(edital.id),
  );

  const initialDefaults: Record<string, string> = {
    edital_id: current.edital_id,
    position_type_id: current.position_type_id,
    vacancy_title: current.vacancy_title,
    institution_id: current.institution_id,
    campus_id: current.campus_id ?? "",
    status: current.status,
    email_sent_at: current.email_sent_at ?? "",
    response_deadline: current.response_deadline ?? "",
    // Se o responsável antigo não for mais um administrador ativo, o campo vem vazio
    // e o administrador precisa escolher um novo (o campo é obrigatório).
    called_by: current.called_by ?? "",
    term_start: current.term_start ?? "",
    term_end: current.term_end ?? "",
    notes: notes.data?.notes ?? "",
  };

  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <Link
          href={`/bolsistas/${id}`}
          className="text-sm font-semibold underline"
        >
          ← Voltar para a ficha
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Editar convocação
        </h1>
        <p className="mt-1 text-black/70">
          Bolsista: <strong>{scholar.data.full_name}</strong>
        </p>
      </header>

      <EditAssignmentForm
        scholarId={id}
        assignmentId={assignmentId}
        lookups={{ ...lookups, editais: availableEditais }}
        initialDefaults={initialDefaults}
      />
    </div>
  );
}
