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
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="titulo-lista" className="text-lg font-semibold">
            Campi cadastrados
          </h2>
          <p className="text-sm text-black/70">
            {campusList.length} campi em {institutionList.length} instituições
          </p>
        </div>

        <ul className="grid gap-4 md:grid-cols-2">
          {institutionList.map((institution) => {
            const items = campusList.filter(
              (campus) => campus.institution_id === institution.id,
            );
            return (
              <li
                key={institution.id}
                className="border-t-brand overflow-hidden rounded-2xl border border-t-4 border-black/10 bg-white"
              >
                <div className="flex items-start justify-between gap-3 p-4 pb-2">
                  <h3 className="text-base leading-snug font-semibold">
                    {institution.name}
                  </h3>
                  {/* Número escrito (não só cor) com a quantidade de campi. */}
                  <span className="bg-brand-soft shrink-0 rounded-full px-2.5 py-0.5 text-sm font-semibold">
                    {items.length} {items.length === 1 ? "campus" : "campi"}
                  </span>
                </div>
                {items.length === 0 ? (
                  <p className="px-4 pb-4 text-sm text-black/70">
                    Nenhum campus cadastrado.
                  </p>
                ) : (
                  <ul className="flex flex-wrap gap-2 px-4 pb-4">
                    {items.map((campus) => (
                      <li
                        key={campus.id}
                        className="bg-background rounded-full border border-black/20 px-3 py-1 text-sm"
                      >
                        {campus.name}
                      </li>
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
