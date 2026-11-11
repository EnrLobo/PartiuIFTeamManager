"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import type { FormState } from "@/lib/form-state";
import { isValidCpf, normalizeCpf } from "@/lib/cpf";
import { ASSIGNMENT_STATUSES, type AssignmentStatus } from "@/lib/roles";

/**
 * Cadastro, edição e mudança de situação de bolsistas e convocações.
 * SOMENTE administrador.
 * Toda validação é refeita aqui no servidor (a tela é só uma ajuda) e a RLS
 * do banco é a segunda trava.
 */

type Supabase = Awaited<ReturnType<typeof createClient>>;
type AssignmentInput = Omit<
  Database["public"]["Tables"]["assignments"]["Insert"],
  "scholar_id"
>;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const GENERIC_ERROR = "Não foi possível salvar. Tente novamente em instantes.";
const CPF_EXISTS = "Já existe um bolsista cadastrado com este CPF.";

/** Lê um campo do formulário como texto sem espaços nas pontas. */
function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

/** Texto vazio vira "nada" (null) no banco. */
function orNull(value: string): string | null {
  return value === "" ? null : value;
}

/** Devolve os valores digitados, para a tela não apagar o que a pessoa escreveu. */
function valuesFrom(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") values[key] = value;
  }
  return values;
}

/** Confere se é uma data de verdade no formato AAAA-MM-DD (rejeita 2026-02-31). */
function isRealDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

/** Valida os campos da convocação (iguais no cadastro novo e em "adicionar convocação"). */
async function parseAssignment(
  formData: FormData,
  supabase: Supabase,
): Promise<{ error: string } | { data: AssignmentInput; notes: string }> {
  const editalId = text(formData, "edital_id");
  const positionTypeId = text(formData, "position_type_id");
  const vacancyTitle = text(formData, "vacancy_title");
  const institutionId = text(formData, "institution_id");
  const campusId = text(formData, "campus_id");
  const status = text(formData, "status");
  const emailSentAt = text(formData, "email_sent_at");
  const responseDeadline = text(formData, "response_deadline");
  const calledBy = text(formData, "called_by");
  const termStart = text(formData, "term_start");
  const termEnd = text(formData, "term_end");
  const notes = text(formData, "notes");

  if (!UUID.test(editalId)) return { error: "Escolha o edital." };
  if (!UUID.test(positionTypeId)) return { error: "Escolha o tipo de vaga." };
  if (vacancyTitle.length < 3 || vacancyTitle.length > 150) {
    return { error: "Informe a vaga (entre 3 e 150 caracteres)." };
  }
  if (!UUID.test(institutionId)) return { error: "Escolha a instituição." };
  if (!ASSIGNMENT_STATUSES.includes(status as AssignmentStatus)) {
    return { error: "Escolha a situação da convocação." };
  }

  const dates: [string, string][] = [
    [emailSentAt, "envio do e-mail"],
    [responseDeadline, "prazo para resposta"],
    [termStart, "início da vigência"],
    [termEnd, "fim da vigência"],
  ];
  for (const [value, label] of dates) {
    if (value && !isRealDate(value))
      return { error: `Data inválida em: ${label}.` };
  }
  if (termStart && termEnd && termEnd < termStart) {
    return { error: "O fim da vigência não pode ser antes do início." };
  }
  if (notes.length > 2000) {
    return { error: "As observações podem ter no máximo 2000 caracteres." };
  }

  // O campus (se informado) precisa pertencer à instituição escolhida.
  if (campusId) {
    if (!UUID.test(campusId)) return { error: "Campus inválido." };
    const { data: campus } = await supabase
      .from("campuses")
      .select("id")
      .eq("id", campusId)
      .eq("institution_id", institutionId)
      .maybeSingle();
    if (!campus) {
      return { error: "O campus escolhido não pertence a essa instituição." };
    }
  }

  // O responsável pela convocação é obrigatório e precisa ser um administrador ativo.
  if (!UUID.test(calledBy)) {
    return { error: "Escolha o responsável pela convocação." };
  }
  const { data: responsible } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", calledBy)
    .eq("role", "admin")
    .eq("status", "ativo")
    .maybeSingle();
  if (!responsible) {
    return { error: "O responsável precisa ser um administrador ativo." };
  }

  return {
    data: {
      edital_id: editalId,
      position_type_id: positionTypeId,
      vacancy_title: vacancyTitle,
      institution_id: institutionId,
      campus_id: orNull(campusId),
      status: status as AssignmentStatus,
      email_sent_at: orNull(emailSentAt),
      response_deadline: orNull(responseDeadline),
      called_by: calledBy,
      term_start: orNull(termStart),
      term_end: orNull(termEnd),
    },
    notes,
  };
}

/**
 * Desfaz um cadastro que parou no meio (o banco não permite várias tabelas
 * numa só operação por aqui, então apagamos o que já foi criado).
 */
async function undo(
  supabase: Supabase,
  scholarId: string,
  assignmentId?: string,
) {
  if (assignmentId) {
    // Apagar a convocação leva junto observações e histórico.
    await supabase.from("assignments").delete().eq("id", assignmentId);
  }
  // Apagar o bolsista leva junto os dados sensíveis.
  await supabase.from("scholars").delete().eq("id", scholarId);
}

/** Valida nome e dados sensíveis do bolsista (iguais no cadastro e na edição). */
function parseScholarFields(formData: FormData):
  | { error: string }
  | {
      fullName: string;
      cpf: string;
      details: Omit<
        Database["public"]["Tables"]["scholar_sensitive"]["Insert"],
        "scholar_id" | "cpf"
      >;
    } {
  const fullName = text(formData, "full_name");
  const cpf = normalizeCpf(text(formData, "cpf"));
  const email = text(formData, "email");

  if (fullName.length < 3 || fullName.length > 150) {
    return { error: "Informe o nome completo do bolsista." };
  }
  if (!isValidCpf(cpf)) {
    return { error: "CPF inválido. Confira os números digitados." };
  }
  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    return { error: "E-mail do bolsista inválido." };
  }

  return {
    fullName,
    cpf,
    details: {
      email: orNull(email),
      phone: orNull(text(formData, "phone")),
      bank_name: orNull(text(formData, "bank_name")),
      account_type: orNull(text(formData, "account_type")),
      agency: orNull(text(formData, "agency")),
      account_number: orNull(text(formData, "account_number")),
      pix_key_type: orNull(text(formData, "pix_key_type")),
      pix_key: orNull(text(formData, "pix_key")),
    },
  };
}

/** Cadastra um bolsista novo junto com a primeira convocação. */
export async function createScholar(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const values = valuesFrom(formData);

  const scholarFields = parseScholarFields(formData);
  if ("error" in scholarFields) {
    return { error: scholarFields.error, values };
  }
  const { fullName, cpf, details } = scholarFields;

  const supabase = await createClient();
  const parsed = await parseAssignment(formData, supabase);
  if ("error" in parsed) return { error: parsed.error, values };

  // O CPF é a chave: se já existe, não duplicamos a pessoa.
  const { data: existing } = await supabase
    .from("scholar_sensitive")
    .select("scholar_id")
    .eq("cpf", cpf)
    .maybeSingle();
  if (existing) {
    return {
      error: CPF_EXISTS,
      values: { ...values, existing_id: existing.scholar_id },
    };
  }

  const { data: scholar, error: scholarError } = await supabase
    .from("scholars")
    .insert({ full_name: fullName })
    .select("id")
    .single();
  if (scholarError || !scholar) return { error: GENERIC_ERROR, values };

  const { error: sensitiveError } = await supabase
    .from("scholar_sensitive")
    .insert({ scholar_id: scholar.id, cpf, ...details });
  if (sensitiveError) {
    await undo(supabase, scholar.id);
    return {
      error: sensitiveError.code === "23505" ? CPF_EXISTS : GENERIC_ERROR,
      values,
    };
  }

  const { data: assignment, error: assignmentError } = await supabase
    .from("assignments")
    .insert({ ...parsed.data, scholar_id: scholar.id })
    .select("id")
    .single();
  if (assignmentError || !assignment) {
    await undo(supabase, scholar.id);
    return { error: GENERIC_ERROR, values };
  }

  if (parsed.notes) {
    const { error: notesError } = await supabase
      .from("assignment_notes")
      .insert({ assignment_id: assignment.id, notes: parsed.notes });
    if (notesError) {
      await undo(supabase, scholar.id, assignment.id);
      return { error: GENERIC_ERROR, values };
    }
  }

  revalidatePath("/bolsistas");
  redirect(`/bolsistas/${scholar.id}`);
}

/** Adiciona uma convocação (de outro edital) a um bolsista que já existe. */
export async function addAssignment(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const values = valuesFrom(formData);

  const scholarId = text(formData, "scholar_id");
  if (!UUID.test(scholarId)) return { error: "Bolsista inválido.", values };

  const supabase = await createClient();
  const parsed = await parseAssignment(formData, supabase);
  if ("error" in parsed) return { error: parsed.error, values };

  const { data: assignment, error } = await supabase
    .from("assignments")
    .insert({ ...parsed.data, scholar_id: scholarId })
    .select("id")
    .single();

  if (error || !assignment) {
    return {
      // 23505 = violação da regra "uma convocação por edital para cada pessoa".
      error:
        error?.code === "23505"
          ? "Este bolsista já tem uma convocação neste edital."
          : GENERIC_ERROR,
      values,
    };
  }

  if (parsed.notes) {
    const { error: notesError } = await supabase
      .from("assignment_notes")
      .insert({ assignment_id: assignment.id, notes: parsed.notes });
    if (notesError) {
      await supabase.from("assignments").delete().eq("id", assignment.id);
      return { error: GENERIC_ERROR, values };
    }
  }

  revalidatePath("/bolsistas");
  revalidatePath(`/bolsistas/${scholarId}`);
  redirect(`/bolsistas/${scholarId}`);
}

/** Edita o nome e os dados sensíveis de um bolsista. */
export async function updateScholar(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const values = valuesFrom(formData);

  const scholarId = text(formData, "scholar_id");
  if (!UUID.test(scholarId)) return { error: "Bolsista inválido.", values };

  const fields = parseScholarFields(formData);
  if ("error" in fields) return { error: fields.error, values };

  const supabase = await createClient();

  // O CPF não pode pertencer a outro bolsista.
  const { data: other } = await supabase
    .from("scholar_sensitive")
    .select("scholar_id")
    .eq("cpf", fields.cpf)
    .neq("scholar_id", scholarId)
    .maybeSingle();
  if (other) {
    return {
      error: CPF_EXISTS,
      values: { ...values, existing_id: other.scholar_id },
    };
  }

  const { error: sensitiveError } = await supabase
    .from("scholar_sensitive")
    .upsert(
      { scholar_id: scholarId, cpf: fields.cpf, ...fields.details },
      { onConflict: "scholar_id" },
    );
  if (sensitiveError) {
    return {
      error: sensitiveError.code === "23505" ? CPF_EXISTS : GENERIC_ERROR,
      values,
    };
  }

  const { data: updated, error: nameError } = await supabase
    .from("scholars")
    .update({ full_name: fields.fullName })
    .eq("id", scholarId)
    .select("id");
  if (nameError || !updated?.length) {
    return {
      error:
        "Os dados sensíveis foram salvos, mas não foi possível salvar o nome. Tente novamente.",
      values,
    };
  }

  revalidatePath("/bolsistas");
  revalidatePath(`/bolsistas/${scholarId}`);
  redirect(`/bolsistas/${scholarId}`);
}

/**
 * Edita todos os campos de uma convocação.
 * Se a situação mudar, o banco grava o histórico sozinho.
 */
export async function updateAssignment(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const values = valuesFrom(formData);

  const scholarId = text(formData, "scholar_id");
  const assignmentId = text(formData, "assignment_id");
  if (!UUID.test(scholarId) || !UUID.test(assignmentId)) {
    return { error: "Convocação inválida.", values };
  }

  const supabase = await createClient();
  const parsed = await parseAssignment(formData, supabase);
  if ("error" in parsed) return { error: parsed.error, values };

  const { data: updated, error } = await supabase
    .from("assignments")
    .update(parsed.data)
    .eq("id", assignmentId)
    .eq("scholar_id", scholarId)
    .select("id");
  if (error || !updated?.length) {
    return {
      error:
        error?.code === "23505"
          ? "Este bolsista já tem uma convocação neste edital."
          : GENERIC_ERROR,
      values,
    };
  }

  // Observações: com texto, grava ou atualiza; vazio, remove.
  const { error: notesError } = parsed.notes
    ? await supabase
        .from("assignment_notes")
        .upsert(
          { assignment_id: assignmentId, notes: parsed.notes },
          { onConflict: "assignment_id" },
        )
    : await supabase
        .from("assignment_notes")
        .delete()
        .eq("assignment_id", assignmentId);
  if (notesError) {
    return {
      error:
        "A convocação foi salva, mas não foi possível salvar as observações. Tente novamente.",
      values,
    };
  }

  revalidatePath("/bolsistas");
  revalidatePath(`/bolsistas/${scholarId}`);
  redirect(`/bolsistas/${scholarId}`);
}

/** Altera só a situação de uma convocação (atalho da ficha). O histórico é gravado pelo banco. */
export async function updateAssignmentStatus(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const scholarId = text(formData, "scholar_id");
  const assignmentId = text(formData, "assignment_id");
  const status = text(formData, "status");

  if (!UUID.test(scholarId) || !UUID.test(assignmentId)) {
    return { error: "Convocação inválida." };
  }
  if (!ASSIGNMENT_STATUSES.includes(status as AssignmentStatus)) {
    return { error: "Escolha uma situação válida." };
  }

  const supabase = await createClient();
  const { data: current } = await supabase
    .from("assignments")
    .select("status")
    .eq("id", assignmentId)
    .eq("scholar_id", scholarId)
    .maybeSingle();
  if (!current) return { error: "Convocação não encontrada." };

  if (current.status === status) {
    return { message: "A situação já era essa. Nada foi alterado." };
  }

  const { data: updated, error } = await supabase
    .from("assignments")
    .update({ status: status as AssignmentStatus })
    .eq("id", assignmentId)
    .eq("scholar_id", scholarId)
    .select("id");
  if (error || !updated?.length) return { error: GENERIC_ERROR };

  revalidatePath("/bolsistas");
  revalidatePath(`/bolsistas/${scholarId}`);
  return { message: "Situação atualizada." };
}
