import { createClient } from "@/lib/supabase/server";

/**
 * Listas usadas nos formulários de convocação (instituições, campi, tipos,
 * editais e administradores que podem ser "responsável pela convocação").
 * Só roda no servidor; as telas recebem o resultado já pronto.
 */
export async function getAssignmentLookups() {
  const supabase = await createClient();

  const [institutions, campuses, positionTypes, editais, admins] =
    await Promise.all([
      supabase.from("institutions").select("id, name").order("name"),
      supabase
        .from("campuses")
        .select("id, name, institution_id")
        .order("name"),
      supabase.from("position_types").select("id, name").order("name"),
      supabase.from("editais").select("id, code").order("code"),
      // O responsável pela convocação é necessariamente um administrador ativo.
      supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("role", "admin")
        .eq("status", "ativo")
        .order("full_name"),
    ]);

  return {
    institutions: institutions.data ?? [],
    campuses: campuses.data ?? [],
    positionTypes: positionTypes.data ?? [],
    editais: editais.data ?? [],
    admins: (admins.data ?? []).map((admin) => ({
      id: admin.id,
      label: admin.full_name || admin.email || "Administrador",
    })),
  };
}

export type AssignmentLookups = Awaited<
  ReturnType<typeof getAssignmentLookups>
>;
