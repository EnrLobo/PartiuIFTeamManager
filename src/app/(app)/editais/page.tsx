import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { EditalForm, PositionTypeForm } from "./catalog-form";

export const metadata: Metadata = { title: "Editais e vagas - Partiu IF" };

/** Lista de itens em etiquetas, com a quantidade escrita no título. */
function TagList({
  id,
  title,
  items,
}: {
  id: string;
  title: string;
  items: string[];
}) {
  return (
    <section
      aria-labelledby={id}
      className="border-t-brand rounded-2xl border border-t-4 border-black/10 bg-white p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 id={id} className="font-semibold">
          {title}
        </h3>
        <span className="bg-brand-soft shrink-0 rounded-full px-2.5 py-0.5 text-sm font-semibold">
          {items.length}
        </span>
      </div>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-black/70">Nada cadastrado.</p>
      ) : (
        <ul className="mt-3 flex flex-wrap gap-2">
          {items.map((item) => (
            <li
              key={item}
              className="bg-background rounded-full border border-black/20 px-3 py-1 text-sm"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function EditaisPage() {
  // Só administrador cadastra editais e tipos de vaga.
  await requireAdmin();

  const supabase = await createClient();
  const [editais, positionTypes] = await Promise.all([
    supabase.from("editais").select("id, code").order("code"),
    supabase.from("position_types").select("id, name").order("name"),
  ]);

  return (
    <div className="max-w-4xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Editais e vagas</h1>
        <p className="mt-1 text-black/70">
          Cadastre cada novo edital e os tipos de vaga. Eles ficam disponíveis
          nas convocações e na importação por planilha.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <EditalForm />
        <PositionTypeForm />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TagList
          id="lista-editais"
          title="Editais cadastrados"
          items={(editais.data ?? []).map((e) => e.code)}
        />
        <TagList
          id="lista-tipos"
          title="Tipos de vaga cadastrados"
          items={(positionTypes.data ?? []).map((p) => p.name)}
        />
      </div>
    </div>
  );
}
