import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getAssignmentLookups } from "@/lib/lookups";
import { NewAssignmentForm } from "./new-assignment-form";

export const metadata: Metadata = { title: "Nova convocação - Partiu IF" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function NewAssignmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await requireAdmin();

  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const supabase = await createClient();
  const { data: scholar } = await supabase
    .from("scholars")
    .select("id, full_name")
    .eq("id", id)
    .maybeSingle();
  if (!scholar) notFound();

  const [lookups, existing] = await Promise.all([
    getAssignmentLookups(),
    supabase.from("assignments").select("edital_id").eq("scholar_id", id),
  ]);

  // A mesma pessoa só pode ter uma convocação por edital: esconde os que já usou.
  const usedEditais = new Set((existing.data ?? []).map((a) => a.edital_id));
  const availableEditais = lookups.editais.filter(
    (edital) => !usedEditais.has(edital.id),
  );

  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <Link
          href={`/bolsistas/${scholar.id}`}
          className="text-sm font-semibold underline"
        >
          ← Voltar para a ficha
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Nova convocação
        </h1>
        <p className="mt-1 text-black/70">
          Bolsista: <strong>{scholar.full_name}</strong>
        </p>
      </header>

      {availableEditais.length === 0 ? (
        <p className="rounded-2xl border border-black/10 bg-white p-6">
          Este bolsista já tem convocação em todos os editais cadastrados.
        </p>
      ) : (
        <NewAssignmentForm
          scholarId={scholar.id}
          lookups={{ ...lookups, editais: availableEditais }}
          initialDefaults={{
            called_by: admin.id,
            status: "convocacao_pendente",
          }}
        />
      )}
    </div>
  );
}
