"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/form-state";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Cadastra um campus em uma instituição. SOMENTE administrador. */
export async function createCampus(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const institutionId = String(formData.get("institution_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const values = { institution_id: institutionId, name };

  if (!UUID.test(institutionId)) {
    return { error: "Escolha a instituição.", values };
  }
  if (name.length < 2 || name.length > 120) {
    return {
      error: "Informe o nome do campus (entre 2 e 120 caracteres).",
      values,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("campuses")
    .insert({ institution_id: institutionId, name });

  if (error) {
    return {
      // 23505 = já existe um campus com esse nome nessa instituição.
      error:
        error.code === "23505"
          ? "Esse campus já está cadastrado nessa instituição."
          : "Não foi possível salvar. Tente novamente em instantes.",
      values,
    };
  }

  revalidatePath("/campi");
  // Mantém a instituição escolhida e limpa o nome, para cadastrar o próximo campus.
  return {
    message: `Campus "${name}" cadastrado.`,
    values: { institution_id: institutionId },
  };
}
