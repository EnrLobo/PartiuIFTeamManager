import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { requireActiveUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ASSIGNMENT_STATUS_LABELS } from "@/lib/roles";
import { formatCpf } from "@/lib/cpf";
import { formatDate, formatDateTime, formatTerm } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";
import { StatusForm } from "./status-form";

export const metadata: Metadata = { title: "Ficha do bolsista - Partiu IF" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Um par "rótulo: valor" da ficha. */
function Info({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-sm text-black/70">{label}</dt>
      <dd className="font-medium break-words">{children || "—"}</dd>
    </div>
  );
}

export default async function ScholarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Todo perfil ativo vê a ficha; dados sensíveis e observações só o administrador.
  const profile = await requireActiveUser();
  const isAdmin = profile.role === "admin";

  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const supabase = await createClient();

  const { data: scholar } = await supabase
    .from("scholars")
    .select("id, full_name")
    .eq("id", id)
    .maybeSingle();
  if (!scholar) notFound();

  const { data: assignments } = await supabase
    .from("assignments")
    .select(
      `id, vacancy_title, status, email_sent_at, response_deadline, term_start, term_end,
       edital:editais(code),
       position_type:position_types(name),
       institution:institutions(name),
       campus:campuses(name),
       responsible:profiles!assignments_called_by_fkey(full_name, email)`,
    )
    .eq("scholar_id", id)
    .order("created_at", { ascending: false });

  const list = assignments ?? [];
  const ids = list.map((assignment) => assignment.id);

  // Dados sensíveis e observações: só o administrador (a RLS do banco também impede os demais).
  const sensitive = isAdmin
    ? (
        await supabase
          .from("scholar_sensitive")
          .select("*")
          .eq("scholar_id", id)
          .maybeSingle()
      ).data
    : null;

  const notes =
    isAdmin && ids.length > 0
      ? (
          await supabase
            .from("assignment_notes")
            .select("assignment_id, notes")
            .in("assignment_id", ids)
        ).data
      : null;
  const notesByAssignment = new Map(
    (notes ?? []).map((note) => [note.assignment_id, note.notes]),
  );

  const history =
    ids.length > 0
      ? (
          await supabase
            .from("assignment_status_history")
            .select(
              `id, assignment_id, from_status, to_status, changed_at,
               author:profiles!assignment_status_history_changed_by_fkey(full_name, email)`,
            )
            .in("assignment_id", ids)
            .order("changed_at", { ascending: false })
            .order("id", { ascending: false })
        ).data
      : null;

  return (
    <div className="max-w-4xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/bolsistas" className="text-sm font-semibold underline">
            ← Voltar para a lista
          </Link>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            {scholar.full_name}
          </h1>
        </div>
        {isAdmin && (
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/bolsistas/${scholar.id}/editar`}
              className="rounded-md border border-black/50 bg-white px-4 py-2 font-semibold hover:bg-black/5"
            >
              Editar dados
            </Link>
            <Link
              href={`/bolsistas/${scholar.id}/convocacao/nova`}
              className="bg-brand-strong hover:bg-brand-dark rounded-md px-4 py-2 font-semibold text-white"
            >
              Adicionar convocação
            </Link>
          </div>
        )}
      </header>

      {isAdmin && (
        <section
          aria-labelledby="titulo-sensiveis"
          className="rounded-2xl border border-black/10 bg-white p-4 sm:p-6"
        >
          <h2 id="titulo-sensiveis" className="text-lg font-semibold">
            Dados pessoais e bancários
          </h2>
          <p className="mt-1 text-sm text-black/70">
            Protegidos pela LGPD. Somente administradores veem estas
            informações.
          </p>
          {sensitive ? (
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Info label="CPF">{formatCpf(sensitive.cpf)}</Info>
              <Info label="E-mail">{sensitive.email}</Info>
              <Info label="Telefone">{sensitive.phone}</Info>
              <Info label="Banco">{sensitive.bank_name}</Info>
              <Info label="Tipo de conta">{sensitive.account_type}</Info>
              <Info label="Agência">{sensitive.agency}</Info>
              <Info label="Número da conta">{sensitive.account_number}</Info>
              <Info label="Tipo de chave PIX">{sensitive.pix_key_type}</Info>
              <Info label="Chave PIX">{sensitive.pix_key}</Info>
            </dl>
          ) : (
            <p className="mt-4">Nenhum dado sensível cadastrado.</p>
          )}
        </section>
      )}

      <section aria-labelledby="titulo-convocacoes" className="space-y-4">
        <h2 id="titulo-convocacoes" className="text-lg font-semibold">
          Convocações
        </h2>

        {list.length === 0 && <p>Este bolsista ainda não tem convocações.</p>}

        <ul className="space-y-4">
          {list.map((assignment) => {
            const entries = (history ?? []).filter(
              (item) => item.assignment_id === assignment.id,
            );
            const note = notesByAssignment.get(assignment.id);

            return (
              <li
                key={assignment.id}
                className="space-y-4 rounded-2xl border border-black/10 bg-white p-4 sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold">
                    {assignment.vacancy_title}
                  </h3>
                  <StatusBadge status={assignment.status} />
                </div>

                <dl className="grid gap-4 sm:grid-cols-2">
                  <Info label="Edital">{assignment.edital?.code}</Info>
                  <Info label="Tipo de vaga">
                    {assignment.position_type?.name}
                  </Info>
                  <Info label="Instituição">
                    {assignment.institution?.name}
                  </Info>
                  <Info label="Campus de atuação">
                    {assignment.campus?.name ?? "A indicar"}
                  </Info>
                  <Info label="Envio do e-mail">
                    {formatDate(assignment.email_sent_at)}
                  </Info>
                  <Info label="Prazo para resposta">
                    {formatDate(assignment.response_deadline)}
                  </Info>
                  <Info label="Vigência">
                    {formatTerm(assignment.term_start, assignment.term_end)}
                  </Info>
                  {isAdmin && (
                    <Info label="Responsável pela convocação">
                      {assignment.responsible?.full_name ??
                        assignment.responsible?.email}
                    </Info>
                  )}
                  {isAdmin && (
                    <div className="sm:col-span-2">
                      <Info label="Observações">
                        <span className="whitespace-pre-wrap">{note}</span>
                      </Info>
                    </div>
                  )}
                </dl>

                {isAdmin && (
                  <div className="space-y-3 rounded-xl border border-black/10 bg-black/5 p-4">
                    <StatusForm
                      assignmentId={assignment.id}
                      scholarId={scholar.id}
                      current={assignment.status}
                    />
                    <Link
                      href={`/bolsistas/${scholar.id}/convocacao/${assignment.id}/editar`}
                      className="inline-block font-semibold underline"
                    >
                      Editar convocação
                    </Link>
                  </div>
                )}

                <details>
                  <summary className="cursor-pointer font-semibold">
                    Histórico de situação ({entries.length})
                  </summary>
                  <ol className="mt-3 space-y-2 text-sm">
                    {entries.map((entry) => (
                      <li key={entry.id}>
                        <span className="text-black/70">
                          {formatDateTime(entry.changed_at)}
                        </span>{" "}
                        —{" "}
                        {entry.from_status
                          ? `${ASSIGNMENT_STATUS_LABELS[entry.from_status]} → `
                          : "Criada como "}
                        <strong>
                          {ASSIGNMENT_STATUS_LABELS[entry.to_status]}
                        </strong>
                        {isAdmin && entry.author && (
                          <span className="text-black/70">
                            {" "}
                            (por {entry.author.full_name ?? entry.author.email})
                          </span>
                        )}
                      </li>
                    ))}
                  </ol>
                </details>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
