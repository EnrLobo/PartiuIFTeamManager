"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/form-state";

/** Cadastra um edital (ex.: "03/2026" ou "Indicação"). SOMENTE administrador. */
export async function createEdital(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const code = String(formData.get("code") ?? "").trim();
  const values = { code };

  if (code.length < 2 || code.length > 60) {
    return {
      error: "Informe o edital (entre 2 e 60 caracteres).",
      values,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("editais").insert({ code });

  if (error) {
    return {
      // 23505 = já existe um edital com esse código.
      error:
        error.code === "23505"
          ? "Esse edital já está cadastrado."
          : "Não foi possível salvar. Tente novamente em instantes.",
      values,
    };
  }

  revalidatePath("/editais");
  return { message: `Edital "${code}" cadastrado.` };
}

/** Cadastra um tipo de vaga (ex.: "Professor(a) de Matemática"). SOMENTE administrador. */
export async function createPositionType(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const values = { name };

  if (name.length < 2 || name.length > 120) {
    return {
      error: "Informe o tipo de vaga (entre 2 e 120 caracteres).",
      values,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("position_types").insert({ name });

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "Esse tipo de vaga já está cadastrado."
          : "Não foi possível salvar. Tente novamente em instantes.",
      values,
    };
  }

  revalidatePath("/editais");
  return { message: `Tipo de vaga "${name}" cadastrado.` };
}
