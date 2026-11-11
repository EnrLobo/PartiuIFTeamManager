"use client";

import { useState } from "react";
import { Field, SelectField, TextareaField } from "@/components/form";
import { ASSIGNMENT_STATUSES, ASSIGNMENT_STATUS_LABELS } from "@/lib/roles";
import type { AssignmentLookups } from "@/lib/lookups";

/**
 * Campos da convocação, usados no cadastro de bolsista novo e em
 * "adicionar convocação". O campus muda conforme a instituição escolhida.
 */
export function AssignmentFields({
  lookups,
  defaults,
}: {
  lookups: AssignmentLookups;
  defaults: Record<string, string>;
}) {
  const [institutionId, setInstitutionId] = useState(
    defaults.institution_id ?? "",
  );

  const campusOptions = lookups.campuses
    .filter((campus) => campus.institution_id === institutionId)
    .map((campus) => ({ value: campus.id, label: campus.name }));

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <SelectField
        label="Edital"
        name="edital_id"
        placeholder="Escolha o edital"
        defaultValue={defaults.edital_id}
        options={lookups.editais.map((e) => ({ value: e.id, label: e.code }))}
      />

      <SelectField
        label="Tipo de vaga"
        name="position_type_id"
        placeholder="Escolha o tipo"
        defaultValue={defaults.position_type_id}
        options={lookups.positionTypes.map((p) => ({
          value: p.id,
          label: p.name,
        }))}
      />

      <div className="sm:col-span-2">
        <Field
          label="Vaga"
          name="vacancy_title"
          defaultValue={defaults.vacancy_title}
          maxLength={150}
          hint="Exemplo: Professor(a) de Matemática"
        />
      </div>

      <SelectField
        label="Instituição"
        name="institution_id"
        placeholder="Escolha a instituição"
        defaultValue={defaults.institution_id}
        onChange={setInstitutionId}
        options={lookups.institutions.map((i) => ({
          value: i.id,
          label: i.name,
        }))}
      />

      {/* "key" refaz a lista quando a instituição muda, limpando o campus anterior. */}
      <SelectField
        key={institutionId}
        label="Campus de atuação"
        name="campus_id"
        required={false}
        placeholder="A indicar"
        defaultValue={
          campusOptions.some((c) => c.value === defaults.campus_id)
            ? defaults.campus_id
            : ""
        }
        options={campusOptions}
        hint={
          institutionId && campusOptions.length === 0
            ? "Nenhum campus cadastrado para esta instituição. Cadastre em Campi."
            : undefined
        }
      />

      <div className="sm:col-span-2">
        <SelectField
          label="Situação"
          name="status"
          defaultValue={defaults.status ?? "convocacao_pendente"}
          options={ASSIGNMENT_STATUSES.map((value) => ({
            value,
            label: ASSIGNMENT_STATUS_LABELS[value],
          }))}
        />
      </div>

      <Field
        label="Envio do e-mail"
        name="email_sent_at"
        type="date"
        required={false}
        defaultValue={defaults.email_sent_at}
      />
      <Field
        label="Prazo para resposta"
        name="response_deadline"
        type="date"
        required={false}
        defaultValue={defaults.response_deadline}
      />

      <div className="sm:col-span-2">
        <SelectField
          label="Responsável pela convocação"
          name="called_by"
          placeholder="Escolha o responsável"
          defaultValue={defaults.called_by}
          options={lookups.admins.map((a) => ({ value: a.id, label: a.label }))}
        />
      </div>

      <Field
        label="Início da vigência"
        name="term_start"
        type="date"
        required={false}
        defaultValue={defaults.term_start}
      />
      <Field
        label="Fim da vigência"
        name="term_end"
        type="date"
        required={false}
        defaultValue={defaults.term_end}
      />

      <div className="sm:col-span-2">
        <TextareaField
          label="Observações"
          name="notes"
          maxLength={2000}
          defaultValue={defaults.notes}
          hint="Visíveis somente para administradores."
        />
      </div>
    </div>
  );
}
