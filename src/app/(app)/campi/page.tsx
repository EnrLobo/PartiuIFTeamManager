import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CampusForm } from "./campus-form";

export const metadata: Metadata = { title: "Campi - Partiu IF" };

export default async function CampusesPage() {
  // Só administrador cadastra campi; os demais voltam ao painel.
  await requireAdmin();

  const supabase = await createClient();
  const [institutions, campuses] = await Promise.all([
    supabase.from("institutions").select("id, name").order("name"),
    supabase.from("campuses").select("id, name, institution_id").order("name"),
  ]);

  const institutionList = institutions.data ?? [];
  const campusList = campuses.data ?? [];

  return (
    <div className="max-w-4xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Campi</h1>
        <p className="mt-1 text-black/70">
          Cadastre os campi de cada instituição. Eles ficam disponíveis na hora
          de cadastrar uma convocação.
        </p>
      </header>

      <CampusForm institutions={institutionList} />

      <section aria-labelledby="titulo-lista" className="space-y-4">
        <h2 id="titulo-lista" className="text-lg font-semibold">
          Campi cadastrados
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {institutionList.map((institution) => {
            const items = campusList.filter(
              (campus) => campus.institution_id === institution.id,
            );
            return (
              <li
                key={institution.id}
                className="rounded-2xl border border-black/10 bg-white p-4"
              >
                <h3 className="font-semibold">{institution.name}</h3>
                {items.length === 0 ? (
                  <p className="mt-1 text-sm text-black/70">
                    Nenhum campus cadastrado.
                  </p>
                ) : (
                  <ul className="mt-2 list-inside list-disc text-sm">
                    {items.map((campus) => (
                      <li key={campus.id}>{campus.name}</li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
