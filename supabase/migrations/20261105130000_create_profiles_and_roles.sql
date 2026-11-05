-- =====================================================================
-- Migração: perfis de usuário, papéis de acesso e aprovação de contas
-- Projeto: Partiu IF - Gestão de Equipe
--
-- O que faz:
--   1. Cria os tipos "user_role" (5 perfis) e "account_status" (pendente/ativo/bloqueado)
--   2. Cria a tabela "profiles" (1 linha por usuário que fez login)
--   3. Cria automaticamente o perfil quando alguém se cadastra (conta PENDENTE, sem papel)
--   4. Ativa a RLS e define quem pode ver/alterar cada coisa
--
-- Regra de negócio: qualquer pessoa pode se cadastrar, mas a conta nasce
-- bloqueada para uso (pendente, sem papel) até um administrador aprovar.
-- =====================================================================

-- 1. Tipos ------------------------------------------------------------
create type public.user_role as enum (
  'admin',                    -- administrador: vê e edita tudo
  'coordenador_gestao',       -- somente leitura de dados não sensíveis
  'coordenador_pedagogico',   -- somente leitura de dados não sensíveis
  'apoio_administrativo',     -- somente leitura de dados não sensíveis
  'apoio_secretaria'          -- somente leitura de dados não sensíveis
);

create type public.account_status as enum ('pendente', 'ativo', 'bloqueado');

-- 2. Tabela de perfis -------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  email       text,
  role        public.user_role,                                -- null enquanto pendente
  status      public.account_status not null default 'pendente',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  -- Conta ativa SEMPRE precisa ter um papel definido.
  constraint profiles_active_requires_role check (status <> 'ativo' or role is not null)
);

comment on table public.profiles is 'Perfil e permissão de cada usuário do sistema (1 por conta de login).';

-- 3. Funções auxiliares ----------------------------------------------

-- Atualiza "updated_at" a cada alteração.
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Cria o perfil (pendente) quando um usuário se cadastra no login.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Diz se o usuário logado é um administrador ATIVO.
-- "security definer" evita que a própria RLS de profiles entre em loop.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
      and status = 'ativo'
  );
$$;

-- Essas funções não devem ser chamáveis por qualquer pessoa via API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at()  from public, anon, authenticated;
revoke execute on function public.is_admin()        from public, anon;
grant  execute on function public.is_admin()        to authenticated;

-- 4. Segurança por linha (RLS) ---------------------------------------
alter table public.profiles enable row level security;

-- Cada usuário lê o próprio perfil (necessário para o menu mudar conforme o papel).
create policy "Usuário lê o próprio perfil"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()));

-- Administrador lê todos os perfis (tela de aprovação de usuários).
create policy "Admin lê todos os perfis"
  on public.profiles for select
  to authenticated
  using ((select public.is_admin()));

-- Somente o administrador altera perfis (aprovar, definir papel, bloquear).
create policy "Admin altera perfis"
  on public.profiles for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Não há política de INSERT nem DELETE de propósito:
--   - perfis só nascem pelo gatilho acima;
--   - apagar um perfil só acontece se a conta de login for apagada.
