import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatCpf } from "@/lib/cpf";
import { EditScholarForm } from "./edit-scholar-form";

export const metadata: Metadata = { title: "Editar bolsista - Partiu IF" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditScholarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Só administrador edita; os demais voltam ao painel.
  await requireAdmin();

  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const supabase = await createClient();
  const [scholar, sensitive] = await Promise.all([
    supabase
      .from("scholars")
      .select("id, full_name")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("scholar_sensitive")
      .select("*")
      .eq("scholar_id", id)
      .maybeSingle(),
  ]);
  if (!scholar.data) notFound();

  const data = sensitive.data;
  const initialDefaults: Record<string, string> = {
    full_name: scholar.data.full_name,
    cpf: data ? formatCpf(data.cpf) : "",
    email: data?.email ?? "",
    phone: data?.phone ?? "",
    bank_name: data?.bank_name ?? "",
    account_type: data?.account_type ?? "",
    agency: data?.agency ?? "",
    account_number: data?.account_number ?? "",
    pix_key_type: data?.pix_key_type ?? "",
    pix_key: data?.pix_key ?? "",
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
          Editar dados do bolsista
        </h1>
      </header>

      <EditScholarForm scholarId={id} initialDefaults={initialDefaults} />
    </div>
  );
}
