-- =====================================================================
-- Migração 3: bolsistas, convocações e listas de apoio
--
-- Ideia central: separar a PESSOA (scholars) de cada CONVOCAÇÃO
-- (assignments). As abas da planilha (por tipo e por instituição)
-- viram filtros, não tabelas separadas.
--
-- Segurança (regra do projeto):
--   - Dados NÃO sensíveis: todo usuário ativo lê; só o administrador altera.
--   - Dados SENSÍVEIS (CPF, contatos, banco, PIX) e OBSERVAÇÕES:
--     só o administrador lê e altera.
--   - O banco protege por LINHA, não por coluna. Por isso o que é sensível
--     fica em tabelas separadas (scholar_sensitive e assignment_notes).
-- =====================================================================

-- 1) Situação da convocação (as 8 opções do documento de requisitos) ----
create type public.assignment_status as enum (
  'convocado_aguardando_manifestacao',        -- Convocado, aguardando manifestação de interesse
  'convocacao_pendente',                      -- Convocação Pendente
  'manifestou_interesse_enviar_termo',        -- Manifestou interesse, enviar termo de compromisso
  'termo_assinado',                           -- Termo de compromisso assinado
  'solicitou_desligamento',                   -- Solicitou desligamento
  'aguardando_indicacao_campus',              -- Aguardando indicação do campus
  'aguardando_assinatura_termo',              -- Aguardando assinatura do termo de compromisso
  'nao_manifestou_interesse_convocar_proximo' -- Não manifestou interesse no prazo, convocar próximo candidato
);

-- 2) Função auxiliar: "o usuário logado é uma conta ativa com perfil?" ---
create function private.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and status = 'ativo'
      and role is not null
  );
$$;

revoke execute on function private.is_active_user() from public, anon;
grant  execute on function private.is_active_user() to authenticated;

-- 3) Listas de apoio (a aba "Auxiliar" da planilha) ---------------------
create table public.institutions (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  created_at timestamptz not null default now()
);

create table public.campuses (
  id             uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions (id) on delete restrict,
  name           text not null,
  created_at     timestamptz not null default now(),
  unique (institution_id, name)
);

create table public.position_types (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  created_at timestamptz not null default now()
);

-- "code" é texto porque nem todo edital é número/ano (ex.: "Indicação").
create table public.editais (
  id         uuid primary key default gen_random_uuid(),
  code       text not null unique,
  created_at timestamptz not null default now()
);

-- 4) Bolsista (a pessoa) ------------------------------------------------
create table public.scholars (
  id         uuid primary key default gen_random_uuid(),
  full_name  text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Dados sensíveis: SOMENTE administrador (ver políticas abaixo).
create table public.scholar_sensitive (
  scholar_id     uuid primary key references public.scholars (id) on delete cascade,
  cpf            text not null unique,        -- somente os 11 dígitos, sem pontos e traço
  email          text,
  phone          text,
  bank_name      text,
  account_type   text,
  agency         text,
  account_number text,
  pix_key_type   text,
  pix_key        text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint scholar_sensitive_cpf_format check (cpf ~ '^[0-9]{11}$')
);

-- 5) Convocação (o vínculo da pessoa com um edital/vaga) -----------------
create table public.assignments (
  id                 uuid primary key default gen_random_uuid(),
  scholar_id         uuid not null references public.scholars (id) on delete restrict,
  edital_id          uuid not null references public.editais (id) on delete restrict,
  position_type_id   uuid not null references public.position_types (id) on delete restrict,
  vacancy_title      text not null,           -- "Vaga Convocação", ex.: Professor(a) de Matemática
  institution_id     uuid not null references public.institutions (id) on delete restrict,
  campus_id          uuid references public.campuses (id) on delete restrict, -- pode faltar até o campus indicar
  status             public.assignment_status not null default 'convocacao_pendente',
  email_sent_at      date,                    -- Envio do E-mail
  response_deadline  date,                    -- Prazo para resposta
  called_by          uuid references public.profiles (id) on delete set null, -- Responsável pela Convocação
  term_start         date,                    -- Início da Vigência
  term_end           date,                    -- Fim da Vigência
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  -- A mesma pessoa pode ter várias convocações, desde que de editais diferentes.
  unique (scholar_id, edital_id),
  constraint assignments_term_order check (term_end is null or term_start is null or term_end >= term_start)
);

comment on column public.assignments.called_by is
  'Responsável pela convocação: usuário do sistema (hoje, administrador; a tela só lista administradores).';

-- Observações: SOMENTE administrador.
create table public.assignment_notes (
  assignment_id uuid primary key references public.assignments (id) on delete cascade,
  notes         text not null default '',
  updated_at    timestamptz not null default now()
);

-- Histórico de mudanças de situação (preenchido automaticamente).
create table public.assignment_status_history (
  id            bigint generated always as identity primary key,
  assignment_id uuid not null references public.assignments (id) on delete cascade,
  from_status   public.assignment_status,     -- nulo na criação da convocação
  to_status     public.assignment_status not null,
  changed_by    uuid references public.profiles (id) on delete set null,
  changed_at    timestamptz not null default now()
);

-- 6) Índices (deixam filtros e gráficos rápidos) ------------------------
create index assignments_edital_idx        on public.assignments (edital_id);
create index assignments_position_type_idx on public.assignments (position_type_id);
create index assignments_institution_idx   on public.assignments (institution_id);
create index assignments_campus_idx        on public.assignments (campus_id);
create index assignments_status_idx        on public.assignments (status);
create index assignments_called_by_idx     on public.assignments (called_by);
create index status_history_assignment_idx on public.assignment_status_history (assignment_id);
create index status_history_changed_by_idx on public.assignment_status_history (changed_by);

-- 7) Atualiza "updated_at" automaticamente -------------------------------
create trigger scholars_set_updated_at
  before update on public.scholars
  for each row execute function public.set_updated_at();

create trigger scholar_sensitive_set_updated_at
  before update on public.scholar_sensitive
  for each row execute function public.set_updated_at();

create trigger assignments_set_updated_at
  before update on public.assignments
  for each row execute function public.set_updated_at();

create trigger assignment_notes_set_updated_at
  before update on public.assignment_notes
  for each row execute function public.set_updated_at();

-- 8) Histórico automático de situação ------------------------------------
create function public.log_assignment_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.assignment_status_history (assignment_id, from_status, to_status, changed_by)
    values (new.id, null, new.status, (select auth.uid()));
  elsif new.status is distinct from old.status then
    insert into public.assignment_status_history (assignment_id, from_status, to_status, changed_by)
    values (new.id, old.status, new.status, (select auth.uid()));
  end if;
  return new;
end;
$$;

revoke execute on function public.log_assignment_status() from public, anon, authenticated;

create trigger assignments_log_status
  after insert or update of status on public.assignments
  for each row execute function public.log_assignment_status();

-- 9) Segurança por linha (RLS) -------------------------------------------

-- Tabelas NÃO sensíveis: todo usuário ativo lê; só o administrador cria/altera/apaga.
do $$
declare
  t text;
begin
  foreach t in array array[
    'institutions', 'campuses', 'position_types', 'editais', 'scholars', 'assignments'
  ] loop
    execute format('alter table public.%I enable row level security', t);

    execute format($f$
      create policy "Ativos leem" on public.%I
        for select to authenticated
        using ((select private.is_active_user()))
    $f$, t);

    execute format($f$
      create policy "Admin insere" on public.%I
        for insert to authenticated
        with check ((select private.is_admin()))
    $f$, t);

    execute format($f$
      create policy "Admin altera" on public.%I
        for update to authenticated
        using ((select private.is_admin()))
        with check ((select private.is_admin()))
    $f$, t);

    execute format($f$
      create policy "Admin apaga" on public.%I
        for delete to authenticated
        using ((select private.is_admin()))
    $f$, t);
  end loop;
end;
$$;

-- Tabelas SENSÍVEIS: somente administrador, em tudo.
alter table public.scholar_sensitive enable row level security;
create policy "Admin gerencia dados sensiveis" on public.scholar_sensitive
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

alter table public.assignment_notes enable row level security;
create policy "Admin gerencia observacoes" on public.assignment_notes
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- Histórico: usuários ativos só leem. Ninguém escreve direto (só o gatilho do item 8).
alter table public.assignment_status_history enable row level security;
create policy "Ativos leem historico" on public.assignment_status_history
  for select to authenticated
  using ((select private.is_active_user()));

-- Visitantes sem login não acessam nada destas tabelas.
revoke all on
  public.institutions, public.campuses, public.position_types, public.editais,
  public.scholars, public.scholar_sensitive, public.assignments,
  public.assignment_notes, public.assignment_status_history
from anon;

-- 10) Dados iniciais (apenas o que consta no documento de requisitos) ----
insert into public.institutions (name) values
  ('IFSULDEMINAS'), ('IFTM'), ('IFF'), ('IFES'), ('IFSP'), ('IFMG'),
  ('IFRJ'), ('IFSUDESTEMG'), ('IFNMG'), ('CEFETMG'), ('CPII');

insert into public.position_types (name) values
  ('Coordenação'), ('Professor'), ('Equipe de Apoio'), ('Monitor'), ('AEE'),
  ('Avaliador de Manuscritos/Revisor');

insert into public.editais (code) values
  ('03/2026'), ('104/2026'), ('106/2026'), ('Indicação');
